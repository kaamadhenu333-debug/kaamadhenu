import { validationResult } from "express-validator";
import Product from "../models/product.model.js";
import sharp from "sharp";
// import path from "path";
// import fs from "fs";
import streamifier from "streamifier";
import cloudinary from "../config/clodinary.js";

////////////// Helper: Process and Save Image //////////////////////
// const processImage = async (file, productName, index) => {
//   const uploadDir = "uploads/products/";
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const filename = `prod-${Date.now()}-${index}.webp`;
//   const outputPath = path.join(uploadDir, filename);

//   await sharp(file.buffer)
//     .resize(800, 800, { fit: "inside", withoutEnlargement: true })
//     .toFormat("webp")
//     .webp({ quality: 80 })
//     .toFile(outputPath);

//   return {
//     imagePath: `/uploads/products/${filename}`,
//     altText: productName,
//     isPrimary: index === 0, // First image is primary by default
//   };
// };

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "products",
        format: "webp",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const processImage = async (file, productName, index) => {
  const processedBuffer = await sharp(file.buffer)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const result = await uploadToCloudinary(processedBuffer);

  return {
    imagePath: result.secure_url,
    publicId: result.public_id, // 🔥 IMPORTANT
    altText: productName,
    isPrimary: index === 0,
  };
};

////////////// Create a Product //////////////////////
export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), success: false });
    }

    // Note: stock and variants will arrive as JSON strings via FormData
    const { name, description, categoryId, isActive, stock, variants } =
      req.body;

    // 1. Handle Images
    let processedImages = [];
    if (req.files && req.files.length > 0) {
      processedImages = await Promise.all(
        req.files.map((file, index) => processImage(file, name, index)),
      );
    }

    // 2. Create Product (Parsing nested objects/arrays)
    const product = await Product.create({
      name,
      description,
      categoryId,
      isActive: isActive === "true" || isActive === true,
      stock: typeof stock === "string" ? JSON.parse(stock) : stock,
      variants: typeof variants === "string" ? JSON.parse(variants) : variants,
      images: processedImages,
    });

    const populatedProduct = await Product.findById(product._id).populate(
      "categoryId",
      "name",
    );

    res.status(201).json({ success: true, product: populatedProduct });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

////////////// Update Product //////////////////////
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    const {
      name,
      description,
      categoryId,
      isActive,
      stock,
      variants,
      existingImages,
    } = req.body;

    // 🔥 Parse existing images sent from frontend
    let parsedExisting = [];

    if (existingImages) {
      parsedExisting =
        typeof existingImages === "string"
          ? JSON.parse(existingImages)
          : existingImages;
    }

    // 🔥 DELETE removed images
    // const __dirname = path.resolve();

    // product.images.forEach((img) => {
    //   if (!parsedExisting.includes(img.imagePath)) {
    //     const fullPath = path.join(__dirname, img.imagePath);
    //     if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    //   }
    // });
    for (const img of product.images) {
      if (!parsedExisting.includes(img.imagePath)) {
        await cloudinary.uploader.destroy(img.publicId);
      }
    }

    // 🔥 Keep only selected images
    product.images = product.images.filter((img) =>
      parsedExisting.includes(img.imagePath),
    );

    // 🔥 ADD new uploaded images (if any)
    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map((file, index) =>
          processImage(file, name || product.name, index),
        ),
      );

      product.images = [...product.images, ...newImages];
    }

    // 🔥 Then update normal fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (categoryId) product.categoryId = categoryId;
    if (isActive !== undefined)
      product.isActive = isActive === "true" || isActive === true;

    if (stock) {
      product.stock = typeof stock === "string" ? JSON.parse(stock) : stock;
    }

    if (variants) {
      product.variants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

////////////// Delete Product //////////////////////
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    // Cleanup physical images
    // const __dirname = path.resolve();
    // product.images.forEach((img) => {
    //   const fullPath = path.join(__dirname, img.imagePath);
    //   if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    // });
    for (const img of product.images) {
      await cloudinary.uploader.destroy(img.publicId);
    }

    await Product.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Product and images deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

////////////// Get All & Get By ID (Standard logic) //////////////////////

export const getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const filter = { isActive: true };

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const products = await Product.find(filter).populate("categoryId", "name");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "categoryId",
      "name",
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ success: true, product: product });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
