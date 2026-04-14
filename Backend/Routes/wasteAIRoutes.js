const express = require('express');
const multer  = require('multer');
const path    = require('path');
const router  = express.Router();

const {
  predictWaste,
  predictFromCamera,
  captureFromHardware,
  getHealth,
  getModelInfo,
  submitFeedback,
  getFeedbackStats,
  triggerRetrain,
  getLatestAutoResult,
  toggleAutoLoop,
  streamVideoFeed,
} = require('../Controllers/wasteAIController');

// Use memory storage — image buffer is forwarded directly to the Python AI server.
// This avoids any dependency on an uploads directory for waste AI predictions.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|bmp/;
    const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files (JPG, PNG, JPEG, WEBP) are allowed'));
  },
});

const { protect } = require('../Middlewares/auth');

// Routes
router.post('/predict',          protect, upload.single('image'), predictWaste);
router.post('/predict/camera',   protect, predictFromCamera);
router.get('/capture-hardware',  protect, captureFromHardware);
router.get('/health',            getHealth);
router.get('/model-info',        getModelInfo);

// Feedback & Retraining
router.post('/feedback',         upload.single('image'), submitFeedback);
router.get('/feedback/stats',    getFeedbackStats);
router.post('/retrain',          triggerRetrain);

// Auto-Detection
router.get('/latest-auto-result', getLatestAutoResult);
router.post('/toggle-auto',       toggleAutoLoop);
router.get('/video-feed',         streamVideoFeed);

module.exports = router;

