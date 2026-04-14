const User = require('../Models/User');
const WasteRecord = require('../Models/WasteRecord');
const axios = require('axios');
const FormData = require('form-data');

// Get AI Server URL from environment or default
const AI_SERVER = process.env.AI_SERVER_URL || 'http://localhost:8000';

/**
 * Persists the segregation event and updates user points/level.
 */
const recordWasteActivity = async (userId, data) => {
  if (!userId) return;
  try {
    // 1. Save detailed record
    await WasteRecord.create({
      user: userId,
      wasteType: data.waste_type || 'Unknown',
      creditScore: data.credit_score || 0,
      pointsEarned: data.points || 0,
      feedback: data.feedback || '',
      confidence: data.confidence || 0,
      image: data.image || null,
      quantity: 0.5 // Add 0.5 kg for every AI scan
    });

    // 2. Update user Swachh points and Tier
    const user = await User.findById(userId);
    if (user) {
      user.swachhPoints = (user.swachhPoints || 0) + (data.points || 0);
      user.totalScans   = (user.totalScans || 0) + 1;
      user.totalWeight  = (user.totalWeight || 0) + 0.5;
      if (data.user_tier) user.level = data.user_tier;
      await user.save();
      console.log(`[DB] Activity recorded for user ${userId}: +${data.points} pts, Total Scans: ${user.totalScans}`);
    }
  } catch (err) {
    console.error('[DB Error] Failed to record waste activity:', err.message);
  }
};

/**
 * POST /api/waste-ai/predict
 * Accepts multipart image upload (held in memory), forwards buffer to Python YOLO server.
 */
const predictWaste = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename:    req.file.originalname || 'upload.jpg',
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_SERVER}/predict`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 30000,
    });

    // 💾 Persist to Database
    await recordWasteActivity(req.user?.id, response.data);

    return res.json(response.data);
  } catch (error) {
    console.error('[WasteAI] Prediction error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'AI Model Server is not running. Start it with: cd Ai_Models && python yolo_waste_server.py',
      });
    }

    return res.status(500).json({ error: 'Failed to classify waste image' });
  }
};

/**
 * POST /api/waste-ai/predict/camera
 * Accepts base64 image from camera module, forwards to Python YOLO server.
 */
const predictFromCamera = async (req, res) => {
  try {
    const { image, format } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided. Send base64 "image" field.' });
    }

    const response = await axios.post(`${AI_SERVER}/predict/camera`, {
      image,
      format: format || 'jpg',
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    // 💾 Persist to Database
    await recordWasteActivity(req.user?.id, response.data);

    return res.json(response.data);
  } catch (error) {
    console.error('[WasteAI] Camera prediction error:', error.message);

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'AI Model Server is not running.',
      });
    }

    return res.status(500).json({ error: 'Failed to classify camera image' });
  }
};

/**
 * GET /api/waste-ai/capture-hardware
 * Triggers Python server to fetch image from ESP32-CAM, classify it, and return result.
 */
const captureFromHardware = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER}/detect-from-cam`, {
      timeout: 30000,
    });

    // 💾 Persist to Database
    await recordWasteActivity(req.user?.id, response.data);

    return res.json(response.data);
  } catch (error) {
    console.error('[WasteAI] Hardware capture error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'AI Model Server is not reachable' });
    }

    const status = error.response ? error.response.status : 500;
    const msg = error.response && error.response.data ? error.response.data.error : 'Failed to capture from hardware';
    
    return res.status(status).json({ error: msg });
  }
};

/**
 * GET /api/waste-ai/health
 * Check if the Python AI server is running and model is loaded.
 */
const getHealth = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER}/health`, { timeout: 5000 });
    return res.json(response.data);
  } catch {
    return res.json({ status: 'offline', model_loaded: false, error: 'AI Model Server is not reachable' });
  }
};

/**
 * GET /api/waste-ai/model-info
 * Get model metadata from the Python server.
 */
const getModelInfo = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER}/model/info`, { timeout: 5000 });
    return res.json(response.data);
  } catch {
    return res.json({ model_type: 'YOLOv8', loaded: false, error: 'AI Model Server is not reachable' });
  }
};

