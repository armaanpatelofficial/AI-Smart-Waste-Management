const User = require('../Models/User');
const OTP = require('../Models/OTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      console.error('GMAIL_USER or GMAIL_PASS is missing in .env');
      return res.status(500).json({ message: 'Email configuration missing on server.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"AI Smart Kachra Vahan" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your OTP for AI Smart Kachra Vahan Registration',
      text: `Your OTP for registration is: ${otp}. This code will expire in 10 minutes.`,
    });

    res.json({ message: 'OTP sent to your email successfully.' });
  } catch (err) {
    console.error('Nodemailer Error:', err.message);
    res.status(500).json({ message: 'Failed to send OTP: ' + err.message });
  }
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, otp, address } = req.body;

    // 1. Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // 2. Clear OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    // 3. Check if user already exists (safety check)
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create and save new user
    // Generate unique QR code for public users
    const isPublicRole = (role || 'public') === 'public';
    const qrIdentifier = isPublicRole
      ? `BHARAT22-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
      : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'public',
      address,
      ...(qrIdentifier && { qrCode: qrIdentifier }),
    });

    res.status(201).json({
      message: 'Registration successful! You can now login.',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        swachhPoints: user.swachhPoints,
        level: user.level,
        qrCode: user.qrCode,
      },
    });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email. Please sign up.' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ message: `Access denied. This account is registered as ${user.role}.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password. Try again.' });
    }

    res.json({
      message: 'Login successful!',
      token: generateToken(user._id, user.role),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        swachhPoints: user.swachhPoints,
        level: user.level,
      },
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Login failed: ' + err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (req.user.id.startsWith('mock-id-')) {
      const role = req.user.role;
      return res.json({
        _id: req.user.id,
        name: (role.charAt(0).toUpperCase() + role.slice(1)) + ' Admin',
        email: role + '@example.com',
        role: role,
        swachhPoints: 1250,
        level: 4,
        qrCode: role === 'public' ? 'BHARAT22-MOCK-QR' : undefined
      });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, sendOTP, getMe };
