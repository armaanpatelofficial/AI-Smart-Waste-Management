const express = require('express');
const router = express.Router();
const { getArea, getAllAreas } = require('../Controllers/areaController');
const { protect } = require('../Middlewares/auth');

router.get('/', protect, getAllAreas);
router.get('/:name', protect, getArea);

module.exports = router;
