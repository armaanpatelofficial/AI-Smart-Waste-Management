// ─────────────────────────────────────────────
//  API Service  –  connects to Express backend
// ─────────────────────────────────────────────

const BASE_URL = '/api'

const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ── Auth ──────────────────────────────────────
export const authAPI = {
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  sendOtp:  (body) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify(body) }),
  getMe:    ()     => request('/auth/me'),
}

// ── Complaints ────────────────────────────────
export const complaintAPI = {
  getAll: ()     => request('/complaints'),
  resolve: (id)  => request(`/complaints/${id}/resolve`, { method: 'PATCH' }),
  create: async (formData) => {
    const res = await fetch(`${BASE_URL}/complaints`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: formData,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Submission failed')
    return data
  },
}

// ── Areas ─────────────────────────────────────
export const areaAPI = {
  getAll:  ()     => request('/areas'),
  getOne:  (name) => request(`/areas/${name}`),
}

// ── Vahan Chalak ──────────────────────────────
export const vahanAPI = {
  register:  (body) => request('/vahan/register', { method: 'POST', body: JSON.stringify(body) }),
  login:     (body) => request('/vahan/login',    { method: 'POST', body: JSON.stringify(body) }),
  getMe:     ()     => request('/vahan/me'),
  dashboard: ()     => request('/vahan/dashboard'),
}

// ── QR Code ───────────────────────────────────
export const qrAPI = {
  generate: () => request('/qr/generate', { method: 'POST' }),
  getMyQR:  () => request('/qr/my-qr'),
  scan: (qrCode) => request('/qr/scan', { method: 'POST', body: JSON.stringify({ qrCode }) }),
}

// ── Waste Logs ────────────────────────────────
export const wasteLogAPI = {
  create:    (body) => request('/waste-logs', { method: 'POST', body: JSON.stringify(body) }),
  getMyLogs: ()     => request('/waste-logs/my-logs'),
  getUserLogs: (userId) => request(`/waste-logs/user/${userId}`),
  getChalakLogs: (chalakId) => request(`/waste-logs/chalak/${chalakId}`),
}

