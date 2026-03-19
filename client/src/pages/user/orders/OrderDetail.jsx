import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderStore } from "../../../store/user/useOrderStore";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Truck,
  ChevronRight,
} from "lucide-react";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedOrder, fetchOrderById, updateOrderStatus, loading } =
    useOrderStore();
  useEffect(() => {
    fetchOrderById(id);
  }, [id]);

  const handleFinalConfirm = async () => {
    // Move the order from 'pending' to 'confirmed'
    const success = await updateOrderStatus(selectedOrder?._id, {
      orderStatus: "confirmed",
    });
    if (success) {
      navigate(`/checkout/confirm/${selectedOrder?._id}`);
    }
  };

  if (loading || !selectedOrder)
    return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition-colors"
      >
        <ArrowLeft size={18} />{" "}
        <span className="text-md font-medium">Back to Orders</span>
      </button>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
          <p className="text-md text-slate-500">#{selectedOrder._id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400 uppercase font-bold">Status</p>
          <p className="text-emerald-600 font-semibold capitalize">
            {selectedOrder.orderStatus.replace("_", " ")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Shipping Address */}
        <div className="bg-white border-3 border-slate-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3 text-emerald-600">
            <MapPin size={24} />
            <h3 className="font-semibold text-slate-800">Shipping Address</h3>
          </div>
          <div className="text-md text-slate-600 leading-relaxed">
            <p className="font-bold text-slate-800">
              {selectedOrder.addressSnapshot.fullName}
            </p>
            <p>{selectedOrder.addressSnapshot.addressLine1}</p>
            {selectedOrder.addressSnapshot.addressLine2 && (
              <p>{selectedOrder.addressSnapshot.addressLine2}</p>
            )}
            <p>
              {selectedOrder.addressSnapshot.city},{" "}
              {selectedOrder.addressSnapshot.state} -{" "}
              {selectedOrder.addressSnapshot.pincode}
            </p>
            <p className="mt-2 font-medium">
              📞 {selectedOrder.addressSnapshot.phone}
            </p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white border-3 border-slate-100 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-3 text-emerald-600">
            <CreditCard size={24} />
            <h3 className="font-semibold text-slate-800">
              Payment Information
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-md">
              <span className="text-slate-500">Method</span>
              <span className="font-medium text-slate-800">
                {selectedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-md">
              <span className="text-slate-500">Status</span>
              <span
                className={`font-medium ${selectedOrder.paymentStatus === "paid" ? "text-emerald-600" : "text-amber-600"}`}
              >
                {selectedOrder.paymentStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border-3 border-slate-100 rounded-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
          <ShoppingBag size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-slate-800">Ordered Items</h3>
        </div>
        <div className="p-5 space-y-4">
          {selectedOrder.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-800">{item.productName}</p>
                <p className="text-sm text-slate-400">
                  {item.variantName} | Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-slate-700">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="text-slate-700">₹{selectedOrder.subTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-rose-500">
              <span>Discount</span>
              <span>- ₹{selectedOrder.discountAmount}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-slate-900">Total Paid</span>
              <span className="text-xl font-bold text-emerald-600">
                ₹{selectedOrder.actualAmount}
              </span>
            </div>
            {selectedOrder.orderStatus === "pending" && (
              <button
                onClick={handleFinalConfirm}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
              >
                Confirm & Place Order <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-start gap-3">
        <Truck className="mt-1 text-emerald-600" size={20} />

        <div className="text-sm md:text-base">
          <p className="font-semibold">Next Day Morning Delivery 🚚</p>
          <p className="text-emerald-700">
            All orders will be delivered by <strong>next day morning</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
