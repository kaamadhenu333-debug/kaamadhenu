import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const { resetPassword, loading } = useAuthStore();

  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Invalid access. Please try again.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const success = await resetPassword(email, password, confirmPassword);

    if (success) {
      toast.success("Password reset successful");

      setTimeout(() => {
        navigate("/auth/login");
      }, 1500);
    } else {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-fullbg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg text-white py-3 rounded"
          >
            {loading ? "Processing..." : "Reset Password"}
          </button>
        </form>

        <p className="text-center mt-4">
          <Link to="/auth/login" className="text-emerald-600">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
