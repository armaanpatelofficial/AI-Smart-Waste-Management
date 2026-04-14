const mongoose = require('mongoose');

const wasteRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    required: true
  },
  creditScore: {
    type: Number,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true
  },
  feedback: {
    type: String
  },
  confidence: {
    type: Number
  },
  image: {
    type: String // Base64 or URL path
  },
  isCollected: {
    type: Boolean,
    default: false
  },
  quantity: {
    type: Number,
    default: 0.5 // Default 0.5 kg per scan
  }
}, { timestamps: true });

module.exports = mongoose.model('WasteRecord', wasteRecordSchema);
