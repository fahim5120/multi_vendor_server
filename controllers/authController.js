const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



// ---- Simple Error System ----
const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const userError = (message) => createError(message, 400);
// --------------------------------

exports.sentLoginOtp = async (req, res) => {
    try {
        
        await AuthService.sendLoginOtp(req.body.email);
        return res.status(201).json({ message: "OTP sent" });
    } catch (error) {
        return res.status(error.statusCode || 400).json({ error: error.message });
    }
};

exports.createUserHandler = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw createError("Validation failed", 400);
        }

        const token = await AuthService.createUser(req.body);

        return res.status(200).json({
            jwt: token,
            message: "Register Success",
            role: "ROLE_CUSTOMER",
        });

    } catch (error) {
        return res.status(error.statusCode || 400).json({ error: error.message });
    }
};


exports.signin = async (req, res) => {
    try {
        const authResponse = await AuthService.signin(req.body);
        return res.status(200).json(authResponse);
    } catch (error) {
        return res.status(error.statusCode || 400).json({ error: error.message });
    }
};




exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email }).select("+password");

    if (!admin || admin.role !== "ROLE_ADMIN") {
      return res.status(401).json({ message: "Not an admin" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    const token = jwt.sign({ email: admin.email, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: "1d"
    });

    res.json({
      message: "Admin Login Success",
      jwt: token,
      role: admin.role
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

