const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Define the upload directory
const uploadDir = path.join(__dirname, "../uploads");

// ✅ Ensure "uploads/" directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

// Upload Middleware
const upload = multer({ storage });

module.exports = upload;
