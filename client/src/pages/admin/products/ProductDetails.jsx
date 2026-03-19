import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  Plus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AdminHeaderWrapper from "../../../components/admin/AdminHeaderWrapper";
import { useProductStore } from "../../../store/common/useProductStore";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialFormData = {
    name: "",
    description: "",
    category_id: "",
    stock_quantity: "",
    stock_unit: "kg",
    is_active: true,
    images: [],
    variants: [],
  };

  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(initialFormData);
  const {
    loading,
    categoriesData,
    fetchCategories,
    fetchProductById,
    updateProduct,
    selectedProduct,
    deleteProduct,
  } = useProductStore();

  useEffect(() => {
    fetchProductById(id);
    fetchCategories();
  }, [id, fetchProductById, fetchCategories]);

  const mapStoreToForm = (data) => {
    const apiImages =
      data.images?.map((img) => ({
        id: img._id,
        url: img.imagePath,
        altText: img.altText,
        isPrimary: img.isPrimary,
        isNew: false,
      })) || [];

    const variantItems =
      data.variants?.map((itm) => ({
        id: itm._id,
        variant_name: itm.variantName,
        regular_price: itm.price,
        stock_quantity: itm.stockQuantity,
        unit: itm.quantityUnit,
      })) || [];

    setForm({
      id: data._id,
      name: data.name || "",
      description: data.description || "",
      category_id: data.categoryId?._id || "",
      stock_quantity: data.stock?.quantity || "",
      stock_unit: data.stock?.unit || "kg",
      is_active: data.isActive ?? true,
      images: [...apiImages],
      variants: [...variantItems],
    });
  };
  // Sync Form with Store Data
  useEffect(() => {
    if (selectedProduct && Object.keys(selectedProduct).length !== 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      mapStoreToForm(selectedProduct);
    }
  }, [selectedProduct]);

  // ------------------ Handlers ------------------
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...form.variants];
    let newValue = value;
    if (["regular_price", "stock_quantity"].includes(field)) {
      newValue = value === "" ? "" : Number(value);
    }
    updated[index][field] = newValue;
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      isNew: true,
      isPrimary: false,
    }));

    setForm((prev) => {
      const combined = [...prev.images, ...newImages];
      if (!combined.some((img) => img.isPrimary)) combined[0].isPrimary = true;
      return { ...prev, images: combined };
    });
  };

  // const handleDelete = () => {
  //   confirm("Delete product?") && navigate("/admin/products");
  // };
  const handleDelete = async () => {
    if (!confirm("Delete product?")) return;
    await deleteProduct(id);
    navigate("/admin/products");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.category_id) e.category_id = "Please select a category";
    if (form.images.length === 0)
      e.images = "At least one product image is required";

    const variantErrors = form.variants.map((v) => {
      const vErr = {};
      if (!v.variant_name?.trim()) vErr.variant_name = "Required";
      if (v.regular_price === "" || v.regular_price < 0)
        vErr.regular_price = "Invalid Price";
      if (v.stock_quantity === "" || v.stock_quantity < 0)
        vErr.stock_quantity = "Invalid Stock";
      if (!v.unit) vErr.unit = "Required";
      return vErr;
    });

    if (variantErrors.some((v) => Object.keys(v).length > 0)) {
      e.variantErrors = variantErrors;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: form.name,
      description: form.description,
      categoryId: form.category_id,
      isActive: form.is_active,

      stock: {
        quantity: Number(form.stock_quantity),
        unit: form.stock_unit,
      },

      variants: form.variants.map((v) => ({
        variantName: v.variant_name,
        price: Number(v.regular_price),
        stockQuantity: Number(v.stock_quantity),
        quantityUnit: v.unit,
      })),

      // 🔥 Keep only existing image paths
      existingImages: form.images
        .filter((img) => !img.file) // old images
        .map((img) => img.url),

      // 🔥 Only new files
      images: form.images
        .filter((img) => img.file instanceof File)
        .map((img) => img.file),
    };
    await updateProduct(id, payload);
    setEditMode(false);
  };

  if (loading && !selectedProduct)
    return (
      <div className="p-10 text-center animate-pulse">
        Loading Product Details...
      </div>
    );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* <StatusModal
        successMessage={successMessage}
        error={error}
        onClose={clearStatus}
      /> */}

      {/* HEADER SECTION */}
      <div className="md:flex justify-between items-center">
        <AdminHeaderWrapper
          title={form.name || `Product #${id}`}
          description="Manage product information, media, and variants"
          breadcrumb={[
            { label: "Products", to: "/admin/products" },
            { label: id },
          ]}
        />

        {/* <div className="flex items-center gap-3"> */}
        <div className="flex gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 bg-primary/10 rounded-2xl text-primary px-4 py-2 cursor-pointer font-bold hover:bg-primary/20 transition-all"
            >
              <Pencil size={16} className="text-primary" /> Edit
            </button>
          ) : (
            <button
              onClick={() => {
                setErrors({});
                setEditMode(false);
                mapStoreToForm(selectedProduct);
              }}
              className="px-5 py-2.5 text-gray-600 font-medium hover:text-gray-800"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Trash2 size={20} /> Delete
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* LEFT COL: MAIN INFO */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-3">
              General Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  disabled={!editMode}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className={`w-full p-3 rounded-xl border-2 transition-all focus:ring-4 outline-none ${
                    errors.name
                      ? "border-red-200 ring-red-50 focus:border-red-500"
                      : "border-gray-100 focus:border-primary-light focus:ring-primary/10"
                  } disabled:bg-gray-50 disabled:text-gray-500`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={4}
                  disabled={!editMode}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light focus:ring-4 focus:ring-primary/10 transition-all outline-none disabled:bg-gray-50"
                />
              </div>
            </div>
          </section>

          {/* VARIANTS SECTION */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">
                Inventory & Variants
              </h3>
              {editMode && (
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      variants: [
                        ...prev.variants,
                        {
                          variant_name: "",
                          regular_price: 0,
                          stock_quantity: 0,
                          unit: "kg",
                        },
                      ],
                    }))
                  }
                  className="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
                >
                  <Plus size={16} /> Add Variant
                </button>
              )}
            </div>

            <div className="space-y-3">
              {form.variants.map((v, i) => (
                <div
                  key={i}
                  className="group relative grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                >
                  <div className="sm:col-span-1">
                    <input
                      placeholder="Size/Name"
                      disabled={!editMode}
                      value={v.variant_name}
                      onChange={(e) =>
                        updateVariant(i, "variant_name", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Price"
                      disabled={!editMode}
                      value={v.regular_price}
                      onChange={(e) =>
                        updateVariant(i, "regular_price", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Stock"
                      disabled={!editMode}
                      value={v.stock_quantity}
                      onChange={(e) =>
                        updateVariant(i, "stock_quantity", e.target.value)
                      }
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      disabled={!editMode}
                      value={v.unit}
                      onChange={(e) => updateVariant(i, "unit", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-200 text-sm focus:border-primary-light outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="gm">gm</option>
                      <option value="lt">lt</option>
                      <option value="ml">ml</option>
                      <option value="others">others</option>
                    </select>
                    {editMode && form.variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            variants: prev.variants.filter(
                              (_, idx) => idx !== i,
                            ),
                          }))
                        }
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COL: MEDIA & STATUS */}
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Organization</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category
              </label>
              <select
                disabled={!editMode}
                value={form.category_id}
                onChange={(e) => updateField("category_id", e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light outline-none disabled:bg-gray-50"
              >
                <option value="">Select Category</option>
                {categoriesData.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Status
              </label>
              <select
                disabled={!editMode}
                value={form.is_active}
                onChange={(e) =>
                  updateField("is_active", e.target.value === "true")
                }
                className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-primary-light outline-none disabled:bg-gray-50"
              >
                <option value="true">Active / Published</option>
                <option value="false">Inactive / Draft</option>
              </select>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Product Images</h3>
            <div className="grid grid-cols-2 gap-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    img.isPrimary ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={`${img.url}`}
                    className="w-full h-full object-cover"
                    alt="product"
                  />
                  {editMode && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          images: p.images.filter((_, idx) => idx !== i),
                        }))
                      }
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-md text-red-500 hover:bg-red-50"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {img.isPrimary && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[10px] py-0.5 text-center font-bold">
                      PRIMARY
                    </div>
                  )}
                </div>
              ))}
              {editMode && (
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs font-medium text-gray-500">
                    Upload
                  </span>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            {errors.images && (
              <p className="text-xs text-red-500">{errors.images}</p>
            )}
          </section>

          {editMode && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}
              {loading ? "Saving Changes..." : "Save Product Details"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
