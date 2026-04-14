import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages - Auth
import RoleSelection from './pages/RoleSelection.jsx'
import LoginPage     from './pages/LoginPage.jsx'
import SignupPage    from './pages/SignupPage.jsx'

// Pages - Public
import PublicDashboard from './pages/public/PublicDashboard.jsx'
import SwachhAI        from './pages/public/SwachhAI.jsx'
import Chatbot         from './pages/public/Chatbot.jsx'
import ReportIssue     from './pages/public/ReportIssue.jsx'
import About           from './pages/public/About.jsx'
import MyQRCode        from './pages/public/MyQRCode.jsx'
import WasteHistory    from './pages/public/WasteHistory.jsx'

// Pages - Municipal
import MunicipalHome from './pages/municipal/MunicipalHome.jsx'
import AreaDetails   from './pages/municipal/AreaDetails.jsx'
import MargDarshak   from './pages/municipal/MargDarshak.jsx'
import Complaints    from './pages/municipal/Complaints.jsx'

// Pages - Vahan Chalak
import VahanDashboard    from './pages/vahan/VahanDashboard.jsx'
import QRScanner         from './pages/vahan/QRScanner.jsx'
import CollectionHistory from './pages/vahan/CollectionHistory.jsx'

/**
 * A helper component to protect routes based on login status and user role.
 */
function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem('token')
  const userJson = localStorage.getItem('user')
  const user = userJson ? JSON.parse(userJson) : null

  // If not logged in, redirect to home (Role Selection)
  if (!token || !user) {
    return <Navigate to="/" replace />
  }

  // If user role doesn't match the required role for this page,
  // redirect them to their appropriate dashboard.
  if (user.role !== allowedRole) {
    const targets = { public: '/public', municipal: '/municipal', vahan: '/vahan' }
    const target = targets[user.role] || '/'
    return <Navigate to={target} replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public / Guest Routes */}
        <Route path="/"              element={<RoleSelection />} />
        <Route path="/login/:role"   element={<LoginPage />} />
        <Route path="/signup/:role"  element={<SignupPage />} />

        {/* Public User Routes (Protected) */}
        <Route path="/public"            element={<ProtectedRoute allowedRole="public"><PublicDashboard /></ProtectedRoute>} />
        <Route path="/public/swachh-ai"  element={<ProtectedRoute allowedRole="public"><SwachhAI /></ProtectedRoute>} />
        <Route path="/public/chatbot"    element={<ProtectedRoute allowedRole="public"><Chatbot /></ProtectedRoute>} />
        <Route path="/public/report"     element={<ProtectedRoute allowedRole="public"><ReportIssue /></ProtectedRoute>} />
        <Route path="/public/about"      element={<ProtectedRoute allowedRole="public"><About /></ProtectedRoute>} />
        <Route path="/public/my-qr"      element={<ProtectedRoute allowedRole="public"><MyQRCode /></ProtectedRoute>} />
        <Route path="/public/waste-history" element={<ProtectedRoute allowedRole="public"><WasteHistory /></ProtectedRoute>} />

        {/* Municipal Corporation Routes (Protected) */}
        <Route path="/municipal"                  element={<ProtectedRoute allowedRole="municipal"><MunicipalHome /></ProtectedRoute>} />
        <Route path="/municipal/area/:name"       element={<ProtectedRoute allowedRole="municipal"><AreaDetails /></ProtectedRoute>} />
        <Route path="/municipal/routes"           element={<ProtectedRoute allowedRole="municipal"><MargDarshak /></ProtectedRoute>} />
        <Route path="/municipal/complaints"       element={<ProtectedRoute allowedRole="municipal"><Complaints /></ProtectedRoute>} />

        {/* Vahan Chalak Routes (Protected) */}
        <Route path="/vahan"          element={<ProtectedRoute allowedRole="vahan"><VahanDashboard /></ProtectedRoute>} />
        <Route path="/vahan/scan"     element={<ProtectedRoute allowedRole="vahan"><QRScanner /></ProtectedRoute>} />
        <Route path="/vahan/history"  element={<ProtectedRoute allowedRole="vahan"><CollectionHistory /></ProtectedRoute>} />

        {/* Catch-all: redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
