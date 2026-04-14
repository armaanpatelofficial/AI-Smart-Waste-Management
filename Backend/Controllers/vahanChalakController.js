const VahanChalak = require('../Models/VahanChalak');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const WasteLog = require('../Models/WasteLog');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/vahan/register
const vahanRegister = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleNumber, assignedArea } = req.body;

    const exists = await VahanChalak.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Vahan Chalak already registered with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const chalak = await VahanChalak.create({
      name,
      email,
      password: hashedPassword,
      phone,
      vehicleNumber,
      assignedArea,
    });

    res.status(201).json({
      message: 'Vahan Chalak registered successfully!',
      token: generateToken(chalak._id, 'vahan'),
      user: {
        id: chalak._id,
        name: chalak.name,
        email: chalak.email,
        role: 'vahan',
        vehicleNumber: chalak.vehicleNumber,
        assignedArea: chalak.assignedArea,
      },
    });
  } catch (err) {
    console.error('Vahan Register Error:', err.message);
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
};

// POST /api/vahan/login
const vahanLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const chalak = await VahanChalak.findOne({ email });
    if (!chalak) {
      return res.status(404).json({ message: 'No Vahan Chalak account found. Please sign up.' });
    }

    const isMatch = await bcrypt.compare(password, chalak.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(chalak._id, 'vahan'),
      user: {
        id: chalak._id,
        name: chalak.name,
        email: chalak.email,
        role: 'vahan',
        vehicleNumber: chalak.vehicleNumber,
        assignedArea: chalak.assignedArea,
        totalCollections: chalak.totalCollections,
        totalHousesVisited: chalak.totalHousesVisited,
      },
    });
  } catch (err) {
    console.error('Vahan Login Error:', err.message);
    res.status(500).json({ message: 'Login failed: ' + err.message });
  }
};

// GET /api/vahan/me
const vahanGetMe = async (req, res) => {
  try {
    if (req.user.id.startsWith('mock-id-')) {
      return res.json({
        _id: req.user.id,
        name: 'Vahan Chalak Admin',
        email: 'vahan@example.com',
        role: 'vahan',
        vehicleNumber: 'PB-10-BH-2022',
        assignedArea: 'Ludhiana - Zone A',
        totalCollections: 154,
        totalHousesVisited: 120,
      });
    }
    const chalak = await VahanChalak.findById(req.user.id).select('-password');
    if (!chalak) return res.status(404).json({ message: 'Vahan Chalak not found' });
    res.json(chalak);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/vahan/dashboard
const vahanDashboard = async (req, res) => {
  try {
    let chalak;
    if (req.user.id.startsWith('mock-id-')) {
      chalak = {
        _id: req.user.id,
        name: 'Vahan Chalak Admin',
        email: 'vahan@example.com',
        vehicleNumber: 'PB-10-BH-2022',
        assignedArea: 'Ludhiana - Zone B',
        totalCollections: 154,
        totalHousesVisited: 120,
      };
      
      // Return mock dashboard stats
      return res.json({
        chalak,
        today: {
          collections: 12,
          housesVisited: 10,
          wasteSummary: { 'Biodegradable': 8, 'Non-Biodegradable': 4 },
        },
        recentLogs: [], // Empty for mock
      });
    }

    chalak = await VahanChalak.findById(req.user.id).select('-password');
    if (!chalak) return res.status(404).json({ message: 'Vahan Chalak not found' });

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayLogs = await WasteLog.find({
      scannedBy: chalak._id,
      collectionDate: { $gte: todayStart },
    }).populate('userId', 'name address');

    // Waste type summary for today
    const wasteSummary = {};
    todayLogs.forEach(log => {
      wasteSummary[log.wasteType] = (wasteSummary[log.wasteType] || 0) + 1;
    });

    // Unique houses visited today
    const uniqueHousesToday = new Set(todayLogs.map(l => l.userId?._id?.toString())).size;

    // Recent 10 logs
    const recentLogs = await WasteLog.find({ scannedBy: chalak._id })
      .sort({ collectionDate: -1 })
      .limit(10)
      .populate('userId', 'name address');

    res.json({
      chalak,
      today: {
        collections: todayLogs.length,
        housesVisited: uniqueHousesToday,
        wasteSummary,
      },
      recentLogs,
    });
  } catch (err) {
    console.error('Dashboard Error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { vahanRegister, vahanLogin, vahanGetMe, vahanDashboard };
