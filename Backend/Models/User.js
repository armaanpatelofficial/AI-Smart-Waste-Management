const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['public', 'municipal'], default: 'public' },
  swachhPoints: { type: Number, default: 0 },
  level: { type: String, default: 'Bronze' },
  totalScans: { type: Number, default: 0 },
  totalWeight: { type: Number, default: 0 },
  qrCode: { type: String, unique: true, sparse: true }, // unique QR identifier for each house
  address: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
