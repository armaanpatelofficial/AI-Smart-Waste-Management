const express = require('express');
const router = express.Router();
const { vahanRegister, vahanLogin, vahanGetMe, vahanDashboard } = require('../Controllers/vahanChalakController');
const { protect, vahanOnly } = require('../Middlewares/auth');

router.post('/register', vahanRegister);
router.post('/login', vahanLogin);
router.get('/me', protect, vahanOnly, vahanGetMe);
router.get('/dashboard', protect, vahanOnly, vahanDashboard);

module.exports = router;