/**
 * POST /api/waste-ai/feedback
 * Submit a correction: image + correct_label → Python AI server saves it for retraining.
 */
const submitFeedback = async (req, res) => {
  try {
    const { correct_label, image_base64 } = req.body;
    if (!correct_label) {
      return res.status(400).json({ error: 'correct_label is required' });
    }

    const formData = new FormData();
    formData.append('correct_label', correct_label);

    if (req.file) {
      // multipart image file
      formData.append('image', req.file.buffer, {
        filename: req.file.originalname || 'feedback.jpg',
        contentType: req.file.mimetype,
      });
    } else if (image_base64) {
      // base64 image from camera/preview
      formData.append('image_base64', image_base64);
    } else {
      return res.status(400).json({ error: 'No image provided (file or image_base64)' });
    }

    const response = await axios.post(`${AI_SERVER}/feedback`, formData, {
      headers: { ...formData.getHeaders() },
      timeout: 15000,
    });

    return res.json(response.data);
  } catch (error) {
    console.error('[WasteAI] Feedback error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'AI Model Server is not reachable' });
    }
    const status = error.response ? error.response.status : 500;
    const msg = error.response?.data?.error || 'Failed to submit feedback';
    return res.status(status).json({ error: msg });
  }
};

/**
 * GET /api/waste-ai/feedback/stats
 * Get count of correction images per class.
 */
const getFeedbackStats = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER}/feedback/stats`, { timeout: 5000 });
    return res.json(response.data);
  } catch {
    return res.json({ classes: {}, total: 0, error: 'AI Model Server is not reachable' });
  }
};

/**
 * POST /api/waste-ai/retrain
 * Trigger model retraining on accumulated corrections.
 */
const triggerRetrain = async (req, res) => {
  try {
    const response = await axios.post(`${AI_SERVER}/retrain`, {}, {
      timeout: 300000, // 5 min — retraining can take a while
    });
    return res.json(response.data);
  } catch (error) {
    console.error('[WasteAI] Retrain error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ error: 'AI Model Server is not reachable' });
    }
    const status = error.response ? error.response.status : 500;
    const msg = error.response?.data?.error || 'Retraining failed';
    return res.status(status).json({ error: msg });
  }
};

/**
 * GET /api/waste-ai/latest-auto-result
 * Proxies the latest detection result from the Python AI server.
 */
const getLatestAutoResult = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVER}/latest-result`, { timeout: 5000 });
    
    // If it's a new result that hasn't been recorded yet, we might want to record it.
    // For simplicity, the frontend can handle showing it, and we only record if it's "real" waste.
    if (response.data && response.data.waste_type && response.data.waste_type !== 'Mixed' && response.data.timestamp) {
      // Optional: Logic to avoid duplicate recording of the same timestamp
    }

    return res.json(response.data);
  } catch (error) {
    return res.json({ status: 'offline', error: 'AI Server unreachable' });
  }
};

/**
 * POST /api/waste-ai/toggle-auto
 * Starts or stops the background auto-detection loop on the AI server.
 */
const toggleAutoLoop = async (req, res) => {
  try {
    const { interval } = req.body;
    const response = await axios.post(`${AI_SERVER}/toggle-auto`, { interval }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    return res.json(response.data);
  } catch (error) {
    return res.status(503).json({ error: 'AI Server unreachable' });
  }
};

/**
 * GET /api/waste-ai/video-feed
 * Proxies the MJPEG stream from the Python AI server.
 */
const streamVideoFeed = async (req, res) => {
  try {
    const response = await axios({
      method: 'get',
      url: `${AI_SERVER}/video_feed`,
      responseType: 'stream',
      timeout: 5000,
    });

    res.setHeader('Content-Type', 'multipart/x-mixed-replace; boundary=frame');
    response.data.pipe(res);
  } catch (error) {
    res.status(503).send('AI Server stream unreachable');
  }
};

module.exports = {
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
};

