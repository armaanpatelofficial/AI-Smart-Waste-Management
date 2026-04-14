import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { path: '/vahan',          label: 'Dashboard', icon: '📊' },
  { path: '/vahan/scan',     label: 'Scan QR',   icon: '📷' },
  { path: '/vahan/history',  label: 'History',   icon: '📋' },
]

export default function VahanNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <nav
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-5xl"
    >
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(124,58,237,0.15)'
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          onClick={() => navigate('/vahan')}
        >
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-lg transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
              boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
            }}
          >
            🚛
          </div>
          <div className="hidden xs:block">
            <p className="font-baloo font-bold text-xs sm:text-sm text-gray-800 leading-tight">
              Vahan Chalak
            </p>
            <p className="text-[9px] sm:text-[10px] text-purple-600 font-bold font-dm -mt-0.5 opacity-70 uppercase tracking-tighter">
              {user.name?.split(' ')[0] || 'Driver'}
            </p>
          </div>
        </div>

        {/* Links - Desktop */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 rounded-lg font-dm text-xs font-bold transition-all duration-300 flex items-center gap-2 group"
                style={{
                  background: isActive ? '#7C3AED' : 'transparent',
                  color: isActive ? '#fff' : '#64748b',
                }}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-125'}`}>{link.icon}</span>
                <span className="uppercase tracking-widest text-[10px]">{link.label}</span>
              </button>
            )
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl shadow-inner-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
             <span className="text-[10px] font-dm font-black text-purple-700 uppercase tracking-tighter">{user.vehicleNumber || 'N/A'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="h-9 px-4 rounded-xl font-dm text-[10px] font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-red-600 transition-all duration-300 shadow-lg shadow-gray-200"
          >
            Logout
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-purple-50 transition-all border border-purple-100/50"
          >
            <div className={`w-4 h-0.5 bg-purple-600 rounded-full transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-3 h-0.5 bg-purple-600 rounded-full transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-4 h-0.5 bg-purple-600 rounded-full transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="mt-2 rounded-2xl p-3 shadow-nav md:hidden fade-in"
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {NAV_LINKS.map(link => {
            const isActive = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMenuOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-dm text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : 'transparent',
                  color: isActive ? '#fff' : '#64748b',
                }}
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            )
          })}
        </div>
      )}
    </nav>
  )
}
