import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNavbar from '../../components/PublicNavbar.jsx'
import { RewardCard } from '../../components/Card.jsx'
import { dummyData } from '../../services/data.js'
import { authAPI, wasteLogAPI } from '../../services/api.js'

import GaugeMeter from '../../components/GaugeMeter.jsx'

const QUICK_STATS_TEMPLATE = [
  { icon: '🗑️', label: 'Waste Reported',  value: '47 kg',  color: '#4CAF50', sub: 'This month'           },
  { icon: '🚛', label: 'Collections',     value: '23',     color: '#3b82f6', sub: 'Total pickups'         },
  { icon: '🎁', label: 'Rewards Earned',  value: '₹390',   color: '#f59e0b', sub: 'Total savings'         },
]

export default function PublicDashboard() {
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || dummyData.user)
  const [logsData, setLogsData] = useState({ logs: [], summary: {} })
  const [loading, setLoading] = useState(true)
  const { rewards } = dummyData

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [freshUser, freshLogs] = await Promise.all([
          authAPI.getMe(),
          wasteLogAPI.getMyLogs()
        ])
        setUser(freshUser)
        setLogsData(freshLogs)
        localStorage.setItem('user', JSON.stringify(freshUser))
      } catch (err) {
        console.error("Failed to sync dashboard data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const { logs, summary } = logsData
  const recentLogs = logs?.slice(0, 5) || []


  return (
    <div className="min-h-screen bg-bg-main relative overflow-x-hidden">
      <PublicNavbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        {/* Header */}
        <div className="mb-10 flex flex-col items-start fade-in px-2">
          <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
            <div>
              <h1 className="font-baloo font-bold text-4xl text-gray-800 tracking-tight">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-gray-400 font-dm mt-1 text-lg">Your waste management performance at a glance</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-2xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-[2px] text-green-700">Live Data Sync</span>
            </div>
          </div>
        </div>

        {/* Section 1: Credibility Gauge (Wide) */}
        <div className="mb-8">
          <div
            className="bg-white rounded-[2rem] p-8 border border-gray-100 slide-up group hover:shadow-2xl hover:border-green-200 transition-all duration-500 overflow-hidden"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}
          >
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-gray-400 font-dm text-sm font-bold tracking-[3px] uppercase opacity-60">
                    Your Community Impact
                  </span>
                  <span
                    className="text-xs px-5 py-2 rounded-xl font-dm font-black tracking-tight bg-green-50 text-green-600 border border-green-100 shadow-sm"
                  >
                    🏆 {(user.level || 'Bronze')} Member
                  </span>
                </div>
                <div className="max-w-md">
                   <h3 className="font-baloo font-bold text-3xl text-gray-800 mb-2">Points Milestones</h3>
                   <p className="text-gray-400 font-dm leading-relaxed">
                     You are doing a great job! You have earned <span className="text-green-600 font-bold">+{user.swachhPoints || 0} points</span> in total. 
                     Keep segregating your waste to reach the next level and unlock exclusive rewards.
                   </p>
                   <button 
                    onClick={() => navigate('/public/chatbot')}
                    className="mt-6 px-8 py-3 bg-gray-900 text-white rounded-2xl font-dm font-bold text-xs uppercase tracking-[2px] hover:bg-green-600 transition-all shadow-lg"
                  >
                    How to earn more?
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col items-center gap-6">
                 <div className="flex flex-col items-center">
                    <GaugeMeter value={user.swachhPoints || 0} max={2000} label="Points" accentColor="#4CAF50" />
                    <p className="text-green-600 text-sm font-bold font-dm mt-4">Target: 2,000 pts</p>
                 </div>
                 
                 {/* My QR Card CTA */}
                 <button 
                  onClick={() => navigate('/public/my-qr')}
                  className="w-full px-6 py-6 rounded-3xl border-2 border-dashed border-green-200 bg-green-50/30 flex items-center justify-between group/qr hover:bg-green-50 transition-all"
                 >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover/qr:scale-110 transition-transform">📱</div>
                     <div className="text-left">
                       <p className="font-baloo font-bold text-gray-800 leading-none">My House QR</p>
                       <p className="text-[10px] font-dm text-gray-400 mt-1 uppercase font-black tracking-wider">Show to Vahan Chalak</p>
                     </div>
                   </div>
                   <span className="text-green-600 font-black text-xl group-hover/qr:translate-x-1 transition-transform">→</span>
                 </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Waste Reported (Dynamic from logs) */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 slide-up group hover:border-green-200 hover:-translate-y-2 transition-all duration-300"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-300"
                style={{ background: '#4CAF5015', color: '#4CAF50' }}>🗑️</div>
              <div>
                <p className="text-gray-400 font-dm text-[10px] font-black tracking-[3px] uppercase opacity-70 mb-1">Total Collected</p>
                <p className="font-baloo font-bold text-4xl text-gray-800 tracking-tight leading-none">
                  {(user.totalWeight || 0).toFixed(1)} kg
                </p>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-50">
              <p className="text-xs text-gray-500 font-dm font-semibold italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
                All time collection
              </p>
            </div>
          </div>

          {/* Collections */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 slide-up group hover:border-blue-200 hover:-translate-y-2 transition-all duration-300"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.02)', animationDelay: '0.15s' }}>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-300"
                style={{ background: '#3b82f615', color: '#3b82f6' }}>🚛</div>
              <div>
                <p className="text-gray-400 font-dm text-[10px] font-black tracking-[3px] uppercase opacity-70 mb-1">Pickups</p>
                <p className="font-baloo font-bold text-4xl text-gray-800 tracking-tight leading-none">
                  {user.totalScans || 0}
                </p>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-50">
              <p className="text-xs text-gray-500 font-dm font-semibold italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                Total house visits
              </p>
            </div>
          </div>

          {/* Rewards Earned (Real points from backend) */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 slide-up group hover:border-[#f59e0b] hover:-translate-y-2 transition-all duration-300"
            style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.02)', animationDelay: '0.3s' }}>
            <div className="flex items-center gap-5 mb-6">
              <div className="w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-300"
                style={{ background: '#f59e0b15', color: '#f59e0b' }}>💎</div>
              <div>
                <p className="text-gray-400 font-dm text-[10px] font-black tracking-[3px] uppercase opacity-70 mb-1">Swachh Points</p>
                <p className="font-baloo font-bold text-4xl text-gray-800 tracking-tight leading-none">
                  {user.swachhPoints || 0}
                </p>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-50">
              <p className="text-xs text-gray-500 font-dm font-semibold italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                Available to redeem
              </p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="mb-8">
          <h2 className="font-baloo font-bold text-xl text-gray-800 mb-4">💰 Redeem Your Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((r, i) => {
              // Dynamic logic: User can redeem ALL their points for any of these categories
              const discountAvailable = user.swachhPoints || 0;
              const dynamicReward = {
                ...r,
                amount: `₹${discountAvailable} discount`,
                benefit: discountAvailable > 0 
                  ? `You have ₹${discountAvailable} available to deduct from your next ${r.title}.`
                  : `Start segregating waste to earn discounts on your ${r.title}!`
              };
              return (
                <RewardCard key={i} {...dynamicReward} onClick={() => setModal(dynamicReward)} />
              );
            })}
          </div>
        </div>

        {/* History table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-baloo font-bold text-xl text-gray-800">📊 Recent Collections</h2>
            <button 
              onClick={() => navigate('/public/waste-history')}
              className="text-green-600 font-dm text-sm font-bold hover:underline"
            >
              View Full History →
            </button>
          </div>
          <div className="overflow-x-auto">
            {recentLogs.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-400 font-dm text-sm">No collections recorded yet. Show your QR to the driver!</p>
              </div>
            ) : (
              <table className="w-full">
                <thead style={{ background: '#f8fdf8' }}>
                  <tr>
                    {['Date', 'Waste Type', 'Qty', 'Credits Earned'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-dm font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm font-dm text-gray-600">
                        {new Date(log.collectionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-5 py-4 text-sm font-dm font-semibold text-gray-700">
                        {log.wasteType}
                      </td>
                      <td className="px-5 py-4 text-sm font-dm text-gray-700">{log.quantity || 1} kg</td>
                      <td className="px-5 py-4 text-sm font-dm font-bold text-green-600">
                        +{log.credits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Reward modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setModal(null)}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl fade-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <p className="text-5xl mb-3">{modal.icon}</p>
              <h3 className="font-baloo font-bold text-2xl text-gray-800">{modal.title}</h3>
            </div>
            <div className="rounded-2xl p-4 mb-5" style={{ background: modal.color + '15' }}>
              <p className="font-dm text-gray-700 text-center">{modal.benefit}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-xl font-dm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Reward redeemed! ✅ Points deducted from your account.')
                  setModal(null)
                }}
                className="flex-1 py-3 rounded-xl font-dm font-semibold text-white transition-all"
                style={{ background: modal.color }}
              >
                Redeem Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
