import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VahanNavbar from '../../components/VahanNavbar.jsx'
import { vahanAPI } from '../../services/api.js'

export default function VahanDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'))
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await vahanAPI.dashboard()
        setDashboard(data)
        if (data.chalak) {
          setUser(prev => ({ ...prev, ...data.chalak }))
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()

    // Poll every 15 seconds for real-time updates
    const interval = setInterval(fetchDashboard, 15000)
    return () => clearInterval(interval)
  }, [])

  const todayStats = dashboard?.today || { collections: 0, housesVisited: 0, wasteSummary: {} }
  const recentLogs = dashboard?.recentLogs || []

  const wasteTypeColors = {
    Biodegradable: { bg: '#4CAF5018', color: '#4CAF50', icon: '🌿' },
    Recyclable: { bg: '#3b82f618', color: '#3b82f6', icon: '♻️' },
    Hazardous: { bg: '#ef444418', color: '#ef4444', icon: '☣️' },
    Mixed: { bg: '#f59e0b18', color: '#f59e0b', icon: '🗑️' },
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: '#f8f7ff' }}>
      <VahanNavbar />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-12 relative z-10">
        {/* Header */}
        <div className="mb-10 fade-in flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-[2px] bg-purple-600 rounded-full" />
              <p className="text-purple-600 font-dm text-[10px] font-black uppercase tracking-[4px]">Driver Portal</p>
            </div>
            <h1 className="font-baloo font-bold text-4xl sm:text-5xl text-gray-900 tracking-tight">
              Namaste, <span className="text-purple-600">{user.name?.split(' ')[0] || 'Chalak'}</span>! 🚛
            </h1>
            <p className="text-gray-400 font-dm mt-2 text-lg font-medium">Here's your collection summary for today.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-purple-100 rounded-2xl shadow-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-purple-500 rounded-full animate-ping opacity-40" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[2px] text-purple-700">Live Server Connected</span>
          </div>
        </div>

        {/* Hero Stats Section */}
        <div className="mb-12">
          <div
            className="rounded-[2.5rem] p-8 sm:p-12 border border-white/20 slide-up overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 50%, #4f46e5 100%)',
              boxShadow: '0 25px 50px -12px rgba(124,58,237,0.3)',
            }}
          >
            {/* Inner Patterns */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-900/20 rounded-full blur-2xl -ml-20 -mb-20" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
              <div className="flex-1 text-white">
                <p className="text-purple-100 font-dm text-xs font-bold tracking-[3px] uppercase mb-6 opacity-80">Collection Efficiency</p>
                <div className="flex items-baseline gap-4 mb-2">
                  <h2 className="font-baloo font-bold text-7xl sm:text-8xl leading-none">{todayStats.collections}</h2>
                  <span className="text-2xl sm:text-3xl font-dm font-medium text-purple-200 opacity-60">Pickups</span>
                </div>
                <p className="text-purple-100 font-dm text-lg sm:text-xl font-medium mb-10 opacity-90">Completed across {todayStats.housesVisited} households</p>
                
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl sm:text-3xl font-baloo font-bold">{todayStats.housesVisited}</p>
                    <p className="text-purple-200 font-dm text-[10px] font-bold uppercase tracking-wider">Houses Visited</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl sm:text-3xl font-baloo font-bold">{user.totalCollections || 0}</p>
                    <p className="text-purple-200 font-dm text-[10px] font-bold uppercase tracking-wider">Total Pickups</p>
                  </div>
                  <div className="hidden xs:block bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <p className="text-2xl sm:text-3xl font-baloo font-bold">{user.totalHousesVisited || 0}</p>
                    <p className="text-purple-200 font-dm text-[10px] font-bold uppercase tracking-wider">Total Houses</p>
                  </div>
                </div>
              </div>

              {/* Scan QR CTA - Premium Style */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-white/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
                  <button
                    onClick={() => navigate('/vahan/scan')}
                    className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-500 hover:scale-105 active:scale-95 group relative overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl shadow-2xl transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110">
                      📷
                    </div>
                    <span className="text-white font-dm font-black text-xs sm:text-sm uppercase tracking-[3px]">Scan QR</span>
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </button>
                </div>
                <p className="text-purple-100 text-[10px] font-dm font-bold uppercase mt-6 tracking-widest opacity-60">Tap to Scan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Waste Type Summary */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="font-baloo font-bold text-xl text-gray-800 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-purple-600" /> Categorical Summary
            </h3>
            <span className="text-[10px] font-dm font-black text-gray-400 uppercase tracking-widest">Today's Split</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(wasteTypeColors).map(([type, style]) => (
              <div
                key={type}
                className="bg-white rounded-3xl p-6 border border-gray-100 slide-up group hover:border-purple-200 hover:-translate-y-2 transition-all duration-300"
                style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110"
                    style={{ background: style.bg }}
                  >
                    {style.icon}
                  </div>
                  <span className="font-dm text-[11px] font-black uppercase tracking-widest leading-none" style={{ color: style.color }}>
                    {type}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="font-baloo font-bold text-4xl text-gray-900 leading-none">
                    {todayStats.wasteSummary[type] || 0}
                  </p>
                  <p className="text-gray-400 font-dm text-[9px] font-bold uppercase tracking-wider mb-1">Pickups</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Collections */}
        <div
          className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden slide-up"
          style={{ boxShadow: '0 15px 40px rgba(0,0,0,0.04)', animationDelay: '0.2s' }}
        >
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white">
            <h2 className="font-baloo font-bold text-xl text-gray-800">📋 Recent Collection History</h2>
            <button
              onClick={() => navigate('/vahan/history')}
              className="px-6 py-2 rounded-xl bg-purple-50 text-purple-600 font-dm text-[10px] font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all duration-300"
            >
              View Full Log →
            </button>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="spinner mx-auto mb-4" style={{ borderColor: '#7C3AED', borderTopColor: 'transparent', width: '40px', height: '40px' }} />
              <p className="text-gray-400 font-dm text-sm font-medium">Syncing with server...</p>
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl opacity-40 grayscale transition-all hover:grayscale-0 hover:scale-110">
                📭
              </div>
              <h4 className="font-baloo font-bold text-2xl text-gray-400 mb-2">No collections recorded yet</h4>
              <p className="text-gray-400 font-dm text-sm max-w-xs mx-auto">Start your day by visiting households and scanning their QR codes to earn credits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50">
                    {['Household Identifier', 'Waste Category', 'Credits', 'Timestamp'].map(h => (
                      <th key={h} className="text-left px-8 py-4 text-[10px] font-dm font-black text-gray-400 uppercase tracking-[2px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLogs.map((log, i) => {
                    const typeStyle = wasteTypeColors[log.wasteType] || wasteTypeColors.Mixed
                    return (
                      <tr key={i} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-dm text-gray-700">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                              {log.userId?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800">{log.userId?.name || 'Unknown User'}</p>
                              <p className="text-[10px] text-gray-400 uppercase tracking-tight">{log.userId?.address || 'Area Zone 4'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm"
                            style={{ background: typeStyle.bg, color: typeStyle.color }}
                          >
                            <span className="text-sm">{typeStyle.icon}</span> {log.wasteType}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-baloo font-bold text-purple-600">+{log.credits} pts</span>
                            <span className="text-[9px] text-gray-400 font-dm uppercase">Rewarded</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-xs font-dm text-gray-400 font-medium">
                          {new Date(log.collectionDate).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
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
