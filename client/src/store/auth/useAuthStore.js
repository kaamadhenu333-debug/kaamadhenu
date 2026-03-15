import { create } from "zustand";
import axiosInstance from "../../utils/axios";
import { toast } from "react-toastify";
import refreshAxios from "../../utils/refreshAxios";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,

  // REGISTER
  register: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/users/register", formData);
      if (res.data.success) {
        set({
          user: res.data.user,
          isAuthenticated: true,
          loading: false,
          successMessage: "Registered successfully",
        });
        await get().checkAuth();
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Registration failed",
        loading: false,
      });
    }
  },

  // LOGIN
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await axiosInstance.post("/auth/login", credentials);
      if (res.data.success) {
        set({
          user: res.data.data,
          isAuthenticated: true,
          loading: false,
          successMessage: "Login successful",
        });
        await get().checkAuth();
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Login failed",
        loading: false,
      });
    }
  },

  // CHECK SESSION
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      if (res.data.success) {
        set({
          user: res.data.data,
          isAuthenticated: true,
        });
      }
    } catch (err) {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  // UPDATE USER
  updateProfile: async (id, userData) => {
    set({ loading: true, error: null, successMessage: null });
    try {
      const res = await axiosInstance.patch(`/users/${id}`, userData);
      if (res.data.success) {
        set({
          user: res.data.user,
          loading: false,
          successMessage: "Profile updated successfully",
        });
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to update profile",
        loading: false,
      });
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  },

  // REFRESH ACCESS TOKEN
  refreshAccessToken: async () => {
    try {
      await refreshAxios.post("/auth/refresh-token");
      return true;
    } catch (err) {
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },

  // LOGOUT
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({
        user: null,
        isAuthenticated: false,
        successMessage: "Logged out successfully",
      });
      toast.success("Successfully Logged out.");
    } catch (err) {
      set({ error: "Logout failed" });
    }
  },

  // CLEAR STATUS
  clearStatus: () => set({ error: null, successMessage: null }),
}));
