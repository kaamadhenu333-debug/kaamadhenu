// src/routes/auth.routes.js
import Login from "../pages/auth/LogIn";
import Register from "../pages//auth/Register";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import UnAuthorized from "../pages/auth/UnAuthorized";
import PublicRoute from "../components/auth/PublicRoute";

export const authRoutes = {
  path: "/auth",
  //   element: <UserLayout />,
  children: [
    {
      path: "login",
      index: true,
      element: (
        <PublicRoute>
          <Login />{" "}
        </PublicRoute>
      ),
    },
    { path: "register", element: <Register /> },
    { path: "forgot-password", element: <ForgotPassword /> },
    { path: "reset-password", element: <ResetPassword /> },
    { path: "un-authorized", element: <UnAuthorized /> },
  ],
};
