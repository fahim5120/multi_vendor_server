const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');

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
