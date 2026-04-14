import { useState, useEffect } from 'react'
import PublicNavbar from '../../components/PublicNavbar.jsx'
import { wasteLogAPI } from '../../services/api.js'

const wasteTypeColors = {
  Biodegradable: { bg: '#4CAF5015', color: '#4CAF50', icon: '🌿', label: 'Bio' },
  Recyclable: { bg: '#3b82f615', color: '#3b82f6', icon: '♻️', label: 'Recycle' },
  Hazardous: { bg: '#ef444415', color: '#ef4444', icon: '☣️', label: 'Hazard' },
  Mixed: { bg: '#f59e0b15', color: '#f59e0b', icon: '🗑️', label: 'Mixed' },
}

export default function WasteHistory() {
  const [data, setData] = useState({ logs: [], summary: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await wasteLogAPI.getMyLogs()
        setData(result)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()

    // Real-time-ish polling every 15s
    const interval = setInterval(fetchLogs, 15000)
    return () => clearInterval(interval)
  }, [])

  const { logs, summary } = data
  const breakdown = summary?.wasteBreakdown || {}

  return (
    <div className="min-h-screen bg-bg-main relative overflow-x-hidden">
      <PublicNavbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8 fade-in">
          <h1 className="font-baloo font-bold text-3xl text-gray-800">📊 Waste Collection History</h1>
          <p className="text-gray-400 font-dm mt-1">Track your waste collection records and earned credits</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center slide-up"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <p className="font-baloo font-bold text-2xl text-green-700">{summary?.totalLogs || 0}</p>
            <p className="font-dm text-xs text-gray-400 mt-1">Total Collections</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center slide-up"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)', animationDelay: '0.1s' }}>
            <p className="font-baloo font-bold text-2xl text-purple-700">{summary?.totalCredits || 0}</p>
            <p className="font-dm text-xs text-gray-400 mt-1">Credits Earned</p>
          </div>
          {Object.entries(breakdown).map(([type, count], i) => {
            const ts = wasteTypeColors[type] || wasteTypeColors.Mixed
            return (
              <div key={type} className="bg-white rounded-2xl p-5 border border-gray-100 text-center slide-up"
                style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)', animationDelay: `${0.2 + i * 0.1}s` }}>
                <p className="font-baloo font-bold text-2xl" style={{ color: ts.color }}>{count}</p>
                <p className="font-dm text-xs text-gray-400 mt-1">{ts.icon} {type}</p>
              </div>
            )
          })}
        </div>

        {/* Waste breakdown bar */}
        {logs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-8"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <p className="font-dm text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Waste Distribution</p>
            <div className="flex rounded-xl overflow-hidden h-4">
              {Object.entries(breakdown).map(([type, count]) => {
                const ts = wasteTypeColors[type] || wasteTypeColors.Mixed
                const pct = ((count / (summary?.totalLogs || 1)) * 100).toFixed(0)
                return (
                  <div
                    key={type}
                    title={`${type}: ${pct}%`}
                    className="transition-all duration-500"
                    style={{ width: pct + '%', background: ts.color, minWidth: count > 0 ? '4px' : '0' }}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              {Object.entries(breakdown).map(([type, count]) => {
                const ts = wasteTypeColors[type] || wasteTypeColors.Mixed
                return (
                  <div key={type} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: ts.color }} />
                    <span className="font-dm text-xs text-gray-500">{type} ({count})</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Logs table */}
        <div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <div className="p-5 border-b border-gray-50">
            <h2 className="font-baloo font-bold text-xl text-gray-800">🗂️ Collection Records</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="spinner mx-auto mb-3" style={{ borderColor: '#4CAF50', borderTopColor: 'transparent' }} />
              <p className="text-gray-400 font-dm text-sm">Loading...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-5xl mb-4">📭</p>
              <p className="text-gray-400 font-dm">No waste collection records yet.</p>
              <p className="text-gray-300 font-dm text-sm mt-1">Records will appear here when the Vahan Chalak scans your QR code.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: '#f8fdf8' }}>
                  <tr>
                    {['Date', 'Waste Type', 'Qty', 'Credits', 'Collected By'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-dm font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => {
                    const ts = wasteTypeColors[log.wasteType] || wasteTypeColors.Mixed
                    return (
                      <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-dm text-gray-600">
                          {new Date(log.collectionDate).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(log.collectionDate).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-dm font-bold"
                            style={{ background: ts.bg, color: ts.color }}
                          >
                            {ts.icon} {log.wasteType}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-dm text-gray-600">
                          {log.quantity ? `${log.quantity} kg` : '-'}
                        </td>
                        <td className="px-5 py-4 text-sm font-dm font-bold text-green-600">
                          +{log.credits}
                        </td>
                        <td className="px-5 py-4 text-sm font-dm text-gray-600">
                          {log.scannedBy?.name || 'N/A'}
                          {log.scannedBy?.vehicleNumber && (
                            <span className="text-xs text-gray-400 ml-1">({log.scannedBy.vehicleNumber})</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
