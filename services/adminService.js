const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

      await User.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        fullName: "Fahim Admin",
        mobile: "8136905120",
        role: "ROLE_ADMIN"
      });

      console.log("⭐ Default Admin user created");
    } else {
      console.log(" Admin already exists");
    }

  } catch (err) {
    console.log("Admin creation error:", err.message);
  }
};


