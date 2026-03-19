import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  RefreshCw,
  Package,
  FilterX,
} from "lucide-react";
import { Link } from "react-router-dom";
import Pagination from "../../../components/admin/Pagination";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useProductStore } from "../../../store/common/useProductStore";

const wrapperData = {
  title: "Inventory Management",
  description: "Manage, filter and track your product stock levels.",
  breadcrumb: [
    { label: "Dashboard", to: "/admin" },
    { label: "Products", to: "/admin/products" },
  ],
};

export default function ViewAllProducts() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // const {
  //   fetchProducts,
  //   fetchCategories,
  //   productsData,
  //   categoriesData,
  //   deleteProduct,
  //   successMessage,
  //   loading,
  //   error,
  //   clearStatus,
  // } = useAdminProductStore();

  const {
    fetchProducts,
    fetchCategories,
    deleteProduct,
    productsData,
    categoriesData,
    loading,
    error,
    clearStatus,
  } = useProductStore();

  const loadData = async () => {
    try {
      await Promise.all([fetchCategories(), fetchProducts()]);
    } catch (err) {
      console.error("Data fetch failed:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [search, categoryFilter]);

  /* ---------------- Logic: Filter & Sort ---------------- */
  const filteredAndSorted = useMemo(() => {
    if (!productsData || !Array.isArray(productsData)) return [];

    let result = productsData.filter((p) => {
      const name = p?.name?.toLowerCase() || "";
      const matchesSearch = name.includes(search.toLowerCase());
      const catId = p?.categorie_details?.id || p?.category_id;
      const matchesCategory =
        categoryFilter === "all" || String(catId) === String(categoryFilter);
      return matchesSearch && matchesCategory;
    });

    return result.sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "latest") return b.id - a.id;
      return 0;
    });
  }, [productsData, search, categoryFilter, sort]);

  /* ---------------- Logic: Pagination ---------------- */
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredAndSorted.slice(start, start + perPage);
  }, [filteredAndSorted, currentPage, perPage]);

  const handleDelete = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await deleteProduct(product._id);
        setTimeout(() => clearStatus(), 2000);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <div className="max-w-400 mx-auto pb-10">
      <AdminHeaderWrapper {...wrapperData} />

      <div className="mt-6 space-y-4">
        {/* --- Toolbar Section --- */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categoriesData?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
            >
              <option value="latest">Sort: Newest First</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <Link
            to="/admin/products/new"
            className="w-full lg:w-auto bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg flex items-center gap-2 justify-center font-medium transition-colors shadow-sm"
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>

        {/* --- Table Section --- */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {error ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-red-50 rounded-full text-red-500">
                          <AlertCircle size={32} />
                        </div>
                        <p className="text-slate-600 font-medium">{error}</p>
                        <button
                          onClick={loadData}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <RefreshCw size={14} /> Try reloading
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : loading ? (
                  // Skeleton Loader
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-10 w-48 bg-slate-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-24 bg-slate-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-slate-100 rounded"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-slate-100 rounded-full"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-20 bg-slate-100 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Package size={64} className="mb-4" />
                        <h3 className="text-xl font-semibold">
                          No Products Found
                        </h3>
                        <p className="text-slate-500 mt-1">
                          Try adjusting your filters or search terms.
                        </p>
                        <button
                          onClick={() => {
                            setSearch("");
                            setCategoryFilter("all");
                          }}
                          className="mt-4 text-primary font-medium flex items-center gap-1"
                        >
                          <FilterX size={16} /> Reset Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              p?.images?.[0]?.imagePath
                                ? `${p.images[0].imagePath}`
                                : "https://via.placeholder.com/48"
                            }
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-100 bg-slate-50"
                          />
                          <div>
                            <div className="font-semibold text-slate-800">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              ID: # {p._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {p?.categoryId?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span
                            className={`font-bold ${
                              p.stock?.quantity < 5
                                ? "text-orange-600"
                                : "text-slate-700"
                            }`}
                          >
                            {p.stock?.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            {p.stock?.unit || "Units"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-slate-50 text-slate-500 border border-slate-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              p.isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          ></span>
                          {p.isActive ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <Link
                            to={`/admin/products/${p._id}`}
                            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg border border-blue-100"
                            title="View Details"
                          >
                            <Eye size={20} />
                          </Link>
                          <button
                            onClick={() => handleDelete(p)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg border border-red-100 cursor-pointer"
                            title="Delete Product"
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

          {/* --- Pagination --- */}
          {!loading && !error && filteredAndSorted.length > 0 && (
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100">
              <Pagination
                totalItems={filteredAndSorted.length}
                currentPage={currentPage}
                perPage={perPage}
                onPageChange={setCurrentPage}
                onPerPageChange={setPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
