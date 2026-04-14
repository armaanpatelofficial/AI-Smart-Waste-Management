const axios = require('axios');

// The route-optimization FastAPI server runs on a DIFFERENT port from the
// YOLO Flask server (8000) to avoid conflicts.
// Default: http://127.0.0.1:8001  Override via ROUTE_SERVER_URL in .env
const ROUTE_SERVER = process.env.ROUTE_SERVER_URL || 'http://127.0.0.1:8001';

const getLiveRoute = async (req, res) => {
  try {
    const response = await axios.get(`${ROUTE_SERVER}/live`, { timeout: 15000 });
    res.json(response.data);
  } catch (error) {
    console.warn(`⚠️ Route optimization server unreachable at ${ROUTE_SERVER}/live`);
    res.status(503).json({
      message: `Route optimization service unavailable. Start it with: uvicorn app.main:app --port 8001`,
      error: error.message,
    });
  }
};

module.exports = { getLiveRoute };
