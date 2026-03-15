/// This is the coockies based access and logged in /////
import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import Address from "../models/address.model.js";

// ===============================
// @desc    Register new user (Auto Login)
// @route   POST /api/users/register
// ===============================
export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        success: false,
      });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // ❌ DO NOT ACCEPT ROLE FROM BODY
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash: password, // pre-save hook hashes
      phone,
      role: "customer", // 🔒 FORCE ROLE
    });

    // 🔐 Generate Tokens
    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await generateRefreshToken(user._id, user.role);

    // 🍪 Set Cookies (Auto Login)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered & logged in successfully",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// ===============================
// @desc    Login user
// @route   POST /api/users/login
// ===============================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await generateRefreshToken(user._id, user.role);

    // 🍪 Set Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// ===============================
// @desc    Get all users (Admin Only)
// ===============================

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash -refreshToken");

    const usersWithData = await Promise.all(
      users.map(async (user) => {
        const cart = await Cart.findOne({ userId: user._id });

        const orders = await Order.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const addresses = await Address.find({ userId: user._id });

        return {
          ...user.toObject(),
          cart,
          orders,
          addresses,
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: usersWithData.length,
      users: usersWithData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// @desc    Get user by ID
// ===============================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
export const getAdminUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-passwordHash -refreshToken",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const cart = await Cart.findOne({ userId: user._id });

    const orders = await Order.find({ userId: user._id }).sort({
      createdAt: -1,
    });
    const adresses = await Address.find({ userId: user._id });

    res.status(200).json({
      success: true,
      data: {
        user,
        orders: orders || [],
        cart,
        adresses: [...adresses] || [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// @desc    Update user (Secure)
// ===============================
export const patchUser = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔐 Allow only owner or admin
    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this user",
      });
    }

    // ✅ Only allow these fields
    const allowedFields = ["firstName", "lastName", "email", "phone"];

    const updates = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // 🚫 If no valid fields provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-passwordHash -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// @desc    Delete user
// ===============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
