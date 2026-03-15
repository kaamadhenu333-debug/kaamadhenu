import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import RefreshToken from "../models/refreshToken.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/generateToken.js";

///////////////////////////////////// This is the New Updated implementation //////////////////

// @desc Register User
// @route POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

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
      passwordHash: password,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await generateRefreshToken(user._id, user.role);

    const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRE || 60 * 60 * 1000; // fallback 1 hour
    const refreshTokenExpire =
      process.env.REFRESH_TOKEN_EXPIRE || 2 * 24 * 60 * 60 * 1000; // fallback 2 days

    // 🍪 Set Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: accessTokenExpire,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: refreshTokenExpire,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// @desc    Get Current Logged In User
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login //
export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
        success: false,
      });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = await generateRefreshToken(user._id, user.role);

    const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRE || 60 * 60 * 1000; // fallback 1 hour
    const refreshTokenExpire =
      process.env.REFRESH_TOKEN_EXPIRE || 2 * 24 * 60 * 60 * 1000; // fallback 2 days

    // 🍪 Set Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: accessTokenExpire,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: refreshTokenExpire,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

// refresh token //
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        message: "No refresh token provided",
        success: false,
      });
    }

    const storedToken = await RefreshToken.findOne({
      token,
      isRevoked: false,
    });

    if (!storedToken) {
      return res.status(401).json({
        message: "Invalid refresh token",
        success: false,
      });
    }

    const decoded = await verifyRefreshToken(token);

    const newAccessToken = generateAccessToken(decoded.id, decoded.role);

    const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRE || 60 * 60 * 1000; // fallback 1 hour

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: accessTokenExpire,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed",
    });
  } catch (error) {
    res.status(401).json({
      message: "Session expired, login again",
      success: false,
    });
  }
};

// logout //
export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      await RefreshToken.findOneAndUpdate({ token }, { isRevoked: true });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
