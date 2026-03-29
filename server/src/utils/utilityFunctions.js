import nodemailer from "nodemailer";
import crypto from "crypto";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

// 🔹 Create transporter once (reuse)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_APP_USER, // your@gmail.com
    pass: process.env.EMAIL_APP_PASSWORD, // app password (NOT real password)
  },
});

// 🔹 Send OTP Email
export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"Your App Support" <${process.env.EMAIL_APP_USER}>`,
      to: email,
      subject: "🔐 Password Reset OTP",

      // Plain text (fallback)
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes.`,

      // ✅ HTML Template (Better UX)
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password.</p>
          
          <p><strong>Your OTP:</strong></p>
          
          <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 10px 0;
            color: #2c3e50;
          ">
            ${otp}
          </div>

          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          
          <p>If you didn’t request this, please ignore this email.</p>

          <br/>
          <p>Thanks,<br/>Your App Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ OTP email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Email could not be sent");
  }
};
