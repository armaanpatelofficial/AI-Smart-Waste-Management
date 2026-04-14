const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./Config/database');
const errorHandler = require('./Middlewares/errorHandler');

dotenv.config();

// Ensure uploads directory exists (required by complaint image disk storage)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[INFO] Created uploads directory:', uploadsDir);
}

connectDB();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/complaints', require('./Routes/complaintRoutes'));
app.use('/api/areas', require('./Routes/areaRoutes'));
app.use('/api/routes', require('./Routes/routeRoutes'));
app.use('/api/waste-ai', require('./Routes/wasteAIRoutes'));
app.use('/api/chatbot', require('./Routes/chatbotRoutes'));

// New: Vahan Chalak system routes
app.use('/api/vahan', require('./Routes/vahanChalakRoutes'));
app.use('/api/qr', require('./Routes/qrRoutes'));
app.use('/api/waste-logs', require('./Routes/wasteLogRoutes'));

app.get('/', (req, res) => res.json({ message: '🚛 AI Smart Kachra Vahan API Running' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
