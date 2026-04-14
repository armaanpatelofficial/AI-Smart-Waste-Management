const express = require('express');
const router = express.Router();
const { createWasteLog, getUserWasteLogs, getMyWasteLogs, getChalakWasteLogs } = require('../Controllers/wasteLogController');
const { protect, vahanOnly } = require('../Middlewares/auth');

// Vahan Chalak creates a waste log after QR scan
router.post('/', protect, vahanOnly, createWasteLog);

// Public user gets their own waste logs
router.get('/my-logs', protect, getMyWasteLogs);

// Get waste logs for a specific user (municipal/admin)
router.get('/user/:userId', protect, getUserWasteLogs);

// Get waste logs by a specific vahan chalak
router.get('/chalak/:chalakId', protect, getChalakWasteLogs);

module.exports = router;
