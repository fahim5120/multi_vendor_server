const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");  // JWT direct import
const generateOTP = require("../utils/generateOtp");
const VerificationCode = require("../Models/VerificationCode");
const User = require("../Models/User");
const Cart = require("../Models/Cart");

// Error helpers
const createError = (msg, code = 400) => {
    const e = new Error(msg);
    e.statusCode = code;
    return e;
};
const userError = (msg) => createError(msg, 400);

// JWT create function (NO separate file)
const createJwt = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

exports.sendLoginOtp = async (email) => {
   
    
    const SIGNING_PREFIX = "signing_";

    if (email.startsWith(SIGNING_PREFIX)) {
        email = email.replace(SIGNING_PREFIX, "");
        const user = await User.findOne({ email });
        if (!user) throw userError("User not found: " + email);
    }

    await VerificationCode.deleteOne({ email });

    const otp = generateOTP();
    await new VerificationCode({ otp, email }).save();
};

exports.createUser = async ({ email, fullName, otp }) => {
    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.otp !== otp)
        throw userError("Wrong OTP");

    let user = await User.findOne({ email });

    if (!user) {
        user = await new User({
            email,
            fullName,
            role: "ROLE_CUSTOMER",
            mobile: "9142705090",
            password: await bcrypt.hash(otp, 10),
        }).save();

        await new Cart({ user: user._id }).save();
    }

    // JWT direct call from inside authService
    return createJwt({ email });
};

exports.signin = async ({ email, otp }) => {
    const user = await User.findOne({ email });
    if (!user) throw userError("Invalid email");

    const verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode || verificationCode.otp !== otp)
        throw userError("Wrong OTP");

    const token = createJwt({ email });

    return {
        message: "Login Success",
        jwt: token,
        role: user.role,
    };
};
