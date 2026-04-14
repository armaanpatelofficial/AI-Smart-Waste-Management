import { useState, useEffect } from 'react'
import VahanNavbar from '../../components/VahanNavbar.jsx'
import { wasteLogAPI } from '../../services/api.js'

const wasteTypeColors = {
  Biodegradable: { bg: '#4CAF5018', color: '#4CAF50', icon: '🌿' },
  Recyclable: { bg: '#3b82f618', color: '#3b82f6', icon: '♻️' },
  Hazardous: { bg: '#ef444418', color: '#ef4444', icon: '☣️' },
  Mixed: { bg: '#f59e0b18', color: '#f59e0b', icon: '🗑️' },
}

export default function CollectionHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await wasteLogAPI.getChalakLogs(user.id)
        setLogs(data.logs || [])
      } catch (err) {
        console.error('Fetch logs error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  // Group by date
  const groupedByDate = logs.reduce((acc, log) => {
    const date = new Date(log.collectionDate).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(log)
    return acc
  }, {})

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#f4f0ff' }}>
      <VahanNavbar />

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-12">
        <div className="mb-8 fade-in">
          <h1 className="font-baloo font-bold text-3xl text-gray-800">📋 Collection History</h1>
          <p className="text-gray-400 font-dm mt-1">All your past waste collections</p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <p className="font-baloo font-bold text-2xl text-purple-700">{logs.length}</p>
            <p className="font-dm text-xs text-gray-400">Total Collections</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <p className="font-baloo font-bold text-2xl text-green-700">
              {logs.reduce((s, l) => s + l.credits, 0)}
            </p>
            <p className="font-dm text-xs text-gray-400">Total Credits Given</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 text-center"
            style={{ boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <p className="font-baloo font-bold text-2xl text-blue-700">
              {new Set(logs.map(l => l.userId?._id || l.userId)).size}
            </p>
            <p className="font-dm text-xs text-gray-400">Unique Houses</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="spinner mx-auto mb-3" style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }} />
            <p className="text-gray-400 font-dm">Loading history...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-400 font-dm text-lg">No collections recorded yet.</p>
          </div>
        ) : (
          Object.entries(groupedByDate).map(([date, dayLogs]) => (
            <div key={date} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-purple-100" />
                <span className="font-dm text-xs font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">
                  {date}
                </span>
                <div className="h-px flex-1 bg-purple-100" />
              </div>

              <div className="space-y-3">
                {dayLogs.map((log, i) => {
                  const ts = wasteTypeColors[log.wasteType] || wasteTypeColors.Mixed
                  return (
                    <div
                      key={i}
                      className="bg-white rounded-2xl p-5 border border-gray-100 flex items-center gap-5 hover:border-purple-200 transition-all"
                      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: ts.bg }}
                      >
                        {ts.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-dm font-bold text-sm text-gray-800 truncate">
                          {log.userId?.name || 'Unknown User'}
                        </p>
                        <p className="font-dm text-xs text-gray-400">{log.userId?.address || 'No address'}</p>
                      </div>

                      <span
                        className="px-3 py-1 rounded-lg text-xs font-dm font-bold flex-shrink-0"
                        style={{ background: ts.bg, color: ts.color }}
                      >
                        {log.wasteType}
                      </span>

                      <div className="text-right flex-shrink-0">
                        <p className="font-dm font-bold text-sm text-purple-600">+{log.credits}</p>
                        <p className="font-dm text-xs text-gray-400">
                          {new Date(log.collectionDate).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
