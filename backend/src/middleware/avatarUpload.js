import multer from "multer";

/* Memory storage for faster upload */
const storage = multer.memoryStorage();

/* Accept only image files */
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    return cb(new Error("Only images allowed"), false);
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB avatar limit
  }
});

export default avatarUpload;
