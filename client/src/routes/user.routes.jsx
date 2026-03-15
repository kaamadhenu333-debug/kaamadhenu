import ProtectedRoute from "../components/auth/ProtectedRoute";
import UserLayout from "../layouts/user/UserLayout";
import Home from "../pages/user/home/Home";
import Products from "../pages/user/products/Products";
import ProductDetail from "../pages/user/products/ProductDetail";
import ProfileEditForm from "../pages/user/user/ProfileEditForm";
import CartPage from "../pages/user/cart/CartPage";
import OrderConfirmation from "../pages/user/orders/OrderConfirmation";
import MyOrders from "../pages/user/orders/MyOrders";
import OrderDetails from "../pages/user/orders/OrderDetail";

export const userRoutes = {
  path: "/",
  element: <UserLayout />,
  children: [
    // Public User Routes
    { index: true, element: <Home /> },
    {
      element: <ProtectedRoute allowedRoles={["customer"]} />,
      children: [
        { path: "profile", element: <ProfileEditForm /> },
        { path: "profile/orders", element: <MyOrders /> },
        { path: "profile/orders/:id", element: <OrderDetails /> },
      ],
    },

    { path: "products", element: <Products /> },
    { path: "product/:id", element: <ProductDetail /> },
    { path: "cart", element: <CartPage /> },
    // {
    //   element: <ProtectedRoute allowedRoles={["customer"]} />,
    //   children: [{ path: "profile/orders", element: <MyOrders /> }],
    // },
    // {
    //   element: <ProtectedRoute allowedRoles={["customer"]} />,
    //   children: [{ path: "orders/:id", element: <OrderDetails /> }],
    // },

    // Add :orderId as a dynamic parameter
    { path: "checkout/confirm/:orderId", element: <OrderConfirmation /> },
  ],
};
