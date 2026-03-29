import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordOTP: {
      type: String,
      select: false,
    },
    resetPasswordOTPExpire: {
      type: Date,
    },
    resetPasswordVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

//
// 🔐 Hash password before save
//
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

//
// 🔍 Compare password
//
userSchema.methods.matchPassword = async function (enteredPassword) {
  const isMatch = await bcrypt.compare(enteredPassword, this.passwordHash);

  return isMatch;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
