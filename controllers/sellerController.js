// file: controllers/sellerController.js
const jwt = require("jsonwebtoken");
const SellerService = require("../services/sellerService");
const VerificationService = require("../services/verificationService");
const generateOTP = require("../utils/generateOtp");
const { sendVerificationEmail } = require("../utils/sendemail");
const UserRoles = require("../domain/UserRoles");

const SECRET = process.env.JWT_SECRET;

// JWT helper functions
const createToken = (email) => jwt.sign({ email }, SECRET, { expiresIn: "24d" });

const extractEmailFromToken = (token) => {
  const decoded = jwt.verify(token, SECRET);
  return decoded.email;
};

// ---------------------
// REGISTER SELLER
// ---------------------
exports.createSeller = async (req, res) => {
  try {
    const data = req.body;
    const seller = await SellerService.createSeller(data);

    const otp = generateOTP();
    await VerificationService.createVerificationCode(otp, data.email);

    const link = `http://localhost:5173/verify-seller/${otp}`;
    await sendVerificationEmail(data.email, "Verify Your Email", link);

    return res.status(201).json({
      message: "Seller registered. Verification email sent.",
      sellerId: seller._id,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------
// GET PROFILE
// ---------------------
exports.getSellerProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const email = extractEmailFromToken(token);

    const seller = await SellerService.getSellerByEmail(email);
    return res.status(200).json(seller);

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ---------------------
// VERIFY EMAIL
// ---------------------
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const vc = await VerificationService.getVerification(email);

    if (!vc || vc.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const seller = await SellerService.verifyEmail(email);
    await VerificationService.deleteVerification(vc._id);

    return res.status(200).json({ message: "Email verified", seller });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------
// LOGIN USING OTP
// ---------------------
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const vc = await VerificationService.getVerification(email);
    if (!vc || vc.otp !== otp) {
      return res.status(400).json({ message: "Wrong OTP" });
    }

    const token = createToken(email);
    return res.status(200).json({
      message: "Login successful",
      token,
      role: UserRoles.SELLER,
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------
// GET ALL SELLERS
// ---------------------
exports.getAllSellers = async (req, res) => {
  try {
    const { status } = req.query;
    const sellers = await SellerService.getAllSellers(status);
    return res.status(200).json(sellers);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------------
// UPDATE SELLER
// ---------------------
exports.updateSeller = async (req, res) => {
  try {
    const updated = await SellerService.updateSeller(req.params.id, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ---------------------
// GET SELLER BY ID
// ---------------------
exports.getSellerById = async (req, res) => {
  try {
    const seller = await SellerService.getSellerById(req.params.id);
    return res.status(200).json(seller);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ---------------------
// DELETE SELLER
// ---------------------
exports.deleteSeller = async (req, res) => {
  try {
    await SellerService.deleteSeller(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
