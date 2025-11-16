

const express = require('express');
const router = express.Router();


const  authRoutes = require('./authRoutes');
const sellerRoutes = require('./sellerRoutes');



router.use('/auth',authRoutes);
router.use('/seller', sellerRoutes);


module.exports = router;

