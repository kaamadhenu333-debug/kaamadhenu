import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Shield,
  LogIn,
  MapPin,
  CheckCircle2,
  Wallet,
  Banknote,
  PlusCircle,
} from "lucide-react";
import { useCartStore } from "../../../store/user/useCartStore";
import { useAuthStore } from "../../../store/auth/useAuthStore";
import { useAddressStore } from "../../../store/user/useAddressStore";
import { useOrderStore } from "../../../store/user/useOrderStore";
import { toast } from "react-toastify";

export default function CartPage() {
  const navigate = useNavigate();
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();
  const {
    cartData,
    cartItems,
    loading,
    cartTotal,
    clearCart,
    removeFromCart,
    updateCartItem,
    fetchCart,
  } = useCartStore();
  const { addresses, fetchAddresses } = useAddressStore();

  // --- NEW STATES FOR CHECKOUT ---
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'online' or 'cod'

  useEffect(() => {
    if (!user) {
      navigate("/products");
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [fetchCart, user, navigate, fetchAddresses]);

  useEffect(() => {
    setSelectedAddress(addresses[0]);
  }, [addresses]);

  const handleUpdateQuantity = async (item, quantity) => {
    await updateCartItem(item, quantity);
  };

  const handleRemoveItem = async (item) => {
    const pId = item.productId._id || item.productId;
    const vId = item.variantId;
    await removeFromCart(pId, vId);
  };

  const handleClearCart = async () => {
    if (window.confirm("Clear entire cart?")) {
      await clearCart();
    }
  };
  const handleAddAddress = () => {
    navigate("/profile");
  };

  /// Handle checkout ///
  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    const orderData = {
      addressId: selectedAddress._id,
      paymentMethod: "COD",
    };

    const newOrder = await createOrder(orderData);

    if (newOrder) {
      // Navigate to the summary/confirmation page with the new order ID
      navigate(`/checkout/confirm/${newOrder._id}`);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );

  if (cartItems.length === 0)
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            {user
              ? "Your cart is empty. Start shopping!"
              : "Looks like you haven't added any products to your cart yet."}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/products")}
              className="w-full py-3.5 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/products")}
            className="flex items-center sm:text-xl gap-2 text-gray-600 hover:text-green-700"
          >
            <ArrowLeft className="w-5 h-5" /> Continue Shopping
          </button>
          <h1 className="text-2xl sm:text-md font-bold">Checkout</h1>
          <button
            onClick={handleClearCart}
            className="text-red-500 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Items & Address */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Address Selection Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <span className="text-xs text-gray-500">
                must select adrress to enable the confirm order
              </span>
              <div className="flex justify-between items-center mb-4 mt-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="text-green-600 w-5 h-5" /> Delivery Address
                </h3>
                <button
                  className="text-sm text-green-600 font-semibold flex items-center gap-1 hover:underline"
                  onClick={handleAddAddress}
                >
                  <PlusCircle className="w-4 h-4" /> Add New
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddress(addr)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddress?._id === addr._id
                        ? "border-green-500 bg-green-50/30"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {selectedAddress?._id === addr._id && (
                      <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-green-600" />
                    )}
                    <span className="text-xs font-bold uppercase text-gray-400">
                      {/* {addr.type} */}
                      Home
                    </span>
                    <p className="text-sm font-medium text-gray-800 mt-1">
                      {addr?.addressLine1 || ""}
                    </p>
                    <p className="text-sm text-gray-800 mt-1">
                      {addr?.phone || ""} - {addr?.email || ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {addr?.city || " "}- {addr?.state || " "} -{" "}
                      {addr?.pincode || " "}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. Cart Items */}
            <section className="space-y-4">
              <h3 className="text-lg font-bold px-2">Review Items</h3>
              {cartItems.map((item, index) => {
                const primaryImage =
                  item.productId.images?.find((img) => img.isPrimary) ||
                  item.productId.images?.[0];

                const vatinatDetails = item.productId.variants?.find(
                  (variant) => variant._id === item.variantId,
                );

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl p-4 flex gap-4 border border-gray-100 shadow-sm"
                  >
                    <img
                      src={`${primaryImage?.imagePath}`}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                      alt="product"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-gray-900">
                          {item.productId?.name}
                        </h4>
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Variant: {vatinatDetails?.variantName} (
                        {vatinatDetails?.quantityUnit})
                      </p>
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 border rounded-lg p-1">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity - 1)
                            }
                            className="p-1"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item, item.quantity + 1)
                            }
                            className="p-1"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-green-600">
                          ₹{item.discountedTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* Right Column: Payment & Summary */}
          <div className="lg:col-span-1 space-y-6">
            {/* 3. Payment Method Section */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet className="text-green-600 w-5 h-5" /> Payment Method
              </h3>
              <div className="space-y-3">
                {/* <button
                  onClick={() => setPaymentMethod("online")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "online"
                      ? "border-green-500 bg-green-50/30"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      className={
                        paymentMethod === "online"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    />
                    <span className="font-semibold text-sm text-gray-700">
                      Online Payment
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "online" ? "border-green-600 bg-green-600" : "border-gray-300"}`}
                  />
                </button> */}

                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === "cod"
                      ? "border-green-500 bg-green-50/30"
                      : "border-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote
                      className={
                        paymentMethod === "cod"
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    />
                    <span className="font-semibold text-sm text-gray-700">
                      Cash on Delivery
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${paymentMethod === "cod" ? "border-green-600 bg-green-600" : "border-gray-300"}`}
                  />
                </button>
              </div>
            </section>

            {/* 4. Order Summary */}
            <section className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-green-100">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>₹{cartData.actualAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="py-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-black text-green-600">
                    {/* ₹{cartTotal().toFixed(2)} */}₹
                    {cartData.discountedTotalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Inclusive of all taxes and GST
                </p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={!selectedAddress}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md ${
                  selectedAddress
                    ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-xl active:scale-95"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {paymentMethod === "online" ? <CreditCard /> : <Banknote />}
                {paymentMethod === "online"
                  ? "Pay & Place Order"
                  : "Confirm COD Order"}
              </button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Shield className="w-3 h-3 text-green-600" /> Secure SSL
                  Encrypted Payment
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
