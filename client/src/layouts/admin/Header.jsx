import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Menu, Bell, Search, User, Settings, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/auth/useAuthStore";

export default function Header({ setIsOpen }) {
  const navigate = useNavigate();
  const handleDelete = () => {};
  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/");
  };
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const { user, logout } = useAuthStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <header className="bg-surface shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => setIsOpen(true)}
            className="lg:hidden text-text-body hover:text-primary"
          >
            <Menu size={24} />
          </button>

          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted"
                size={20}
              />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-text-muted hover:text-primary hover:bg-muted-bg rounded-lg transition-colors">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="relative" ref={menuRef}>
            {/* Toggle Button */}
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
            >
              {/* Avatar */}
              <div className="flex items-center justify-center bg-primary rounded-full w-9 h-9">
                <User size={18} className="text-white" />
              </div>

              {/* Show name & email on md+ */}
              <div className="hidden md:block text-left">
                <p className="font-medium text-sm text-gray-800">
                  {user?.firstName || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email || "admin@example.com"}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div
                className="
          absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg 
          rounded-lg p-1 z-50 animate-fade-slide
        "
              >
                {/* <Link
                  to="/admin/profile"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 disabled"
                >
                  <User size={16} />
                  Profile Settings
                </Link> */}
                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 disabled">
                  <User size={16} />
                  Profile Settings
                </button>

                <button className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 disabled">
                  <Settings size={16} />
                  Account Settings
                </button>

                <div className="border-t my-1"></div>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>

                <button
                  disabled
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  Delete Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
