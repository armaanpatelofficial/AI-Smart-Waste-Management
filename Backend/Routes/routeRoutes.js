const express = require('express');
const router = express.Router();
const { getLiveRoute } = require('../Controllers/routeController');

// Route to get current optimized route data
router.get('/live', getLiveRoute);

module.exports = router;
