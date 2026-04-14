const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createComplaint, getComplaints, resolveComplaint } = require('../Controllers/complaintController');
const { protect, municipalOnly } = require('../Middlewares/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post('/', upload.single('image'), createComplaint);
router.get('/', protect, municipalOnly, getComplaints);
router.patch('/:id/resolve', protect, municipalOnly, resolveComplaint);

module.exports = router;
