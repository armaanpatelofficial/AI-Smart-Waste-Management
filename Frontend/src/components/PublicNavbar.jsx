import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// SVG Icon Components for better aesthetics
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const MessageSquareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const ClipboardListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const QrCodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/public',           icon: <HomeIcon /> },
  { label: 'Swachh AI',   path: '/public/swachh-ai', icon: <SparklesIcon /> },
  { label: 'My QR',       path: '/public/my-qr',      icon: <QrCodeIcon /> },
  { label: 'History',     path: '/public/waste-history', icon: <HistoryIcon /> },
  { label: 'Chatbot',     path: '/public/chatbot',   icon: <MessageSquareIcon /> },
  { label: 'Report Issue',path: '/public/report',    icon: <ClipboardListIcon /> },
  { label: 'About',       path: '/public/about',     icon: <InfoIcon />  },
]

export default function PublicNavbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={`fixed top-0 left-0 w-full z-50 px-3 pt-3 transition-all duration-500 ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-0 opacity-100'}`}>
      <nav
        className={`max-w-[1300px] mx-auto rounded-[2.5rem] px-4 sm:px-8 py-2.5 flex items-center justify-between transition-all duration-500 border border-white/30 shadow-2xl glassmorphism`}
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 20px 40px rgba(76,175,80,0.15)' : '0 10px 30px rgba(0,0,0,0.05)'
        }}
      >
        {/* Left: Logo */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group py-1 shrink-0"
          onClick={() => navigate('/public')}
        >
          <div className="relative">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[1.2rem] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-200 transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 11V7l-5 5 5 5v-4h3a1 1 0 0 0 1-1 1 1 0 0 0-1-1Z"/><path d="M17 13v4l5-5-5-5v4h-3a1 1 0 0 0-1 1 1 1 0 0 0 1 1Z"/><path d="M11 7V3l-5 5 5 5V9h3a1 1 0 0 1 1 1 1 1 0 0 1-1 1Z"/><path d="M13 17v4l5-5-5-5v4h-3a1 1 0 0 1-1-1 1 1 0 0 1 1-1Z"/></svg>
            </div>
          </div>
          <div className="hidden xs:block">
            <h1 className="font-baloo font-bold text-base sm:text-xl text-gray-900 leading-none">Bharat22</h1>
            <p className="font-dm text-[8px] sm:text-[10px] font-black text-green-600 uppercase tracking-widest mt-0.5 opacity-60">Portal</p>
          </div>
        </div>

        {/* Center: Desktop Menu - Optimized Spacing */}
        <div className="hidden md:flex items-center p-1.5 bg-gray-50/50 rounded-full border border-gray-100/50">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-3 sm:px-4 py-2 rounded-full font-dm font-black text-xs transition-all duration-500 flex items-center gap-2 group shrink-0`}
                style={{ color: active ? 'white' : '#64748b' }}
              >
                {active && (
                  <div className="absolute inset-0 bg-green-600 rounded-full shadow-lg shadow-green-200 zoom-in" />
                )}
                <span className={`relative z-10 text-base sm:text-lg transition-all duration-300 ${active ? 'scale-110' : 'group-hover:scale-125 group-hover:rotate-[10deg]'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10 hidden xl:block tracking-[0.1em] uppercase text-[9px]">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 shadow-inner-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-dm font-black text-green-700 uppercase tracking-widest whitespace-nowrap">Live Monitor</span>
          </div>
          
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/') }}
            className="h-10 px-4 sm:px-6 rounded-full bg-gray-900 text-white font-dm font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-red-600 transition-all duration-500 shadow-xl shadow-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="hidden sm:block">Logout</span>
          </button>

          {/* Mobile: Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-all bg-gray-50 rounded-full border border-gray-100"
            onClick={() => setOpen(!open)}
          >
            <div className={`w-5 h-0.5 bg-gray-800 rounded-full transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-3 h-0.5 bg-gray-800 rounded-full transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-800 rounded-full transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden mt-3 max-w-sm mx-auto bg-white rounded-3xl p-4 shadow-2xl border border-gray-100 slide-up overflow-hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setOpen(false) }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-dm font-bold text-sm tracking-wide uppercase">{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500 shadow-green" />}
                </button>
              )
            })}
            <div className="h-px bg-gray-100 my-2 mx-4" />
            <button
              onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/') }}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all text-red-500 hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
              <span className="font-dm font-bold text-sm tracking-wide uppercase">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
