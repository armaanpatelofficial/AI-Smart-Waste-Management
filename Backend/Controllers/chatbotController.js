const axios = require('axios');

const PYTHON_CHAT_URL = process.env.PYTHON_CHAT_URL || 'http://localhost:8005/chat';

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: 'No message' });

    try {
      // 1. Forward message to newest Python AI server (main.py)
      const response = await axios.post(PYTHON_CHAT_URL, {
        message: message
      }, {
        timeout: 12000 // 12s timeout
      });

      const data = response.data;

      // 2. Format JSON output from Python into a beautiful string for UI
      if (data.items && Array.isArray(data.items)) {
        let text = "";
        
        data.items.forEach((it, index) => {
          text += `✨ **ITEM: ${it.name.toUpperCase()}**\n`;
          text += `━━━━━━━━━━━━━━━━━━━━\n`;
          text += `🏷️ **Category:** ${it.category}\n`;
          text += `💡 **Disposal:** ${it.disposal}\n`;
          // Add extra space if not last item
          if (index < data.items.length - 1) text += `\n`;
        });

        if (data.suggestion) {
          text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
          text += `🌟 **Note:** ${data.suggestion}`;
        }

        return res.json({ text: text.trim() });
      }

      // 3. Fallback if it's just raw suggestion from Python
      if (data.suggestion) {
          return res.json({ text: data.suggestion });
      }

    } catch (apiError) {
      if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ENOTFOUND') {
          console.warn('[Chatbot Controller] Python AI Server not running. Falling back to offline mode.');
      } else {
          console.error('[Chatbot Controller API Error]', apiError.message);
      }
    }

    // 4. Offline fallback (if server is down or returns error)
    return res.json({
      text: 'Swachh Bharat! My AI Brain (Ai_Models/main.py) is currently sleeping. Ensure it is running on Port 8005! Please dispose of waste correctly: Green Bin for Biodegradable, Blue Bin for Recyclable, Red Bin for Hazardous!',
    });
  } catch (error) {
    console.error('[Chatbot Overall Error]', error);
    res.status(500).json({ text: 'AI Assistant is resting. Try again soon!' });
  }
};

module.exports = { chatWithAI };
