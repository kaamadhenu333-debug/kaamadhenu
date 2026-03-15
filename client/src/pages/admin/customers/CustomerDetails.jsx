import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  Package,
  User,
  MapPin,
  Mail,
  Phone,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Pagination from "../../../components/admin/Pagination";
import { useUserStore } from "../../../store/admin/useUserStore";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { fetchUserByIdForAdmin, adminSelectedUser, loading } = useUserStore();

  const user = adminSelectedUser?.user || {};
  const orders = adminSelectedUser?.orders || [];
  const addresses = adminSelectedUser?.adresses || [];

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  useEffect(() => {
    if (id) fetchUserByIdForAdmin(id);
  }, [id, fetchUserByIdForAdmin]);

  useEffect(() => {
    if (!user) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
    });
  }, [user]);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return orders.slice(start, start + perPage);
  }, [orders, currentPage, perPage]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-blue-100 rounded-full"></div>
          <div className="absolute top-0 h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-500 font-bold tracking-widest text-xs uppercase">
          Assembling Dossier...
        </p>
      </div>
    );

  return (
    <div className="max-w-400 mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <AdminHeaderWrapper
            title={`${user.firstName || ""} ${user.lastName || ""}`}
            description={`Customer details`}
            breadcrumb={[
              { label: "Directory", to: "/admin/customers" },
              { label: id },
            ]}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT PROFILE */}
        <div className="lg:col-span-4 space-y-8">
          {/* Identity */}
          <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
              <User size={20} />
              <h3 className="font-bold">Customer Identity</h3>
            </div>

            <div className="space-y-5">
              <Field label="First Name" icon={null} value={form.firstName} />
              <Field label="Last Name" icon={null} value={form.lastName} />
              <Field
                label="Email"
                icon={<Mail size={14} />}
                value={form.email}
              />
              <Field
                label="Phone"
                icon={<Phone size={14} />}
                value={form.phone}
              />
            </div>
          </section>

          {/* Addresses */}
          <section className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={20} />
              <h3 className="font-bold">Addresses</h3>
            </div>

            {addresses.length > 0 ? (
              addresses.map((addr) => (
                <div key={addr._id} className="border rounded-xl p-4 mb-3">
                  <p className="font-semibold">{addr.city}</p>
                  <p className="text-sm text-gray-500">
                    {addr.addressLine1}, {addr.pincode}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No address stored</p>
            )}
          </section>
        </div>

        {/* RIGHT ORDERS */}
        {/* <div className="lg:col-span-8">
          <section className="bg-white rounded-[2rem] shadow border overflow-hidden">
            <div className="p-6 border-b flex items-center gap-3">
              <Package size={20} />
              <div>
                <h3 className="font-bold">Transaction History</h3>
                <p className="text-xs text-gray-400">
                  Lifetime Orders: {orders.length}
                </p>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs">Ref ID</th>
                  <th className="px-6 py-4 text-xs">Date</th>
                  <th className="px-6 py-4 text-xs">Status</th>
                  <th className="px-6 py-4 text-xs text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-blue-50 cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    <td className="px-6 py-5 font-semibold">#{order._id}</td>

                    <td className="px-6 py-5 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-sm">{order.orderStatus}</td>

                    <td className="px-6 py-5 text-right font-semibold">
                      ₹{order.subTotal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-6 border-t">
              <Pagination
                totalItems={orders.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </div>
          </section>
        </div> */}
        {/* RIGHT: CART & ORDERS */}
        <div className="lg:col-span-8 space-y-10">
          {/* CART COMPONENT (Already Styled) */}
          {/* <OrderCartSection cartData={selectedUser?.cart} /> */}

          {/* ORDERS TABLE SECTION */}
          <section className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Transaction History
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Lifetime Orders: {orders.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Ref. ID
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Date
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {" "}
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-blue-50/30 transition-all cursor-pointer group"
                      onClick={() => navigate(`/admin/orders/${order._id}`)}
                    >
                      <td className="px-8 py-6">
                        <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          #{order._id}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit ${
                            order.orderStatus === "delivered"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              order.orderStatus === "delivered"
                                ? "bg-emerald-500"
                                : "bg-orange-500 animate-pulse"
                            }`}
                          />
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 font-mono">
                          <span className="text-sm font-black text-slate-900">
                            ₹{order.subTotal.toLocaleString()}
                          </span>
                          <ChevronRight
                            size={14}
                            className="text-slate-300 group-hover:text-blue-400 transition-colors"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <Pagination
                totalItems={orders.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, icon }) {
  return (
    <div>
      <label className="text-xs text-gray-400 flex items-center gap-1">
        {icon} {label}
      </label>
      <p className="font-semibold">{value || "—"}</p>
    </div>
  );
}
