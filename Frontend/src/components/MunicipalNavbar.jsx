import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// SVG Icon Components
const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"/><path d="M15 5.764v15"/><path d="M9 3.236v15"/></svg>
);

const NavigationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
);

const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
);

const NAV_ITEMS = [
  { label: 'Home',         path: '/municipal',            icon: <MapIcon /> },
  { label: 'Marg Darshak', path: '/municipal/routes',     icon: <NavigationIcon /> },
  { label: 'Complaints',   path: '/municipal/complaints', icon: <MegaphoneIcon /> },
]

export default function MunicipalNavbar() {
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
    <div className={`fixed top-0 left-0 w-full z-50 px-4 pt-4 transition-all duration-500 float-nav ${scrolled ? 'pt-2' : 'pt-4'}`}>
      <nav
        className={`max-w-6xl mx-auto rounded-[2.5rem] px-6 py-2 flex items-center justify-between transition-all duration-500 border border-white/5 shadow-2xl overflow-hidden`}
        style={{
          background: scrolled ? 'rgba(13, 33, 55, 0.85)' : 'rgba(13, 33, 55, 0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 20px 50px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* Decorative inner glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

        {/* Left: Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group py-1 relative z-10 hover:opacity-100 transition-all opacity-90"
          onClick={() => navigate('/municipal')}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#e85520] flex items-center justify-center shadow-orange transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
            </div>
            {/* Logo pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-[#FF6B35] opacity-20 blur-md group-hover:blur-lg animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-baloo font-bold text-lg text-white leading-none">Bharat22</h1>
            <p className="font-dm text-[9px] font-bold text-orange-400 uppercase tracking-widest mt-0.5 opacity-70">Municipal Portal</p>
          </div>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:flex items-center p-1 bg-white/5 rounded-full border border-white/10 relative z-10">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative px-5 py-2.5 rounded-full font-dm font-bold text-[10px] transition-all duration-300 flex items-center gap-2 group uppercase tracking-widest`}
                style={{ color: active ? 'white' : 'rgba(255,255,255,0.6)' }}
              >
                {active && (
                  <div className="absolute inset-0 bg-[#FF6B35] rounded-full shadow-orange zoom-in" />
                )}
                {!active && (
                  <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-300 scale-90 group-hover:scale-100" />
                )}
                <span className={`relative z-10 text-base transition-transform group-hover:scale-110 ${!active && 'opacity-70 group-hover:opacity-100'}`}>
                  {item.icon}
                </span>
                <span className="relative z-10 hidden lg:block tracking-wide">
                  {item.label}
                </span>
                {/* Underline current */}
                {active && <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-2xl" />}
              </button>
            )
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full border border-white/10">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
             <span className="text-[10px] font-dm font-bold text-orange-100 uppercase tracking-tighter">Live Systems</span>
          </div>
          
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/') }}
            className="w-10 h-10 lg:w-auto lg:px-5 rounded-full bg-white/20 text-white font-dm font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all duration-300 border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span className="hidden lg:block">Logout</span>
          </button>

          {/* Mobile: Menu Toggle */}
          <button 
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-all text-white"
            onClick={() => setOpen(!open)}
          >
            <div className={`w-5 h-0.5 bg-white rounded-full transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
            <div className={`w-3 h-0.5 bg-white rounded-full transition-all ${open ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-white rounded-full transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div className="md:hidden mt-3 max-w-sm mx-auto bg-[#0d2137]/95 backdrop-blur-2xl rounded-3xl p-4 shadow-2xl border border-white/10 slide-up overflow-hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => { navigate(item.path); setOpen(false) }}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-dm font-bold text-sm tracking-wide uppercase">{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6B35] shadow-orange" />}
                </button>
              )
            })}
            <div className="h-px bg-white/10 my-2 mx-4" />
            <button
               onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/') }}
               className="flex items-center gap-4 p-4 rounded-2xl transition-all text-red-500 hover:bg-red-500/10"
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
