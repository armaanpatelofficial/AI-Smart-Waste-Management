import { useState, useEffect } from 'react'
import PublicNavbar from '../../components/PublicNavbar.jsx'
import { qrAPI } from '../../services/api.js'

export default function MyQRCode() {
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchQR = async () => {
      try {
        // Try to get existing QR first
        const data = await qrAPI.getMyQR()
        setQrData(data)
      } catch (err) {
        // If not found, generate one
        try {
          const data = await qrAPI.generate()
          setQrData(data)
        } catch (genErr) {
          setError(genErr.message || 'Failed to generate QR code')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchQR()
  }, [])

  const handleDownload = () => {
    if (!qrData?.qrImage) return
    const link = document.createElement('a')
    link.download = `BHARAT22-QR-${user.name || 'user'}.png`
    link.href = qrData.qrImage
    link.click()
  }

  const handlePrint = () => {
    const w = window.open('', '_blank')
    w.document.write(`
      <html>
        <head>
          <title>QR Code - ${user.name}</title>
          <style>
            body { 
              display: flex; flex-direction: column; align-items: center; justify-content: center;
              min-height: 100vh; margin: 0; font-family: 'Segoe UI', sans-serif;
              background: #fff;
            }
            .qr-card {
              border: 3px solid #1a3c5e; border-radius: 20px; padding: 40px; text-align: center;
              max-width: 400px;
            }
            .logo { font-size: 20px; font-weight: bold; color: #1a3c5e; margin-bottom: 15px; }
            img { width: 280px; height: 280px; }
            .name { font-size: 18px; font-weight: bold; margin-top: 15px; color: #333; }
            .code { font-size: 12px; color: #666; margin-top: 8px; letter-spacing: 2px; }
            .footer { font-size: 10px; color: #999; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="qr-card">
            <div class="logo">♻️ AI Smart Kachra Vahan</div>
            <img src="${qrData.qrImage}" alt="QR Code" />
            <div class="name">${user.name}</div>
            <div class="code">${qrData.qrCode}</div>
            <div class="footer">Swachh Bharat Mission 2.0 • Place this QR on your house gate</div>
          </div>
          <script>setTimeout(() => window.print(), 500)</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  return (
    <div className="min-h-screen bg-bg-main relative overflow-x-hidden">
      <PublicNavbar />

      <div className="max-w-2xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center mb-8 fade-in">
          <h1 className="font-baloo font-bold text-3xl text-gray-800">🏠 My QR Code</h1>
          <p className="text-gray-400 font-dm mt-1">
            Place this QR code on your house gate for waste collection tracking
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" style={{ borderColor: '#4CAF50', borderTopColor: 'transparent' }} />
            <p className="text-gray-400 font-dm">Loading your QR code...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">❌</p>
            <p className="text-red-500 font-dm">{error}</p>
          </div>
        ) : qrData ? (
          <div className="fade-in">
            {/* QR Card */}
            <div
              className="bg-white rounded-3xl p-10 border border-gray-100 text-center mb-8"
              style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.06)' }}
            >
              {/* Header decoration */}
              <div className="mb-6">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-dm font-bold"
                  style={{
                    background: 'linear-gradient(135deg,#4CAF50,#388E3C)',
                    color: '#fff',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                  }}
                >
                  ♻️ Swachh Bharat Mission
                </div>
              </div>

              {/* QR Image */}
              <div className="relative inline-block mb-6">
                <div
                  className="p-6 rounded-3xl inline-block"
                  style={{
                    background: '#f8fdf8',
                    border: '3px dashed #4CAF5040',
                  }}
                >
                  <img
                    src={qrData.qrImage}
                    alt="Your QR Code"
                    className="w-64 h-64 mx-auto"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>

                {/* Corner accents */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg" />
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg" />
              </div>

              {/* User info */}
              <h2 className="font-baloo font-bold text-2xl text-gray-800 mb-1">{user.name}</h2>
              <p className="font-dm text-sm text-gray-400 mb-6 tracking-[3px] font-bold">{qrData.qrCode}</p>

              {/* Action buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3 rounded-xl font-dm font-bold text-white text-sm transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg,#4CAF50,#388E3C)',
                    boxShadow: '0 4px 15px rgba(76,175,80,0.3)',
                  }}
                >
                  📥 Download
                </button>
                <button
                  onClick={handlePrint}
                  className="px-8 py-3 rounded-xl font-dm font-bold text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
                >
                  🖨️ Print
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div
              className="bg-white rounded-2xl p-6 border border-gray-100"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
            >
              <h3 className="font-baloo font-bold text-lg text-gray-800 mb-4">📋 How to use your QR Code</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Download or print your QR code', icon: '📥' },
                  { step: '2', text: 'Place it on your house main gate or entrance', icon: '🏠' },
                  { step: '3', text: 'When the waste collection vehicle (Vahan) arrives, the Chalak will scan your QR', icon: '📷' },
                  { step: '4', text: 'Properly segregated waste earns you more Swachh Points!', icon: '⭐' },
                ].map(item => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: '#4CAF5015', color: '#4CAF50' }}
                    >
                      {item.icon}
                    </div>
                    <p className="font-dm text-sm text-gray-600 pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
