

const express = require('express');
const router = express.Router();


const  authRoutes = require('./authRoutes');
const userRoutes = require("./userRoutes")
const sellerRoutes = require('./sellerRoutes');



router.use('/auth',authRoutes);
router.use("/users", userRoutes)
router.use('/seller', sellerRoutes);


module.exports = router;

