

const express = require('express');
const router = express.Router();


const  authRoutes = require('./authRoutes');
const userRoutes = require("./userRoutes")
const sellerRoutes = require('./sellerRoutes');
const productRoutes = require('./productRoutes');
const sellerProductRoutes = require('./sellerProductRoutes');
const  cartRoutes= require('./cartRoutes');
const  orderRoutes= require('./orderRoutes');
const  paymentRoutres= require('./PaymentRoutes');
const  wishlistRoutes= require('./wishlistRoutes');
const reviewRoutes= require('./reviewRoutes');

router.use('/auth',authRoutes);
router.use("/users", userRoutes)
router.use('/seller', sellerRoutes);
router.use('/products', productRoutes);
router.use('/sellers/product', sellerProductRoutes);
router.use('/cart', cartRoutes);
router.use("/payment", paymentRoutres)
router.use("/wishlist", wishlistRoutes)
router.use('/orders', orderRoutes);
router.use("/reviews", reviewRoutes)

module.exports = router;

