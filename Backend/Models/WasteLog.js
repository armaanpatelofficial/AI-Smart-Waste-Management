const mongoose = require('mongoose');

const wasteLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  scannedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VahanChalak',
    required: true,
  },
  wasteType: {
    type: String,
    enum: ['Biodegradable', 'Recyclable', 'Hazardous', 'Mixed'],
    required: true,
  },
  quantity: {
    type: Number, // in kg
    default: 0,
  },
  credits: {
    type: Number,
    required: true,
  },
  mlDetection: {
    type: String, // raw ML detection result, if available
  },
  confidence: {
    type: Number,
  },
  notes: {
    type: String,
  },
  collectionDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for fast queries
wasteLogSchema.index({ userId: 1, collectionDate: -1 });
wasteLogSchema.index({ scannedBy: 1, collectionDate: -1 });

module.exports = mongoose.model('WasteLog', wasteLogSchema);
