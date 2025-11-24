// const express = require("express");
// const productController = require("../controllers/productController");
// const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware.js");
// const upload = require("../middlewares/uploadMiddleware.js");
// const router = express.Router();

// router.get(
//   "/",
//   sellerAuthMiddleware,
//   productController.getProductBySellerId
// );

// router.post(
//   "/",
//   sellerAuthMiddleware,
// upload.array("images", 5),
//   productController.createProduct
// );

// router.delete(
//   "/:productId",
//   sellerAuthMiddleware,
//   productController.deleteProduct
// );

// // Update a product
// router.put(
//   "/:productId",
//   sellerAuthMiddleware,
//   productController.updateProduct
// );

// module.exports = router;

const express = require("express");
const productController = require("../controllers/productController");
const sellerAuthMiddleware = require("../middlewares/sellerAuthMiddleware.js");

const { upload, uploadToCloudinary } = require("../middlewares/uploadMiddleware");

const router = express.Router();

// Get seller products
router.get(
  "/",
  sellerAuthMiddleware,
  productController.getProductBySellerId
);

// Create product (with multiple images)
router.post(
  "/",
  sellerAuthMiddleware,
  upload.array("images", 5),
  uploadToCloudinary,
  productController.createProduct
);

// Delete product
router.delete(
  "/:productId",
  sellerAuthMiddleware,
  productController.deleteProduct
);

// Update product
router.put(
  "/:productId",
  sellerAuthMiddleware,
  productController.updateProduct
);

module.exports = router;

