const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // decode JWT directly here
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const user = await userService.findUserProfileByEmail(email);

    req.user = user; // attach user to request
    next();

  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};
