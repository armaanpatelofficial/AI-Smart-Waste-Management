const express = require('express');
const router = express.Router();
const { generateQR, getMyQR, scanQR } = require('../Controllers/qrController');
const { protect, vahanOnly } = require('../Middlewares/auth');

// Public user endpoints (require login)
router.post('/generate', protect, generateQR);
router.get('/my-qr', protect, getMyQR);

// Vahan Chalak scan endpoint
router.post('/scan', protect, vahanOnly, scanQR);

module.exports = router;
