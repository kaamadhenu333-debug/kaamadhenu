import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
  FilterX,
  Mail,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/admin/Pagination";
// import StatusModal from "../../../components/admin/StatusModal";
import { useUserStore } from "../../../store/admin/useUserStore";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

const wrapperData = {
  title: "Customer Directory",
  description:
    "Manage your registered users, review their roles, and access dossiers.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Customers", to: "/admin/customers" },
  ],
};

export default function ViewAllCustomers() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { fetchAllUsers, deleteUser, users, error, loading } = useUserStore();

  const loadData = async () => {
    try {
      await fetchAllUsers();
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!users || !Array.isArray(users)) return [];

    return users.filter((u) => {
      const text = `${u?.firstName || ""} ${u?.lastName || ""} ${
        u?.email || ""
      } ${u?.phone || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole = role === "all" || u.role === role;
      return matchesSearch && matchesRole;
    });
  }, [users, search, role]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, currentPage, perPage]);

  const handleDelete = async (user) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${user.firstName}? This action cannot be undone.`,
      )
    ) {
      await deleteUser(user._id);
    }
  };

  const resetFilters = () => {
    setRole("all");
    setSearch("");
    setCurrentPage(1);
  };

  // Helper to get initials for Avatar
  const getInitials = (f, l) => `${f?.[0] || ""}${l?.[0] || ""}`.toUpperCase();

  return (
    <div className="pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      {/* {(successMessage || error) && (
        <StatusModal
          message={successMessage || error}
          type={successMessage ? "success" : "error"}
          onClose={clearStatus}
        />
      )} */}

      <div className="space-y-6">
        {/* --- SMART FILTERS --- */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 w-full md:w-auto gap-4">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search name, email, or phone..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
            </div>

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none min-w-35"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {/* <Link
            to="/admin/customers/new"
            className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            <Plus size={18} /> New Registration
          </Link> */}
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white p-4 rounded-3xl shadow mt-6 border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600 text-sm uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Customer</th>
                  <th className="p-4 font-bold">Contact Info</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {/* Error State */}
                {error ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <div className="inline-flex flex-col items-center p-8 bg-red-50 rounded-3xl border border-red-100 text-red-600">
                        <AlertCircle size={40} className="mb-3" />
                        <p className="font-black text-lg">
                          System synchronization failed
                        </p>
                        <p className="text-sm opacity-80 mb-4">{error}</p>
                        <button
                          onClick={loadData}
                          className="flex items-center gap-2 bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-red-200"
                        >
                          <RefreshCw size={16} /> Force Reload
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : loading ? (
                  // Loading State
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-6">
                        <div className="h-12 bg-gray-100 rounded-2xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  // Empty State
                  <tr>
                    <td colSpan={4} className="py-24 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <FilterX size={64} className="mb-4 opacity-10" />
                        <p className="text-xl font-black text-gray-800">
                          No matches found
                        </p>
                        <p className="text-sm font-medium mt-1">
                          Try adjusting your filters or search keywords.
                        </p>
                        <button
                          onClick={resetFilters}
                          className="mt-4 text-primary font-black text-xs uppercase tracking-widest hover:underline"
                        >
                          Clear Global Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Success State
                  paginated.map((u) => (
                    <tr
                      key={u._id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 
                            ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {getInitials(u.firstName, u.lastName)}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 text-sm">
                              {u.firstName} {u.lastName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {u.role === "admin" ? (
                                <ShieldCheck
                                  size={12}
                                  className="text-purple-500"
                                />
                              ) : (
                                <User size={12} className="text-gray-400" />
                              )}
                              <span
                                className={`text-[10px] font-black uppercase tracking-tighter ${
                                  u.role === "admin"
                                    ? "text-purple-500"
                                    : "text-gray-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail size={14} className="shrink-0" />
                            <span className="text-xs font-bold">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Smartphone size={14} className="shrink-0" />
                            <span className="text-xs font-medium">
                              {u.phone || "No phone listed"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="text-xs font-black text-gray-500 uppercase">
                          {u.createdAt || "Historical Data"}
                        </p>
                        <p className="text-[10px] text-gray-300 font-bold mt-0.5 tracking-widest">
                          ID: #{u._id}
                        </p>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            to={`/admin/customers/${u._id}`}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            title="View Dossier"
                          >
                            <Eye size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(u)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            title="Deactivate Account"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* --- FOOTER / PAGINATION --- */}
          <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100">
            <Pagination
              totalItems={filtered.length}
              currentPage={currentPage}
              perPage={perPage}
              onPageChange={setCurrentPage}
              onPerPageChange={setPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
