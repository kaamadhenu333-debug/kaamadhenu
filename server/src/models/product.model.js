import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a category ID"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Stock Object
    stock: {
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["kg", "gm", "l", "ml", "others"],
        required: [true, "Please provide a stock unit"],
      },
    },
    // Images Array with Sub-documents
    images: [
      {
        imagePath: { type: String, required: true },
        publicId: { type: String, required: true },
        altText: { type: String, trim: true },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    // Variants Array with Sub-documents
    variants: [
      {
        variantName: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        stockQuantity: { type: Number, default: 0, min: 0 },
        quantityUnit: {
          type: String,
          enum: ["kg", "gm", "l", "ml", "others"],
          required: true,
        },
      },
    ],
  },
  {
    // Handles createdAt and updatedAt automatically
    timestamps: true,
  },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
