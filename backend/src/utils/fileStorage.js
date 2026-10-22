const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const FIELD_IMAGE_DIR = path.join(config.upload.rootDir, 'fields');
const FIELD_IMAGE_URL_PREFIX = '/uploads/fields/';

const ensureUploadDirs = () => fs.mkdirSync(FIELD_IMAGE_DIR, { recursive: true });

const toFieldImageUrl = (filename) => `${FIELD_IMAGE_URL_PREFIX}${filename}`;

// Chỉ xóa file nằm trong thư mục ảnh sân; dùng basename để chặn path traversal
async function deleteFieldImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith(FIELD_IMAGE_URL_PREFIX)) return;
  const filePath = path.join(FIELD_IMAGE_DIR, path.basename(imageUrl));
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { FIELD_IMAGE_DIR, ensureUploadDirs, toFieldImageUrl, deleteFieldImage };
