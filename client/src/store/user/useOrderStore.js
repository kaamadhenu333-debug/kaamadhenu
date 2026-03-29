import { create } from "zustand";
import axios from "../../utils/axios";
import { toast } from "react-toastify";

export const useOrderStore = create((set, get) => ({
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
  },

  //////////////////////////////////////////////////////
  // CUSTOMER ACTIONS
  //////////////////////////////////////////////////////

  // Create Order (Checkout)
  createOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      // orderData should contain { addressId, paymentMethod }
      const res = await axios.post("/orders", orderData);

      if (res.data.success) {
        set((state) => ({
          orders: [res.data.order, ...state.orders],
          loading: false,
        }));
        toast.success("Order placed successfully!");
        return res.data.order; // Return order for navigation purposes
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      set({ error: msg, loading: false });
      toast.error(msg);
      return null;
    }
  },

  // Get My Orders (Customer History)
  fetchMyOrders: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `/orders/myorders?page=${page}&limit=${limit}`,
      );

      if (res.data.success) {
        set({
          orders: res.data.orders,
          pagination: {
            currentPage: res.data.currentPage,
            totalPages: res.data.totalPages,
            totalOrders: res.data.totalOrders || res.data.orders.length,
          },
          loading: false,
        });
      }
    } catch (err) {
      set({ error: "Failed to load your orders", loading: false });
      toast.error("Failed to load your orders");
    }
  },

  // Cancel Order (Shared: Customer/Admin)
  cancelOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(`/orders/${orderId}/cancel`);

      if (res.data.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o._id === orderId ? { ...o, orderStatus: "cancelled" } : o,
          ),
          selectedOrder:
            state.selectedOrder?._id === orderId
              ? { ...state.selectedOrder, orderStatus: "cancelled" }
              : state.selectedOrder,
          loading: false,
        }));
        toast.success("Order cancelled successfully");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Cancellation failed";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  //////////////////////////////////////////////////////
  // ADMIN ACTIONS (Stage Management)
  //////////////////////////////////////////////////////

  // Fetch All Orders (Admin)
  fetchAllOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      // params can include { page, limit, status, search }
      const res = await axios.get("/orders/all", { params });

      if (res.data.success) {
        set({
          orders: res.data.data,
          pagination: {
            currentPage: res.data.currentPage,
            totalPages: res.data.totalPages,
            totalOrders: res.data.totalOrders,
          },
          loading: false,
        });
      }
    } catch (err) {
      set({ error: "Failed to fetch all orders", loading: false });
    }
  },

  // Update Order Status (Stage Management: Pending -> Confirmed -> Shipped -> Delivered)
  updateOrderStatus: async (orderId, statusData) => {
    set({ loading: true, error: null });
    try {
      // statusData should be { orderStatus: "confirmed", paymentStatus: "paid" }
      console.log("status data :", statusData);
      const status = {
        orderStatus: statusData,
        paymentStatus: null,
      };
      console.log("status :", status);

      const res = await axios.put(`/orders/${orderId}/status`, status);

      if (res.data.success) {
        set((state) => ({
          orders: state.orders.map((o) =>
            o._id === orderId ? res.data.order : o,
          ),
          selectedOrder: res.data.order,
          loading: false,
        }));
        toast.success(`Order moved to ${status.orderStatus}`);
        return true;
      }
    } catch (err) {
      set({ error: "Update failed", loading: false });
      toast.error(err.response?.data?.message || "Update failed");
      return false;
    }
  },

  //////////////////////////////////////////////////////
  // SHARED ACTIONS
  //////////////////////////////////////////////////////

  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/orders/${id}`);
      if (res.data.success) {
        set({ selectedOrder: res.data.order, loading: false });
      }
    } catch (err) {
      set({ error: "Order details not found", loading: false });
      toast.error("Order details not found");
    }
  },

  clearOrderDetails: () => set({ selectedOrder: null, error: null }),
}));
