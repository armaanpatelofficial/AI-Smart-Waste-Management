const express = require('express');
const router  = express.Router();
const { chatWithAI } = require('../Controllers/chatbotController');

// POST /api/chatbot/ask
router.post('/ask', chatWithAI);

module.exports = router;
