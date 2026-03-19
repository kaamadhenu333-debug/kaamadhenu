import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Package,
  Truck,
  Shield,
  ChevronLeft,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";
import AuthPromptModal from "../../../components/user/AuthPromptModal";
import { useAuthStore } from "../../../store/auth/useAuthStore";
import { useProductStore } from "../../../store/common/useProductStore";
import { useCartStore } from "../../../store/user/useCartStore";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Use Zustand store instead of local state
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { fetchProductById, selectedProduct, loading } = useProductStore();

  useEffect(() => {
    fetchProductById(id);
  }, [id, fetchProductById]);

  useEffect(() => {
    const variantData = selectedProduct?.variants[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVariant(variantData);
  }, [selectedProduct]);

  // Simplified Add to Cart Function using Zustand
  const handleAddToCart = async () => {
    if (!user) {
      // User is NOT logged in: Show the Modal
      setIsAuthModalOpen(true);
    } else {
      // User IS logged in: Go to cart

      addToCart(selectedProduct, selectedVariant, quantity);
      //  navigate("/cart");
    }
  };

  const handleQuantityChange = (change) => {
    if (!selectedProduct) return;

    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-50/50 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Product not found
          </h3>
          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  // const primaryImage = selectedProduct.images?.find((img) => img.isPrimary);
  const allImages = selectedProduct.images || [];

  return (
    <>
      {/* This is the Modal for An Un Authorized Cart */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {
          setIsAuthModalOpen(false);
          navigate("/auth/login");
        }}
      />
      <div className="min-h-screen bg-linear-to-b from-green-50/50 to-emerald-50/30 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Products
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center h-96">
                {allImages[activeImage]?.imagePath &&
                !allImages[activeImage].imagePath.includes("blob:") ? (
                  <img
                    src={`${allImages[activeImage].imagePath}`}
                    alt={allImages[activeImage].altText || selectedProduct.name}
                    className="max-h-80 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-8xl opacity-30">
                    {selectedProduct.categoryId?.name === "Organic Grains"
                      ? "🌾"
                      : selectedProduct.categoryId?.name === "Cold-Pressed Oils"
                        ? "🫒"
                        : selectedProduct.categoryId?.name ===
                            "Farm Fresh Spices"
                          ? "🌶️"
                          : selectedProduct.categoryId?.name ===
                              "Natural Sweeteners"
                            ? "🍯"
                            : selectedProduct.categoryId?.name ===
                                "Dry Fruits & Nuts"
                              ? "🥜"
                              : "📦"}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        activeImage === index
                          ? "border-green-500"
                          : "border-gray-200"
                      }`}
                    >
                      {image.imagePath && !image.imagePath.includes("blob:") ? (
                        <img
                          src={`${image.imagePath}`}
                          alt={image.altText || `Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">📷</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Category Badge */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                  {selectedProduct.categoryId?.name || "Uncategorized"}
                </span>
                {selectedProduct.is_featured && (
                  <span className="text-xs font-semibold bg-linear-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full">
                    ⭐ Featured Product
                  </span>
                )}
              </div>

              {/* Product Name */}
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedProduct.name}
              </h1>

              {/* Price */}
              <div className="space-y-2">
                <div className="text-4xl font-bold text-green-600">
                  ₹{selectedVariant?.price?.toFixed(2) || "0.00"}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedProduct.variants?.length > 1
                    ? "Price varies by size"
                    : `₹${selectedVariant?.stockQuantity} ${selectedVariant?.quantityUnit}`}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Description
                </h3>
                <p className="text-gray-600">{selectedProduct.description}</p>
              </div>

              {/* Stock Info */}
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-5 h-5" />
                <span className="font-medium">
                  {selectedProduct.stock.quantity > 0 ? (
                    <>
                      <span className="text-green-600">In Stock:</span>{" "}
                      {selectedProduct.stock.quantity}{" "}
                      {selectedProduct.stock.unit}
                    </>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </span>
              </div>

              {/* Variant Selection */}
              {selectedProduct.variants?.length > 1 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Select Size
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProduct.variants.map((variant) => (
                      <button
                        key={variant._id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                          selectedVariant?._id === variant._id
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-gray-200 hover:border-green-300 text-gray-700"
                        }`}
                      >
                        <div className="font-medium">
                          {variant?.variantName} ({variant.stockQuantity}){" "}
                          {variant.quantityUnit}
                        </div>
                        <div className="text-sm font-bold">
                          ₹{variant.price.toFixed(2)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 border-2 border-gray-200 rounded-xl px-4 py-2">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      // disabled={quantity >= selectedProduct.stock_quantity}
                      className="p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Max: {selectedProduct.stock.quantity} units
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-lg ${"bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"}`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    <span className="text-lg">Add to Cart</span>
                  </div>
                </button>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Price for {quantity} item(s):
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{(selectedVariant?.price * quantity).toFixed(2)}
                  </span>
                </div>
                {selectedProduct.variants?.length > 1 && selectedVariant && (
                  <div className="text-sm text-gray-500 mt-2">
                    Selected: {selectedVariant.stockQuantity}{" "}
                    {selectedVariant.quantityUnit}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Free Delivery</div>
                    <div className="text-sm text-gray-500">
                      On orders above ₹500
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold">Quality Guarantee</div>
                    <div className="text-sm text-gray-500">
                      100% fresh & natural
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
