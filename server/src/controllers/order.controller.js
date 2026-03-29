import { validationResult } from "express-validator";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Address from "../models/address.model.js";

const convertToBaseUnit = (value, unit) => {
  const u = unit.toLowerCase();

  switch (u) {
    // Weight
    case "kg":
      return value * 1000; // kg → g
    case "g":
      return value;

    // Liquid
    case "l":
    case "liter":
      return value * 1000; // L → ml
    case "ml":
      return value;

    // Count
    case "piece":
    case "pieces":
    case "unit":
      return value;

    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
};

///////////////// Create New Order (Checkout) ////////////////////
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    const { addressId } = req.body;

    // 1. Get User's Cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId",
    );
    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ message: "Your cart is empty", success: false });
    }

    // 2. Get Shipping Address
    const address = await Address.findById(addressId);
    if (!address || address.userId.toString() !== req.user.id.toString()) {
      return res
        .status(404)
        .json({ message: "Shipping address not found", success: false });
    }

    const addressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address?.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };
    // 3. Prepare Items Snapshot and Update Stock
    const orderItems = [];
    for (const item of cart.items) {
      // 1. Fetch the absolute latest product data
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product ${item.productName} is no longer active`,
          success: false,
        });
      }

      // 2. Find the specific variant in the fresh product document
      const variant = product.variants.id(item.variantId);
      if (!variant) {
        return res
          .status(400)
          .json({ message: "Product variant not found", success: false });
      }
      //////// I need to implement the Deduction part ///////////
      // 3. REAL-TIME STOCK CHECK (Don't trust 'item.availableQuantity' from the cart)
      // if (variant.stockQuantity < item.quantity) {
      //   return res.status(400).json({
      //     message: `Insufficient stock for ${product.name}. Available: ${variant.stockQuantity}`,
      //     success: false,
      //   });
      // }

      // 4. Deduct the stock
      product.stock.quantity -= item.quantity * variant.stockQuantity;

      // 5. Push to the orderItems array for the Order model
      orderItems.push({
        productId: item.productId._id || item.productId, // Ensure we store the ID
        variantId: item.variantId,
        productName: product.name,
        variantName: variant.variantName,
        quantity: item.quantity,
        price: item.actualPrice,
      });

      // 6. Save the updated stock back to the Product collection
      await product.save();
    }

    // 4. Create the Order with initial "pending" stage
    const order = await Order.create({
      userId: req.user.id,
      addressSnapshot,
      items: orderItems,
      subTotal: cart.actualAmount,
      discountSource: cart.coupon?.code ? "COUPON_CODE" : null,
      discountAmount: cart.coupon?.discountAmount || 0,
      actualAmount: cart.discountedTotalPrice,
      paymentMethod: "COD",
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    // 5. Clear the Cart
    await Cart.findOneAndDelete({ userId: req.user.id });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
///////////////// Get My Orders (Customer) ////////////////////
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      orders: orders,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

///////////////// Get Order By ID ////////////////////
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "firstName lastName email",
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    // Authorization check: Only Admin or the Order owner can view
    if (
      req.user.role !== "admin" &&
      order.userId._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Access denied", success: false });
    }

    res.status(200).json({ success: true, order: order });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

///////////////// Update Order Status (Admin) ////////////////////
export const updateOrderStatus = async (req, res) => {
  try {
    // 1. Destructure with a fallback for paymentStatus if you want a hardcoded default
    // Or just handle it inside the logic
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "firstName lastName email phone",
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found", success: false });
    }

    // 2. Update Order Status if provided
    if (orderStatus) {
      order.orderStatus = orderStatus;

      // LOGIC: If order is delivered, it MUST be paid
      if (orderStatus === "delivered") {
        order.deliveredAt = Date.now();
        order.paymentStatus = "paid";
      } else {
        order.paymentStatus = "pending";
      }
    }

    // 3. Update Payment Status with a Default logic
    // if (paymentStatus) {
    //   order.paymentStatus = paymentStatus;
    // } else {
    //   // If paymentStatus is missing in the request, we ensure it's not undefined.
    //   // If the order is brand new or just confirmed, it stays at its current value
    //   // or "pending" if it was somehow empty.
    //   order.paymentStatus = order.paymentStatus || "pending";
    // }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order updated to ${order.orderStatus}`,
      order: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

///////////////// Get All Orders (Admin Only) ////////////////////
// Enhanced with filtering for stages
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { "addressSnapshot.fullName": { $regex: search, $options: "i" } },
        { _id: mongoose.isValidObjectId(search) ? search : null },
      ].filter((item) => item._id !== null || item["addressSnapshot.fullName"]);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate("userId", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalOrders: total,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

///////////////// Cancel Order (Admin or User) ////////////////////

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res
        .status(404)
        .json({ message: "Order not found", success: false });

    // Authorization: User can only cancel their own order; Admin can cancel any
    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized", success: false });
    }

    // Only allow cancellation if order hasn't shipped yet
    if (
      ["out_for_delivery", "delivered", "cancelled"].includes(order.orderStatus)
    )
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const variant = product.variants.id(item.variantId);
          if (variant) {
            variant.stockQuantity += item.quantity;
            // Note: We use markModified if nested paths aren't detecting changes
            product.markModified("variants");
            await product.save();
          }
        }
      }

    // Update the final stage to cancelled
    order.orderStatus = "cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled and stock restored successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
