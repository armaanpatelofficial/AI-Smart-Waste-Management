const WasteLog = require('../Models/WasteLog');
const User = require('../Models/User');
const VahanChalak = require('../Models/VahanChalak');
const WasteRecord = require('../Models/WasteRecord');

// Credit calculation based on waste type
const CREDIT_MAP = {
  Biodegradable: 10,
  Recyclable: 15,
  Hazardous: 5,
  Mixed: 3,
};

// POST /api/waste-logs — create a waste log entry after QR scan
const createWasteLog = async (req, res) => {
  try {
    const { userId, wasteType, quantity, notes, mlDetection, confidence } = req.body;
    const scannedBy = req.user.id;

    // Validate
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    // Role check: Only Vahan Chalak can record logs (already handled by middleware, but extra safety check)
    // const scannedBy = req.user.id;

    // Fetch latest pending ML detection record for this user
    let finalWasteType = wasteType;
    let finalMlDetection = mlDetection;
    let finalConfidence = confidence;
    let detectionId = null;

    const latestDetection = await WasteRecord.findOne({ 
      user: userId, 
      isCollected: false 
    }).sort({ createdAt: -1 });

    if (latestDetection) {
      // If driver didn't provide a type, use the detected one
      if (!finalWasteType) {
        finalWasteType = latestDetection.wasteType;
      }
      finalMlDetection = latestDetection.wasteType; // The detected type
      finalConfidence = latestDetection.confidence;
      detectionId = latestDetection._id;
    }

    if (!finalWasteType) {
      return res.status(400).json({ message: 'Waste type is required (no recent detection found).' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const chalak = await VahanChalak.findById(scannedBy);
    if (!chalak) return res.status(404).json({ message: 'Vahan Chalak not found.' });

    // Calculate credits
    const credits = CREDIT_MAP[finalWasteType] || 3;
    const totalCredits = quantity ? Math.round(credits * quantity) : credits;

    // Create waste log
    const log = await WasteLog.create({
      userId,
      scannedBy,
      wasteType: finalWasteType,
      quantity: quantity || 0,
      credits: totalCredits,
      mlDetection: finalMlDetection,
      confidence: finalConfidence,
      notes,
    });

    // If we linked a detection, mark it collected
    if (detectionId) {
      await WasteRecord.findByIdAndUpdate(detectionId, { isCollected: true });
    }

    // Update user's swachh points
    user.swachhPoints = (user.swachhPoints || 0) + totalCredits;

    // Update level based on points
    if (user.swachhPoints >= 1500) user.level = 'Platinum';
    else if (user.swachhPoints >= 1000) user.level = 'Gold';
    else if (user.swachhPoints >= 500) user.level = 'Silver';
    else user.level = 'Bronze';

    await user.save();

    // Update Vahan Chalak stats
    chalak.totalCollections = (chalak.totalCollections || 0) + 1;

    // Check if this is a new house for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingVisitToday = await WasteLog.findOne({
      scannedBy,
      userId,
      collectionDate: { $gte: todayStart },
      _id: { $ne: log._id },
    });

    if (!existingVisitToday) {
      chalak.totalHousesVisited = (chalak.totalHousesVisited || 0) + 1;
    }

    await chalak.save();

    // Populate the log for response
    const populatedLog = await WasteLog.findById(log._id)
      .populate('userId', 'name address email swachhPoints level')
      .populate('scannedBy', 'name vehicleNumber');

    res.status(201).json({
      message: 'Waste collection recorded successfully!',
      log: populatedLog,
      creditsEarned: totalCredits,
      userPointsTotal: user.swachhPoints,
      userLevel: user.level,
    });
  } catch (err) {
    console.error('Create WasteLog Error:', err.message);
    res.status(500).json({ message: 'Failed to create waste log: ' + err.message });
  }
};

// GET /api/waste-logs/user/:userId — get waste logs for a specific user
const getUserWasteLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await WasteLog.find({ userId })
      .sort({ collectionDate: -1 })
      .limit(50)
      .populate('scannedBy', 'name vehicleNumber');

    // Calculate summary
    const totalCredits = logs.reduce((sum, l) => sum + l.credits, 0);
    const wasteBreakdown = {};
    logs.forEach(l => {
      wasteBreakdown[l.wasteType] = (wasteBreakdown[l.wasteType] || 0) + 1;
    });

    res.json({
      logs,
      summary: {
        totalLogs: logs.length,
        totalCredits,
        wasteBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/waste-logs/my-logs — get logged-in user's waste logs
const getMyWasteLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const logs = await WasteLog.find({ userId })
      .sort({ collectionDate: -1 })
      .limit(50)
      .populate('scannedBy', 'name vehicleNumber');

    const totalCredits = logs.reduce((sum, l) => sum + l.credits, 0);
    const wasteBreakdown = {};
    logs.forEach(l => {
      wasteBreakdown[l.wasteType] = (wasteBreakdown[l.wasteType] || 0) + 1;
    });

    res.json({
      logs,
      summary: {
        totalLogs: logs.length,
        totalCredits,
        wasteBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/waste-logs/chalak/:chalakId — get waste logs by vahan chalak
const getChalakWasteLogs = async (req, res) => {
  try {
    const { chalakId } = req.params;
    const logs = await WasteLog.find({ scannedBy: chalakId })
      .sort({ collectionDate: -1 })
      .limit(50)
      .populate('userId', 'name address');

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createWasteLog, getUserWasteLogs, getMyWasteLogs, getChalakWasteLogs };
