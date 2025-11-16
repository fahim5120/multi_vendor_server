const express = require("express");
const router = express.Router();

const sellerController = require("../controllers/sellerController.js");
const sellerAuth = require("../middlewares/sellerAuthMiddleware.js.js");

// PUBLIC ROUTES
router.post("/", sellerController.createSeller);
router.post("/verify/email", sellerController.verifyEmail);
router.post("/verify/login-otp", sellerController.verifyLoginOtp);

// PROTECTED ROUTES
router.get("/profile", sellerAuth, sellerController.getSellerProfile);
router.get("/", sellerAuth, sellerController.getAllSellers);

router.patch("/:id", sellerAuth, sellerController.updateSeller);
router.get("/:id", sellerAuth, sellerController.getSellerById);
router.delete("/:id", sellerAuth, sellerController.deleteSeller);

module.exports = router;
