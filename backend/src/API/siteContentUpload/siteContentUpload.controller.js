const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const { ok } = require('../../utils/response');
const { toSiteContentImageUrl } = require('../../utils/fileStorage');

async function uploadImage(req, res) {
  if (!req.file) {
    throw new AppError(400, ERROR_CODES.INVALID_FILE, 'Vui lòng chọn file ảnh');
  }
  const fileName = req.file.filename;
  return ok(res, {
    fileName,
    imageUrl: toSiteContentImageUrl(fileName),
  });
}

module.exports = { uploadImage };
