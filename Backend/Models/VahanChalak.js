const mongoose = require('mongoose');

const vahanChalakSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  vehicleNumber: { type: String },
  assignedArea: { type: String },
  role: { type: String, default: 'vahan' },
  totalCollections: { type: Number, default: 0 },
  totalHousesVisited: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('VahanChalak', vahanChalakSchema);
