const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const adminAuth = require("../middlewares/adminAuthMiddleware")


// Admin routes
router.patch("/seller/:id/status/:status", adminAuth, sellerController.updateSellerAccountStatus);

module.exports = router;
