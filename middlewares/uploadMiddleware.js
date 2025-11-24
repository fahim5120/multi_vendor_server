// // middleware/uploadMiddleware.js
// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// // Cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_KEY,
//   api_secret: process.env.CLOUD_SECRET,
// });

// // Storage
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "products",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// // Multer upload
// const upload = multer({ storage });

// module.exports = upload;


const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const path = require("path");

// TEMP STORAGE
const tempPath = path.join(__dirname, "..", "tempUploads");
if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

const upload = multer({ dest: tempPath });

// CLOUD UPLOAD
const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file && !req.files) return next();

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });

    // Multiple images
    if (req.files) {
      req.cloudinaryImages = [];

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        req.cloudinaryImages.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
      return next();
    }

    // Single image
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "products",
    });

    req.cloudinaryImage = result.secure_url;
    fs.unlinkSync(req.file.path);

    next();
  } catch (error) {
    return res.status(500).json({ message: "Cloud upload failed", error });
  }
};

module.exports = { upload, uploadToCloudinary };



