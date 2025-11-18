const adminAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "ROLE_ADMIN") {
      return res.status(403).json({ message: "Not allowed. Admin only." });
    }

    req.admin = decoded;
    next();

  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = adminAuth;