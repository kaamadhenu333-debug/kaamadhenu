import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  refreshToken,
  logout,
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser,
);

router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

router.post("/forgot-password", [body("email").isEmail()], forgotPassword);

router.post(
  "/verify-otp",
  [body("email").isEmail(), body("otp").notEmpty()],
  verifyOTP,
);

router.post(
  "/reset-password",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("confirmPassword").notEmpty(),
  ],
  resetPassword,
);

export default router;
