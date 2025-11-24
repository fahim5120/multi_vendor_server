const ProductService = require("../services/productService");
const { createProductSchema } = require("../validators/productValidators");
const Yup = require("yup");

// -----------------------------------
// GET PRODUCTS BY SELLER
// -----------------------------------
const getProductBySellerId = async (req, res) => {
  try {
    const seller = req.seller;
    const products = await ProductService.getProductBySellerId(seller._id);

    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// -----------------------------------
// CREATE PRODUCT
// -----------------------------------
const createProduct = async (req, res) => {
  try {
    await createProductSchema.validate(req.body, { abortEarly: false });

    const seller = req.seller;
    const body = {
      ...req.body,
      images: req.files?.map((file) => file.path) || [],
    };

    const product = await ProductService.createProduct(body, seller);

    return res.status(201).json(product);

  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return res.status(400).json({
        error: "Validation error",
        errors: error.errors,
        count: error.errors.length,
      });
    }
    return res.status(400).json({ error: error.message });
  }
};

// -----------------------------------
// DELETE PRODUCT
// -----------------------------------
const deleteProduct = async (req, res) => {
  try {
    await ProductService.deleteProduct(req.params.productId);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

// -----------------------------------
// UPDATE PRODUCT
// -----------------------------------
const updateProduct = async (req, res) => {
  try {
    const updated = await ProductService.updateProduct(
      req.params.productId,
      req.body
    );
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

// -----------------------------------
// GET PRODUCT BY ID
// -----------------------------------
const getProductById = async (req, res) => {
  try {
    const product = await ProductService.findProductById(req.params.productId);
    return res.status(200).json(product);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

// -----------------------------------
// SEARCH PRODUCT
// -----------------------------------
const searchProduct = async (req, res) => {
  try {
    const products = await ProductService.searchProduct(req.query.q);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// -----------------------------------
// GET ALL PRODUCTS
// -----------------------------------
const getAllProducts = async (req, res) => {
  try {
    const products = await ProductService.getAllProducts(req.query);
    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProductBySellerId,
  deleteProduct,
  updateProduct,
  getProductById,
  searchProduct,
  getAllProducts,
};
