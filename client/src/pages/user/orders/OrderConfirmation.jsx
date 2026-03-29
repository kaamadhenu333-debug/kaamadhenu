import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Package,
  MapPin,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useOrderStore } from "../../../store/user/useOrderStore";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { fetchOrderById, selectedOrder, updateOrderStatus, loading } =
    useOrderStore();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const getDeliveryEstimate = (updatedAt) => {
    const date = new Date(updatedAt);

    // Add 1 day
    date.setDate(date.getDate() + 1);

    // Format options: "Sunday, March 8"
    const options = { weekday: "long", month: "long", day: "numeric" };
    const formattedDate = date.toLocaleDateString("en-US", options);

    return {
      date: formattedDate,
      slot: "7:00 AM - 12:00 PM",
    };
  };
  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    if (selectedOrder?.orderStatus === "confirmed") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsConfirmed(true);
    }
  }, [selectedOrder]);
  const handleFinalConfirm = async () => {
    // Move the order from 'pending' to 'confirmed'
    const success = await updateOrderStatus(orderId, "confirmed");
    if (success) {
      setIsConfirmed(true);
    }
  };

  if (loading || !selectedOrder)
    return (
      <div className="p-20 text-center text-emerald-600">
        Loading Order Details...
      </div>
    );

  // SUCCESS PAGE
  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-[#FCFDFD] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl border border-emerald-100 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-semibold text-emerald-950 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-slate-500 mb-8 text-sm">
            Your fresh produce is being prepared. We've sent a receipt to your
            email.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-8 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Order ID
              </span>
              <span className="text-sm font-medium text-slate-700">
                #{selectedOrder._id.slice(-8)}
              </span>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">
                Expected Delivery
              </p>
              <span className="text-sm font-semibold text-slate-800">
                {getDeliveryEstimate(selectedOrder?.updatedAt).date}
              </span>
              <p className="text-sm font-medium text-slate-700">
                Between{" "}
                <span className="text-emerald-600 font-medium">
                  {getDeliveryEstimate(selectedOrder?.updatedAt).slot}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/profile/orders")}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-medium hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  // REVIEW PAGE (Before Confirm)
  return (
    <div className="min-h-screen bg-[#FCFDFD] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 mb-8 transition-colors"
        >
          <ArrowLeft size={18} />{" "}
          <span className="text-sm font-medium">Back to Cart</span>
        </button>

        <h1 className="text-3xl font-semibold text-emerald-950 mb-2">
          Review Your Order
        </h1>
        <p className="text-slate-500 mb-10">
          Please check your details before confirming harvest.
        </p>

        <div className="space-y-6">
          {/* Shipping Summary */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <MapPin className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-lg text-slate-800 mb-1">
                Delivery Address
              </h3>
              <p className="text-md text-slate-500 leading-relaxed">
                {selectedOrder.addressSnapshot.fullName} -{" "}
                {selectedOrder.addressSnapshot.phone}
                <br />
                {selectedOrder.addressSnapshot.addressLine1},{" "}
                {selectedOrder.addressSnapshot.city}-
                {selectedOrder.addressSnapshot.pincode}
              </p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-emerald-600" />
              <h3 className="font-medium text-lg text-slate-800">
                Order Summary
              </h3>
            </div>
            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-md"
                >
                  <span className="text-slate-600">
                    {item.productName}{" "}
                    <span className="text-slate-300">x{item.quantity}</span>
                  </span>
                  <span className="font-medium text-slate-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="font-semibold text-emerald-950">
                  Total Amount
                </span>
                <span className="text-xl font-bold text-emerald-700">
                  ₹{selectedOrder.actualAmount}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleFinalConfirm}
            className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
          >
            Confirm & Place Order <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
