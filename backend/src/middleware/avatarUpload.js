import multer from "multer";

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const avatarUpload = multer({ storage });

export default avatarUpload;
