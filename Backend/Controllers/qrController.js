const User = require('../Models/User');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// POST /api/qr/generate — generate QR for a user (called auto on signup or manually)
const generateQR = async (req, res) => {
  try {
    const userId = req.user.id;
    let user;
    if (userId === 'mock-id-public') {
      user = {
        _id: 'mock-id-public',
        name: 'Public Admin',
        role: 'public',
        qrCode: 'BHARAT22-MOCK-QR',
        save: async () => {} // Mock save
      };
    } else {
      user = await User.findById(userId);
    }

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'public') return res.status(403).json({ message: 'QR code is only for public users' });

    // If user already has a QR code, return it
    if (user.qrCode) {
      const qrDataUrl = await QRCode.toDataURL(user.qrCode, {
        width: 400,
        margin: 2,
        color: { dark: '#1a3c5e', light: '#ffffff' },
      });

      return res.json({
        qrCode: user.qrCode,
        qrImage: qrDataUrl,
        message: 'QR code already exists',
      });
    }

    // Generate unique QR identifier
    const qrIdentifier = `BHARAT22-${uuidv4().split('-')[0].toUpperCase()}-${user._id.toString().slice(-6).toUpperCase()}`;

    user.qrCode = qrIdentifier;
    await user.save();

    const qrDataUrl = await QRCode.toDataURL(qrIdentifier, {
      width: 400,
      margin: 2,
      color: { dark: '#1a3c5e', light: '#ffffff' },
    });

    res.json({
      qrCode: qrIdentifier,
      qrImage: qrDataUrl,
      message: 'QR code generated successfully',
    });
  } catch (err) {
    console.error('QR Generate Error:', err.message);
    res.status(500).json({ message: 'Failed to generate QR: ' + err.message });
  }
};

// GET /api/qr/my-qr — get current user's QR code
const getMyQR = async (req, res) => {
  try {
    let user;
    if (req.user.id === 'mock-id-public') {
      user = {
        _id: 'mock-id-public',
        name: 'Public Admin',
        role: 'public',
        qrCode: 'BHARAT22-MOCK-QR',
        address: 'Sector 22, Chandigarh'
      };
    } else {
      user = await User.findById(req.user.id);
    }
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.qrCode) {
      return res.status(404).json({ message: 'No QR code found. Please generate one first.' });
    }

    const qrDataUrl = await QRCode.toDataURL(user.qrCode, {
      width: 400,
      margin: 2,
      color: { dark: '#1a3c5e', light: '#ffffff' },
    });

    res.json({
      qrCode: user.qrCode,
      qrImage: qrDataUrl,
      userName: user.name,
      address: user.address,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/qr/scan — Vahan Chalak scans a QR code
const scanQR = async (req, res) => {
  try {
    const { qrCode } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'QR code is required' });

    let user;
    if (qrCode === 'BHARAT22-MOCK-QR') {
      user = {
        _id: 'mock-id-public',
        name: 'Public Admin',
        email: 'public@example.com',
        address: 'Sector 22, Chandigarh',
        swachhPoints: 1250,
        level: 4,
        role: 'public'
      };
    } else {
      user = await User.findOne({ qrCode }).select('-password');
    }
    if (!user) {
      return res.status(404).json({ message: 'Invalid QR code. No user found.' });
    }

    res.json({
      message: 'User found!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        swachhPoints: user.swachhPoints,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('QR Scan Error:', err.message);
    res.status(500).json({ message: 'Failed to scan QR: ' + err.message });
  }
};

module.exports = { generateQR, getMyQR, scanQR };
