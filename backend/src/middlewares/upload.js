const crypto = require('crypto');
const multer = require('multer');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const { ERROR_CODES } = require('../constants/errorCodes');
const { FIELD_IMAGE_DIR, ensureUploadDirs } = require('../utils/fileStorage');

const ALLOWED_MIME_TYPES = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
});

ensureUploadDirs();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, FIELD_IMAGE_DIR),
  // Tên file do server sinh (UUID), không dùng tên client gửi lên
  filename: (req, file, cb) =>
    cb(null, `${crypto.randomUUID()}${ALLOWED_MIME_TYPES[file.mimetype]}`),
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES[file.mimetype]) return cb(null, true);
  return cb(
    new AppError(400, ERROR_CODES.INVALID_FILE, 'Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP'),
  );
};

// Field name của form-data: "image"
const uploadFieldImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxSizeBytes, files: 1 },
}).single('image');

module.exports = { uploadFieldImage };
