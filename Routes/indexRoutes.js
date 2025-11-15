

const express = require('express');
const router = express.Router();

const sellerRoutes = require('./sellerRoutes');


router.use('/seller', sellerRoutes);

module.exports = router;

