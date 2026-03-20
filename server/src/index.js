import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { monitorRequest } from "./middleware/monitor.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
// import monitorRoutes from "./routes/monitorLog.routes.js";
import userRoutes from "./routes/user.routes.js";
// import adminCouponRoutes from "./routes/admin.coupon.routes.js";
// import userCouponRoutes from "./routes/coupon.routes.js";

dotenv.config();

const app = express();

connectDB();
app.use(cookieParser());
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   }),
// );
const allowedOrigins = [
  "http://localhost:9898",
  "https://www.kaamadhenu.com",
  "http://www.kaamadhenu.com",
  "https://kaamadhenu.com",
  "http://kaamadhenu.com",
  "https://kaamadhenu-frontends.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // allow cookies
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- STATIC FOLDER SETUP ---
// This makes the 'uploads' folder publicly accessible
// const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(monitorRequest);

app.get("/", (req, res) => {
  res.json({
    message: "MERN E-commerce API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      cart: "/api/cart",
      orders: "/api/orders",
      addresses: "/api/addresses",
      user: "/api/users",
      monitor: "/api/monitor",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/monitor", monitorRoutes);
// app.use("/api/admin/coupons", adminCouponRoutes);
// app.use("/api/coupons", userCouponRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
