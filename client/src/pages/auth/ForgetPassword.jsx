import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, loading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      const success = await sendOTP(email);

      if (success) {
        toast.success("OTP sent to your email");
        setStep(2);
      } else {
        toast.error("This Email doesn't exist");
      }
    }

    if (step === 2) {
      const success = await verifyOTP(email, otp);

      if (success) {
        toast.success("OTP verified");

        navigate("/auth/reset-password", {
          state: { email },
        });
      } else {
        toast.error("Invalid OTP");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 shadow-lg rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            disabled={step === 2}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded"
            required
          />

          {/* OTP */}
          {step === 2 && (
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-3 rounded"
              required
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg text-white py-3 rounded"
          >
            {loading ? "Processing..." : step === 1 ? "Send OTP" : "Verify OTP"}
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
