// file: middlewares/sellerAuthMiddleware.js
const Seller = require("../Models/Seller");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY;

const sellerAuthMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = header.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token,process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const seller = await Seller.findOne({ email: decoded.email });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    req.seller = seller;
    next();

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports =sellerAuthMiddleware;
