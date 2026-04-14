const Complaint = require('../Models/Complaint');

// POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { name, location, issueType, description, priority } = req.body;
    const image = req.file ? req.file.filename : null;
    const complaint = await Complaint.create({ name, location, issueType, description, priority, image });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/complaints/:id/resolve
const resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, { status: 'Resolved' }, { new: true });
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createComplaint, getComplaints, resolveComplaint };
