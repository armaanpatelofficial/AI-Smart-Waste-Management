# AI Smart Kachra Vahan 🚛♻️

A full-stack smart waste management system built with React + Vite (Frontend) and Node.js + Express + MongoDB (Backend).

## 🚀 Getting Started

### Backend
```bash
cd Backend
npm install
# Add your MongoDB URI in .env
npm run dev
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 🗂️ Project Structure

```
BHARAT/
├── Backend/
│   ├── Config/         # Database config
│   ├── Controllers/    # Route handlers
│   ├── Middlewares/    # Auth, error handling
│   ├── Models/         # Mongoose schemas
│   ├── Routes/         # Express routes
│   └── index.js        # Entry point
│
├── Frontend/
│   ├── public/         # Static assets & map image
│   └── src/
│       ├── components/ # Reusable UI components
│       ├── pages/      # Public & Municipal pages
│       ├── services/   # API calls & dummy data
│       └── assets/     # Icons, images
│
└── Ai_Models/          # Python AI waste classification
```

## 🧰 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **AI Models:** Python (TensorFlow/PyTorch) - Waste classifier
