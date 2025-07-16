import multer from "multer";
import Crypto from "crypto";
import path from "path";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    Crypto.randomBytes(12, (err, bytes) => {
      if (err) return cb(err);

      const fn = bytes.toString('hex') + path.extname(file.originalname);
      cb(null, fn);
    });
  }
});

const upload = multer({ storage: storage });

export default upload;