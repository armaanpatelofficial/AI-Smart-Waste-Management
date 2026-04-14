# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**AI Smart Kachra Vahan** — a full-stack smart waste management system for Swachh Bharat Mission 2.0. Three independent services must all be running for full functionality.

## Running the Services

All three services must be started independently. There is no top-level orchestration script.

### 1. AI Model Server (Python) — port 8000

```bash
cd Ai_Models
pip install -r requirements.txt

# For waste classification (FastAPI/Flask) - Port 8000:
python yolo_waste_server.py

# For SwachhBot Chatbot (FastAPI) - Port 8005:
cd Ai_Models
python main.py
```

Only one classification server should run at a time on port 8000. `main.py` runs separately on 8005. Both use Gemini API keys.

### 2. Backend (Node.js/Express) — port 5000

```bash
cd Backend
npm install
npm run dev       # nodemon with hot reload
# or
npm start         # plain node, no reload
```

### 3. Frontend (Vite + React) — port 5173

```bash
cd Frontend
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build locally
```

## Environment Variables

`Backend/.env` (already present — update secrets for your environment):

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `PORT` | Express port (default 5000) |
| `AI_SERVER_URL` | Python AI server URL (default `http://localhost:8000`) |
| `GEMINI_API_KEY` | Google Gemini API key for SwachhBot chatbot |
| `GMAIL_USER` / `GMAIL_PASS` | Nodemailer SMTP credentials for OTP emails |

The Frontend has no `.env` — it uses Vite's proxy (`/api` → `localhost:5000`, `/uploads` → `localhost:5000`) configured in `Frontend/vite.config.js`.

## Architecture

### Service Communication Flow

```
Browser (5173)
  └─ Vite proxy /api → Express Backend (5000)
       └─ /api/waste-ai/* → Python AI Server (8000)
       └─ /api/routes/*   → Python AI Server (8000)
       └─ /api/chatbot/*  → Google Gemini API
       └─ /api/auth/*     → MongoDB (Atlas)
       └─ /api/complaints/*→ MongoDB (Atlas)
       └─ /api/areas/*    → MongoDB (Atlas)
```

### Backend (Node.js/Express)

- `index.js` — Entry point; registers all route groups
- `Config/database.js` — Mongoose connection
- `Middlewares/auth.js` — Two guards: `protect` (any authenticated user) and `municipalOnly` (role === `'municipal'`)
- `Models/User.js` — Two roles: `'public'` (citizens) and `'municipal'` (corporation staff); includes `swachhPoints` and `level` fields for the gamification system
- `Models/Complaint.js` — Complaint schema with `status` (Pending/Resolved) and `priority` (High/Medium/Low)
- `Controllers/wasteAIController.js` — Proxies image uploads to the Python server; if the Python server is unreachable (`ECONNREFUSED`), it returns a demo fallback response rather than erroring
- `Controllers/chatbotController.js` — Calls Gemini 1.5 Flash with a Swachh Bharat system prompt; falls back to a static offline message if `GEMINI_API_KEY` is absent or Gemini errors
- Uploaded complaint images are stored in `Backend/uploads/` (created by multer at runtime) and served statically at `/uploads`

### Frontend (React 18 + Vite)

- `src/App.jsx` — Root router; `ProtectedRoute` reads `token` and `user` from `localStorage` and redirects by role
- `src/services/api.js` — Central fetch wrapper; attaches JWT `Authorization: Bearer` header from `localStorage`
- `src/services/data.js` — Static/dummy data for areas, bin statuses, and rewards (supplements or replaces live backend data on some pages)
- Two parallel page trees under `src/pages/`:
  - `public/` — Citizen-facing: dashboard (points/rewards), SwachhAI (image classifier), Chatbot, ReportIssue, About
  - `municipal/` — Staff-facing: `MunicipalHome` (interactive Leaflet map with 4 clickable zones), `AreaDetails`, `MargDarshak` (route optimizer), `Complaints`

### AI Models (Python)

- `waste_classifier.py` — Legacy MobileNetV2 classifier (kept for reference); not actively used
- `model_server.py` — Lightweight YOLOv8 Flask server for web-based classification; loads `best_v2.pt`; exposes `POST /predict`, `POST /predict/camera`, `GET /health`, `GET /model/info`
- `yolo_waste_server.py` — Full-featured YOLOv8 server (`best_v2.pt`) with ESP32-CAM + MQTT integration; polls the ESP32-CAM periodically, classifies waste, and publishes results to MQTT topic `swachh/waste_detection` on `broker.emqx.io`; also exposes `GET /detect` for manual trigger

## Key Patterns

- **No test suite** — there is no test framework configured in this project.
- **Auth flow**: Login returns a JWT + user object; both are stored in `localStorage`. The `municipalOnly` middleware enforces the `municipal` role on sensitive routes.
- **Static data vs. live data**: Several Frontend pages may use data from `src/services/data.js` instead of (or in addition to) live API calls. Check both when debugging data issues.
- **AI server required for classification**: The Backend's waste-AI controller returns a 503 error when the Python AI server is unreachable. The Python server (`model_server.py`) must be running for real classification. If the YOLO model fails to load, the server returns a clear error instead of fake results.
