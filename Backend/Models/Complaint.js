const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
