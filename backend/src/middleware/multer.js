import multer from "multer";

/* Memory storage for Cloudinary (faster & safer) */
const storage = multer.memoryStorage();

/* Optional file filter */
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image") && !file.mimetype.startsWith("audio")) {
    return cb(new Error("Unsupported file type"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  }
});

export default upload;
