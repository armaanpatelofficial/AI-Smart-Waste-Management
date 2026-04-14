import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import VahanNavbar from '../../components/VahanNavbar.jsx'
import { qrAPI, wasteLogAPI } from '../../services/api.js'

const WASTE_TYPES = [
  { value: 'Biodegradable', icon: '🌿', color: '#4CAF50', label: 'Biodegradable', credits: '10 pts/unit' },
  { value: 'Recyclable', icon: '♻️', color: '#3b82f6', label: 'Recyclable', credits: '15 pts/unit' },
  { value: 'Hazardous', icon: '☣️', color: '#ef4444', label: 'Hazardous', credits: '5 pts/unit' },
  { value: 'Mixed', icon: '🗑️', color: '#f59e0b', label: 'Mixed', credits: '3 pts/unit' },
]

export default function QRScanner() {
  const navigate = useNavigate()
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  const [step, setStep] = useState('scan') // scan | found | collect | success
  const [scannedUser, setScannedUser] = useState(null)
  const [wasteType, setWasteType] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [manualCode, setManualCode] = useState('')
  const [cameraActive, setCameraActive] = useState(false)

  // Initialize scanner
  useEffect(() => {
    let scanner = null
    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        scanner = new Html5Qrcode('qr-reader')
        html5QrCodeRef.current = scanner

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          () => {} // ignore scan failures
        )
        setCameraActive(true)
      } catch (err) {
        console.error('Scanner init error:', err)
        setCameraActive(false)
      }
    }

    if (step === 'scan') {
      // Small delay to ensure DOM element exists
      setTimeout(initScanner, 300)
    }

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(() => {})
      }
    }
  }, [step])

  const onScanSuccess = async (decodedText) => {
    // PREVENT DOUBLE TRIGGERS: Only proceed if we are still in 'scan' step
    if (html5QrCodeRef.current?.isScanning) {
      try {
        await html5QrCodeRef.current.stop()
        setCameraActive(false)
        handleQRCode(decodedText)
      } catch (err) {
        console.warn('Stop scanner error:', err)
      }
    }
  }

  const handleQRCode = async (code) => {
    setIsScanning(true)
    setError('')
    try {
      const data = await qrAPI.scan(code)
      setScannedUser(data.user)
      setStep('found')
    } catch (err) {
      setError(err.message || 'Invalid QR code')
      setStep('scan')
    } finally {
      setIsScanning(false)
    }
  }

  const handleManualScan = (e) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    onScanSuccess(manualCode.trim())
  }

  const handleCollect = async (e) => {
    e.preventDefault()
    if (!wasteType) {
      setError('Please select a waste type')
      return
    }
    setIsRecording(true)
    setError('')

    try {
      const data = await wasteLogAPI.create({
        userId: scannedUser.id,
        wasteType,
        quantity: quantity ? parseFloat(quantity) : 1,
        notes,
      })
      setResult(data)
      setStep('success')
    } catch (err) {
      setError(err.message || 'Failed to record collection')
    } finally {
      setIsRecording(false)
    }
  }

  const resetScanner = () => {
    setStep('scan')
    setScannedUser(null)
    setWasteType('')
    setQuantity('')
    setNotes('')
    setError('')
    setResult(null)
    setManualCode('')
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#f4f0ff' }}>
      <VahanNavbar />

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        {/* Step: SCAN */}
        {step === 'scan' && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h1 className="font-baloo font-bold text-3xl text-gray-800">📷 Scan QR Code</h1>
              <p className="text-gray-400 font-dm mt-1">Point your camera at the household QR code</p>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-dm text-red-600 bg-red-50 border border-red-200 fade-in">
                {error}
              </div>
            )}

            <div
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 mb-6"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}
            >
              <div className="relative">
                <div
                  id="qr-reader"
                  ref={scannerRef}
                  className="w-full"
                  style={{ minHeight: 300 }}
                />
                {!cameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 bg-opacity-80 text-white">
                    <p className="text-4xl mb-3">📷</p>
                    <p className="font-dm text-sm">Camera initializing...</p>
                    <div className="spinner mt-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Manual entry fallback */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
            >
              <p className="font-dm text-sm font-bold text-gray-500 mb-3">Or enter QR code manually:</p>
              <form onSubmit={handleManualScan} className="flex gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value)}
                  placeholder="BHARAT22-XXXXXXXX-XXXXXX"
                  className="flex-1 px-4 py-3 rounded-xl font-dm text-sm border border-gray-200 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <button
                  type="submit"
                  disabled={isScanning}
                  className="px-6 py-3 rounded-xl font-dm font-bold text-white text-sm transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  }}
                >
                  {isScanning ? '...' : 'Verify'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step: USER FOUND */}
        {step === 'found' && scannedUser && (
          <div className="fade-in">
            <div className="text-center mb-8">
              <h1 className="font-baloo font-bold text-3xl text-gray-800">✅ User Found</h1>
              <p className="text-gray-400 font-dm mt-1">Record waste collection for this household</p>
            </div>

            {/* User info card */}
            <div
              className="bg-white rounded-3xl p-8 border border-gray-100 mb-8"
              style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-center gap-5 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: '#7C3AED15' }}
                >
                  🏠
                </div>
                <div>
                  <h3 className="font-baloo font-bold text-xl text-gray-800">{scannedUser.name}</h3>
                  <p className="font-dm text-sm text-gray-400">{scannedUser.email}</p>
                  {scannedUser.address && (
                    <p className="font-dm text-xs text-gray-400 mt-0.5">📍 {scannedUser.address}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-100">
                  <span className="font-dm text-xs font-bold text-green-700">
                    🏆 {scannedUser.swachhPoints} Points
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="font-dm text-xs font-bold text-purple-700">
                    ⭐ {scannedUser.level} Member
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-dm text-red-600 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            {/* Waste type selection */}
            <div
              className="bg-white rounded-3xl p-8 border border-gray-100 mb-6"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}
            >
              <h3 className="font-baloo font-bold text-lg text-gray-800 mb-4">Select Waste Type</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {WASTE_TYPES.map(wt => (
                  <button
                    key={wt.value}
                    onClick={() => setWasteType(wt.value)}
                    className="p-4 rounded-2xl border-2 transition-all duration-200 text-left"
                    style={{
                      borderColor: wasteType === wt.value ? wt.color : '#e5e7eb',
                      background: wasteType === wt.value ? wt.color + '10' : '#fff',
                      transform: wasteType === wt.value ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span className="text-2xl">{wt.icon}</span>
                    <p className="font-dm font-bold text-sm text-gray-800 mt-2">{wt.label}</p>
                    <p className="font-dm text-xs mt-0.5" style={{ color: wt.color }}>{wt.credits}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className="font-dm text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                    Quantity (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-3 rounded-xl font-dm text-sm border border-gray-200 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="font-dm text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any observations..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl font-dm text-sm border border-gray-200 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-3.5 rounded-xl font-dm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCollect}
                  disabled={isRecording || !wasteType}
                  className="flex-1 py-3.5 rounded-xl font-dm font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  }}
                >
                  {isRecording ? 'Recording...' : '✓ Record Collection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step: SUCCESS */}
        {step === 'success' && result && (
          <div className="fade-in text-center">
            <div
              className="bg-white rounded-3xl p-10 border border-gray-100 mb-8"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
            >
              <div
                className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl mb-6"
                style={{
                  background: 'linear-gradient(135deg,#4CAF50,#388E3C)',
                  boxShadow: '0 10px 30px rgba(76,175,80,0.3)',
                }}
              >
                ✅
              </div>

              <h2 className="font-baloo font-bold text-3xl text-gray-800 mb-2">Collection Recorded!</h2>
              <p className="text-gray-400 font-dm mb-8">Waste has been logged and credits awarded</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
                  <p className="text-green-600 font-dm text-xs font-bold uppercase tracking-wider">Credits Earned</p>
                  <p className="font-baloo font-bold text-3xl text-green-700 mt-1">+{result.creditsEarned}</p>
                </div>
                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                  <p className="text-purple-600 font-dm text-xs font-bold uppercase tracking-wider">User Total</p>
                  <p className="font-baloo font-bold text-3xl text-purple-700 mt-1">{result.userPointsTotal}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
                <p className="font-dm text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Collection Details</p>
                <div className="space-y-1">
                  <p className="font-dm text-sm text-gray-600">
                    <span className="font-bold">User:</span> {result.log?.userId?.name}
                  </p>
                  <p className="font-dm text-sm text-gray-600">
                    <span className="font-bold">Waste:</span> {result.log?.wasteType}
                  </p>
                  <p className="font-dm text-sm text-gray-600">
                    <span className="font-bold">Level:</span> {result.userLevel}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-4 rounded-xl font-dm font-bold text-white text-base transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                    boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
                  }}
                >
                  📷 Scan Next
                </button>
                <button
                  onClick={() => navigate('/vahan')}
                  className="flex-1 py-4 rounded-xl font-dm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
