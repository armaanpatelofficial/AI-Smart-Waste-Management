import { useParams, useNavigate } from 'react-router-dom'
import MunicipalNavbar from '../../components/MunicipalNavbar.jsx'
import { BinStatusCard } from '../../components/Card.jsx'
import { dummyData } from '../../services/data.js'

const DNA_COLORS = {
  Plastic:  '#3b82f6',
  Organic:  '#4CAF50',
  Paper:    '#f59e0b',
  Electronic: '#8b5cf6',
  Hazardous:  '#ef4444',
}

// Stable High-Def Satellite Visuals for Instant Loading
const BGS = {
  'south-extension': 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80',
  'defence-colony':   'https://images.unsplash.com/photo-1541233349642-6e425fe6190e?auto=format&fit=crop&w=1200&q=80',
  'lajpat-nagar':     'https://images.unsplash.com/photo-1502472545332-e24162e3b2d3?auto=format&fit=crop&w=1200&q=80',
  'krishna-market':   'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80',
}

export default function AreaDetails() {
  const { name }  = useParams()
  const navigate  = useNavigate()
  const area      = dummyData.areas[name]

  /* ── 404 ── */
  if (!area) return (
    <div className="min-h-screen bg-[#0d2137] pt-24 text-center text-white">
      <MunicipalNavbar />
      <div className="max-w-3xl mx-auto py-20">
        <h2 className="text-3xl font-baloo">Map Data Unavailable</h2>
        <button onClick={() => navigate('/municipal')} className="mt-8 px-8 py-3 bg-white/10 rounded-2xl">← Return home</button>
      </div>
    </div>
  )

  const META = [
    ['👥', 'Population',         area.population],
    ['📐', 'Area',               area.area],
    ['🏷️', 'Type',               area.type],
    ['🚛', 'Collections Today',  area.collectionsToday],
    ['⚖️', 'Waste Collected',    area.wasteCollected],
  ]

  return (
    <div className="min-h-screen bg-[#f1f5f9] relative overflow-x-hidden pt-24 pb-12">
      <MunicipalNavbar />

      <div className="max-w-6xl mx-auto px-6 fade-in slide-up">

        {/* Improved Back Button */}
        <button
          onClick={() => navigate('/municipal')}
          className="mb-8 flex items-center gap-3 px-6 py-2.5 rounded-full font-dm font-black
                     text-[#0d2137] bg-white hover:bg-[#0d2137] hover:text-white transition-all text-[10px] uppercase tracking-[3px] shadow-lg group"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span> Mission Map
        </button>

        {/* ── CINEMATIC SATELLITE HERO ── */}
        <div
          className="relative rounded-[4rem] overflow-hidden mb-12 shadow-[0_50px_100px_rgba(0,0,0,0.15)] border-4 border-white fade-in group"
          style={{ minHeight: '420px' }}
        >
          {/* Enhanced Satellite Feed with No Gray Filters */}
          <div className="absolute inset-0 z-0">
             <img 
               src={BGS[name] || '/images/map-bg.jpeg'} 
               alt={`${area.name} view`} 
               className="w-full h-full object-cover transition-transform duration-[15000ms] scale-125 group-hover:scale-100 brightness-[1.1] contrast-[1.05]" 
             />
             {/* Subtle Glass overlay to ensure legibility but keep map visible */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#0d2137]/50 via-transparent to-transparent" />
             <div className="absolute inset-0 backdrop-blur-[6px] opacity-30" />
          </div>

          <div className="relative z-10 p-16 flex items-start justify-between flex-wrap gap-12 h-fill">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-10">
                <span className="px-6 py-2 rounded-full text-[10px] font-black tracking-[4px] bg-[#0d2137]/90 text-white backdrop-blur-xl">
                  📍 {area.type}
                </span>
                <span className="px-6 py-2 rounded-full text-[10px] font-black tracking-[4px] bg-[#FF6B35] text-white animate-pulse">
                  SAT FEED ACTIVE
                </span>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-[100px] filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)]">{area.emoji}</div>
                <div>
                  <h1 className="font-baloo font-bold text-7xl text-white tracking-tighter drop-shadow-xl">{area.name}</h1>
                  <p className="font-hindi text-white/90 text-3xl mt-4 tracking-wider drop-shadow-lg">{area.hindi}</p>
                </div>
              </div>

              <div className="mt-12 flex gap-4 flex-wrap">
                {area.landmarks.map(lm => (
                  <span key={lm} className="px-5 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-[10px] font-black text-white tracking-[2px] uppercase">
                    {lm}
                  </span>
                ))}
              </div>
            </div>

            {/* Premium Stats Overlay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 self-center">
              {META.map(([icon, label, val]) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-10 text-white min-w-[280px] shadow-2xl transition-transform hover:-translate-y-2"
                >
                  <p className="text-[11px] font-black uppercase tracking-[4px] text-white/50 mb-4">{icon} {label}</p>
                  <p className="font-dm font-black text-3xl tracking-tighter text-white whitespace-nowrap">{val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* ── About description ── */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 fade-in"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <h2 className="font-baloo font-bold text-xl text-gray-800 mb-3">📍 About {area.name}</h2>
          <p className="text-gray-600 font-dm leading-relaxed">{area.description}</p>

          {/* Landmarks */}
          <div className="mt-4 flex flex-wrap gap-2">
            {area.landmarks.map(lm => (
              <span
                key={lm}
                className="px-3 py-1 rounded-full text-sm font-dm bg-gray-100 text-gray-600"
              >
                📍 {lm}
              </span>
            ))}
          </div>
        </div>

        {/* ── Bin Status  +  Waste DNA ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Bin Status */}
          <div
            className="bg-white rounded-2xl border border-gray-100 p-6"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <h2 className="font-baloo font-bold text-xl text-gray-800 mb-4">🗑️ Bin Level Status</h2>
            {area.bins.map((bin, i) => (
              <BinStatusCard key={i} {...bin} />
            ))}
          </div>

          {/* Waste DNA */}
          <div
            className="bg-white rounded-2xl border border-gray-100 p-6"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
          >
            <h2 className="font-baloo font-bold text-xl text-gray-800 mb-1">🧬 Waste DNA Intelligence</h2>
            <p className="text-gray-400 text-sm font-dm mb-4 italic">
              "Waste fingerprint showing area behaviour"
            </p>

            {/* Bar chart */}
            <div className="space-y-4 mb-5">
              {Object.entries(area.wasteDNA).map(([type, pct]) => {
                const c = DNA_COLORS[type] || '#6b7280'
                return (
                  <div key={type}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: c }} />
                        <span className="font-dm font-medium text-gray-700 text-sm">{type}</span>
                      </div>
                      <span className="font-dm font-bold text-sm" style={{ color: c }}>{pct}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg,${c}88,${c})`,
                          transition: 'width 1s ease',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary chips */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(area.wasteDNA).map(([type, pct]) => {
                const c = DNA_COLORS[type] || '#6b7280'
                return (
                  <div
                    key={type}
                    className="flex-1 min-w-16 rounded-xl p-3 text-center"
                    style={{ background: c + '15', border: `1px solid ${c}30` }}
                  >
                    <p className="font-baloo font-bold text-xl" style={{ color: c }}>{pct}%</p>
                    <p className="text-xs text-gray-500 font-dm">{type}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── AI Insight ── */}
        <div
          className="rounded-2xl p-6 fade-in"
          style={{
            background: 'linear-gradient(135deg,#1a3c5e0d,#1a3c5e05)',
            border: '1px solid #1a3c5e22',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#1a3c5e,#0d2137)' }}
            >
              💡
            </div>
            <div>
              <h3 className="font-dm font-bold text-gray-800 mb-1">
                AI Insight for {area.name}
              </h3>
              <p className="text-gray-600 font-dm leading-relaxed">{area.insight}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
