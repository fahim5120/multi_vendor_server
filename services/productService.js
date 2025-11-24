// services/productService.js
const Product = require("../Models/Product");
const Category = require("../Models/Category");
const mongoose = require("mongoose");
const ProductError = require("../exceptions/ProductError");

// ---------------------------------------
// Calculate discount percentage
// ---------------------------------------
const calculateDiscountPercentage = (mrp, sell) => {
  if (mrp <= 0) throw new ProductError("MRP must be greater than zero");
  return Math.round(((mrp - sell) / mrp) * 100);
};

// ---------------------------------------
// Create or Get Category
// ---------------------------------------
const createOrGetCategory = async (categoryId, level, parentId = null) => {
  try {
    let cat = await Category.findOne({ categoryId });

    if (!cat) {
      cat = await Category.create({
        categoryId,
        level,
        parentCategory: parentId,
      });
    }

    return cat;

  } catch (err) {
    throw new ProductError("Category creation failed: " + err.message);
  }
};

// ---------------------------------------
// Create Product
// ---------------------------------------
const createProduct = async (body, seller) => {
  try {
    const discountPercent = calculateDiscountPercentage(
      body.mrpPrice,
      body.sellingPrice
    );

    // Level 1,2,3 categories
    const c1 = await createOrGetCategory(body.category, 1);
    const c2 = await createOrGetCategory(body.category2, 2, c1._id);
    const c3 = await createOrGetCategory(body.category3, 3, c2._id);

    const product = await Product.create({
      ...body,
      seller: seller._id,
      category: c3._id,
      discountPercent,
    });

    return product;

  } catch (err) {
    throw new ProductError("Product creation failed: " + err.message);
  }
};

// ---------------------------------------
// Find Product by ID
// ---------------------------------------
const findProductById = async (productId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ProductError("Invalid product ID");
    }

    const p = await Product.findById(productId).populate("seller");
    if (!p) throw new ProductError("Product not found");

    return p;
  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
// Update Product
// ---------------------------------------
const updateProduct = async (productId, data) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true }
    );

    if (!updated) throw new ProductError("Product not found");

    return updated;
  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
// Delete Product
// ---------------------------------------
const deleteProduct = async (productId) => {
  try {
    const p = await findProductById(productId);
    await Product.findByIdAndDelete(p._id);
    return true;
  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
// Search Products
// ---------------------------------------
const searchProduct = async (q) => {
  try {
    return await Product.find({ title: new RegExp(q, "i") });
  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
// Get All Products (filters + pagination)
// ---------------------------------------
const getAllProducts = async (req) => {
  try {
    const filter = {};

    if (req.category) {
      const category = await Category.findOne({ categoryId: req.category });
      if (!category) return { content: [], totalPages: 0, totalElements: 0 };
      filter.category = category._id.toString();
    }

    if (req.color) filter.color = req.color;
    if (req.size) filter.size = req.size;

    if (req.minPrice) filter.sellingPrice = { $gte: req.minPrice };

    if (req.maxPrice) {
      filter.sellingPrice = {
        ...filter.sellingPrice,
        $lte: req.maxPrice,
      };
    }

    if (req.minDiscount)
      filter.discountPercent = { $gte: req.minDiscount };

    const sort = {};
    if (req.sort === "price_low") sort.sellingPrice = 1;
    if (req.sort === "price_high") sort.sellingPrice = -1;

    const page = Number(req.pageNumber) || 0;
    const pageSize = Number(req.pageSize) || 10;

    const products = await Product.find(filter)
      .sort(sort)
      .skip(page * pageSize)
      .limit(pageSize);

    const totalElements = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalElements / pageSize);

    return { content: products, totalPages, totalElements };

  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
// Get Seller Products
// ---------------------------------------
const getProductBySellerId = async (sellerId) => {
  try {
    return await Product.find({ seller: sellerId });
  } catch (err) {
    throw new ProductError(err.message);
  }
};

// ---------------------------------------
module.exports = {
  createProduct,
  findProductById,
  updateProduct,
  deleteProduct,
  searchProduct,
  getAllProducts,
  getProductBySellerId,
};
