import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  User,
  ChevronDown,
  Package,
  LogOut,
  Edit,
  Truck,
  Star,
  Shield,
  Gift,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CartCountBadge from "../../components/user/CartCounterBadge";
import AuthPromptModal from "../../components/user/AuthPromptModal";
import { useAuthStore } from "../../store/auth/useAuthStore";
import { useCartStore } from "../../store/user/useCartStore";
import { useOrderStore } from "../../store/user/useOrderStore";
import Logo from "../../assets/user/Logo.jpeg";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchMyOrders, orders } = useOrderStore();

  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const userMenuRef = useRef(null);

  /* ---------------------- Fetch User Data ---------------------- */
  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchMyOrders();
    }
  }, [currentUser, fetchCart, fetchMyOrders]);

  /* ---------------------- Announcement Messages ---------------------- */
  const announcements = useMemo(
    () => [
      { text: "Free shipping on orders over ₹500", icon: Truck },
      { text: "4.8/5 Customer Satisfaction", icon: Star },
      { text: "100% Quality Guarantee", icon: Shield },
      { text: "New User? Get 20% OFF", icon: Gift },
    ],
    [],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  const CurrentIcon = announcements[announcementIndex].icon;

  /* ---------------------- Close Dropdown Outside Click ---------------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------------- Handlers ---------------------- */
  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const handleCartClick = (e) => {
    e.preventDefault();

    if (!currentUser) setIsAuthModalOpen(true);
    else navigate("/cart");
  };

  /* ---------------------- UI ---------------------- */

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-linear-to-r from-green-50 via-emerald-50 to-teal-50 border-b border-green-100 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-2">
          <CurrentIcon className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-medium text-gray-800 transition-all duration-500">
            {announcements[announcementIndex].text}
          </p>
        </div>
      </div>
      <div className="w-full bg-emerald-600 text-white text-center py-2 px-4 fixed top-0 left-0 z-50 shadow-md">
        <p className="text-sm md:text-base flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2">
          <span>
            📍 Service available only in <strong>Madanapalle</strong>
          </span>

          <span className="hidden md:inline">|</span>

          <span>
            ⚠️ Facing any issue? Call or message:
            <a
              href="tel:+918919558561"
              className="underline font-semibold ml-1 hover:text-emerald-200"
            >
              +91 8919558561
            </a>
          </span>
        </p>
      </div>
      {/* Navbar */}
      <div className="border-b mt-3 md:mt-0 bg-white">
        {/* This is Info Line */}

        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src={Logo}
              alt="Kaamadhenu Logo"
              className="w-12 h-12 md:w-24 md:h-24 object-contain"
            />

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Kaamadhenu
              </h1>

              <p className="hidden sm:block text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                Fresh Groceries
              </p>
            </div>
          </Link>

          {/* Search */}
          <div className="w-full order-3 md:order-2 md:flex-1 md:max-w-xl">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for fruits, vegetables..."
                className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-50 text-sm"
              />

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 order-2 md:order-3">
            {/* User Menu */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-50"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>

                  <span className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-700">
                    Hi, {currentUser.firstName}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </span>
                </button>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 sm:w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-5 py-4 border-b">
                      <p className="font-bold text-gray-900">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 rounded-lg text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </Link>

                      <Link
                        to="/profile/orders"
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-green-50 rounded-lg text-sm"
                      >
                        <Package className="w-4 h-4" />
                        My Orders ({orders.length})
                      </Link>

                      <hr />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-red-50 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth/login")}
                className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:scale-[1.02]"
              >
                <User className="w-4 h-4" />
                Sign In
              </button>
            )}

            {/* Cart */}
            <div
              onClick={handleCartClick}
              className="cursor-pointer relative p-2 sm:p-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100"
            >
              <CartCountBadge />
            </div>

            {/* Auth Modal */}
            <AuthPromptModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              onLogin={() => {
                setIsAuthModalOpen(false);
                navigate("/auth/login");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNavbar;
