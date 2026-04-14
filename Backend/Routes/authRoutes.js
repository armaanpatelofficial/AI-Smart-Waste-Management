const express = require('express');
const router = express.Router();
const { register, login, sendOTP, getMe } = require('../Controllers/authController');
const { protect } = require('../Middlewares/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTP);
router.get('/me', protect, getMe);

module.exports = router;
