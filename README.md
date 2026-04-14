# 🚛 AI Smart Kachra Vahan — BHARAT Project

> **Full-Stack Smart Waste Management System**  
> Swachh Bharat Mission 2.0 · Smart Cities Initiative · Government of India

---
## 📌 System Architecture

![Architecture](./assets/architecture.png)

## 📁 Project Structure

```
BHARAT/
├── Ai_Models/
│   ├── waste_classifier.py     ← MobileNetV2 waste image classifier
│   ├── model_server.py         ← Flask API serving the AI model
│   └── requirements.txt
│
├── Backend/
│   ├── Config/
│   │   └── database.js         ← MongoDB connection (Mongoose)
│   ├── Controllers/
│   │   ├── authController.js   ← register / login (JWT)
│   │   ├── complaintController.js
│   │   └── areaController.js
│   ├── Middlewares/
│   │   ├── auth.js             ← JWT protect + municipalOnly guard
│   │   └── errorHandler.js
│   ├── Models/
│   │   ├── User.js
│   │   └── Complaint.js
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   └── areaRoutes.js
│   ├── .env
│   ├── index.js                ← Express server entry point
│   └── package.json
│
└── Frontend/
    ├── public/
    │   ├── images/
    │   │   └── map-bg.jpeg     ← South Delhi satellite map
    │   └── favicon.svg
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   │   ├── PublicNavbar.jsx
    │   │   ├── MunicipalNavbar.jsx
    │   │   └── Card.jsx        ← BinStatusCard · RewardCard · ChatBubble
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── public/
    │   │   │   ├── PublicDashboard.jsx
    │   │   │   ├── SwachhAI.jsx
    │   │   │   ├── Chatbot.jsx
    │   │   │   ├── ReportIssue.jsx
    │   │   │   └── About.jsx
    │   │   └── municipal/
    │   │       ├── MunicipalHome.jsx   ← Interactive map with 4 clickable zones
    │   │       ├── AreaDetails.jsx
    │   │       ├── MargDarshak.jsx
    │   │       └── Complaints.jsx
    │   ├── services/
    │   │   ├── data.js         ← All dummy/static data
    │   │   └── api.js          ← Fetch wrapper for backend API
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css           ← Tailwind directives + animations
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── jsconfig.json
    └── package.json
```

---

## 🚀 Getting Started

### 1 — AI Model Server (Python)
```bash
cd Ai_Models
pip install -r requirements.txt
python model_server.py          # Runs on http://localhost:8000
```

### 2 — Backend (Node.js)
```bash
cd Backend
npm install

# Edit .env → set MONGO_URI and JWT_SECRET
npm run dev                     # Runs on http://localhost:5000
```

### 3 — Frontend (Vite + React)
```bash
cd Frontend
npm install
npm run dev                     # Runs on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

**Backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/kachra_vahan
JWT_SECRET=your_super_secret_key
NODE_ENV=development
```

---

## 🛣️ API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET  | `/api/complaints` | Get all complaints (municipal) |
| POST | `/api/complaints` | Submit new complaint |
| PATCH| `/api/complaints/:id/resolve` | Resolve complaint |
| GET  | `/api/areas` | Get all areas data |
| GET  | `/api/areas/:name` | Get single area |
| POST | `/predict` *(AI Server)* | Classify waste image |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v3, React Router v6 |
| Backend  | Node.js, Express 4, MongoDB, Mongoose, JWT, Multer |
| AI Model | Python, TensorFlow / Keras, MobileNetV2, Flask |
| Styling  | Tailwind CSS, Google Fonts (Baloo 2, DM Sans, Noto Sans Devanagari) |

---

## 🗺️ Pages & Routes

### Public User
| Route | Page |
|-------|------|
| `/` | Login — role selector |
| `/public` | Dashboard — points, rewards, history |
| `/public/swachh-ai` | AI waste image classifier |
| `/public/chatbot` | SwachhBot chat assistant |
| `/public/report` | Grievance & complaint portal |
| `/public/about` | About the system |

### Municipal Corporation
| Route | Page |
|-------|------|
| `/municipal` | Interactive map — 4 clickable zones |
| `/municipal/area/:name` | Area details — bins, Waste DNA, insights |
| `/municipal/routes` | Marg Darshak — optimised routes |
| `/municipal/complaints` | Complaint management |

---

*Built for Swachh Bharat Mission 2.0 — Smart Cities Initiative*
