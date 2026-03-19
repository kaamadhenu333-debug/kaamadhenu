import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Filter,
  Star,
  Package,
  ShoppingCart,
  X,
  ChevronRight,
  SlidersHorizontal,
  LayoutGrid,
  Check,
} from "lucide-react";
import AuthPromptModal from "../../../components/user/AuthPromptModal";
import { useAuthStore } from "../../../store/auth/useAuthStore";
import { useProductStore } from "../../../store/common/useProductStore";
import { useCartStore } from "../../../store/user/useCartStore";

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  const navigate = useNavigate();
  const { user } = useAuthStore();

  const {
    productsData,
    fetchProducts,
    categoriesData,
    fetchCategories,
    loading,
  } = useProductStore();

  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const selectVariant = (productId, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  const handleAddToCart = async (product) => {
    const selectedVariantID = selectedVariants[product._id];
    const selectedVariant = product.variants.find(
      (variant) => variant._id === selectedVariantID,
    );

    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      addToCart(product, selectedVariant);
    }
  };

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categoryId._id === selectedCategory;
    const minPrice = Math.min(...product.variants.map((v) => v.price));
    return matchesCategory && minPrice <= priceRange[1] && product.isActive;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-emerald-600 font-medium">
          Loading collection...
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {
          setIsAuthModalOpen(false);
          navigate("/auth/login");
        }}
      />

      <div className="min-h-screen bg-[#fcfcfc] text-slate-700 font-sans">
        {/* Mobile Filter Bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-50 px-4 py-3 flex justify-between items-center">
          <h1 className="text-lg font-medium text-emerald-900">Our Shop</h1>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-12 h-[calc(100vh-120px)]">
            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 self-start">
              <div>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-900/40 uppercase tracking-widest mb-5">
                    Categories
                  </h3>
                  <div className="space-y-1">
                    <CategoryLink
                      label="All Products"
                      active={selectedCategory === "all"}
                      onClick={() => setSelectedCategory("all")}
                    />
                    {categoriesData.map((cat) => (
                      <CategoryLink
                        key={cat._id}
                        label={cat.name}
                        productCount={cat.productCount}
                        active={selectedCategory === cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-emerald-900/40 uppercase tracking-widest mb-5">
                    Price Limit
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([0, parseInt(e.target.value)])
                    }
                    className="w-full h-1 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="mt-2 text-sm text-emerald-700 font-medium">
                    Up to ₹{priceRange[1]}
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <div className="sticky top-0 bg-[#fcfcfc] z-10 pb-6">
                <div className="flex items-end justify-between mb-2">
                  <h2 className="text-2xl font-semibold text-emerald-950 capitalize">
                    {selectedCategory === "all"
                      ? "Our Produce"
                      : "Fresh Harvest"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {filteredProducts.length} items found
                  </p>
                </div>

                <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-emerald-700 focus:ring-0 cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="overflow-y-auto h-125 flex-1 pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const selectedVariantId = selectedVariants[product._id];
                    const selectedVariant = product.variants.find(
                      (v) => v._id === selectedVariantId,
                    );
                    const minPrice = Math.min(
                      ...product.variants.map((v) => v.price),
                    );

                    return (
                      <div
                        key={product._id}
                        className="bg-white p-3 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border border-gray-100 hover:border-green-200"
                      >
                        {/* Product Image */}
                        <div className="relative h-56 bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center overflow-hidden cursor-pointer">
                          <Link to={`/product/${product._id}`}>
                            {product.images?.[0] ? (
                              <img
                                src={`${import.meta.env.VITE_BASE_IMG_URL}${product.images.find((i) => i.isPrimary)?.imagePath}`}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="text-7xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                                <Package size={40} />
                              </div>
                            )}
                          </Link>
                          {product.is_featured && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm">
                              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tighter">
                                Premium
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1 px-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              {product.categoryId?.name || "Uncategorized"}
                            </span>
                          </div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1 group-hover:text-green-700 transition-colors cursor-pointer">
                              {product.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="text-emerald-700 font-semibold text-lg mb-4">
                            ₹
                            {selectedVariant ? selectedVariant.price : minPrice}
                          </div>

                          {/* Variants as soft chips */}
                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {product.variants.map((v) => (
                              <button
                                key={v._id}
                                onClick={() =>
                                  selectVariant(product._id, v._id)
                                }
                                className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                                  selectedVariantId === v._id
                                    ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md"
                                    : "bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700 hover:shadow-sm"
                                }`}
                              >
                                {v.variantName}
                              </button>
                            ))}
                          </div>

                          {/* Add to Cart - Clean Style */}
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!selectedVariant}
                            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                              selectedVariant
                                ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {selectedVariant ? "Add to Cart" : "Select Size"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-[2rem] p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-emerald-950">
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <p className="text-md font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-4 py-2 rounded-full text-md font-medium ${selectedCategory === "all" ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600"}`}
                    >
                      All
                    </button>
                    {categoriesData.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`px-4 py-2 rounded-full text-md font-medium ${selectedCategory === cat._id ? "bg-emerald-600 text-white" : "bg-slate-50 text-slate-600"}`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// Sidebar Link Component for cleaner code
function CategoryLink({ label, productCount, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl text-[16px] font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/30"
      }`}
    >
      {label} ({productCount})
    </button>
  );
}
