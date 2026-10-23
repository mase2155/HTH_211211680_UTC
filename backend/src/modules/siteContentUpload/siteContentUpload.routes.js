const express = require('express');
const { authenticate } = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const { uploadSiteContentImage } = require('../../middlewares/upload');
const { ROLES } = require('../../constants/roles');
const siteContentUploadController = require('./siteContentUpload.controller');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  uploadSiteContentImage,
  siteContentUploadController.uploadImage,
);

module.exports = router;
