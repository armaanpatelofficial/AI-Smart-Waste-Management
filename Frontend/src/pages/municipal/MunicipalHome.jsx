import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MunicipalNavbar from '../../components/MunicipalNavbar.jsx'
import { Card } from '../../components/Card.jsx'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const AREAS = [
  { 
    key: 'lajpat-nagar', 
    label: 'Lajpat Nagar', 
    lat: 28.5670, 
    lng: 77.2430, 
    color: '#ef4444', 
    binLevel: 82, 
    icon: '🏘️' 
  },
  { 
    key: 'krishna-market', 
    label: 'Krishna Market', 
    lat: 28.5710, 
    lng: 77.2400, 
    color: '#f59e0b', 
    binLevel: 91, 
    icon: '🛒' 
  },
  { 
    key: 'defence-colony', 
    label: 'Defence Col', 
    lat: 28.5680, 
    lng: 77.2300, 
    color: '#3b82f6', 
    binLevel: 64, 
    icon: '🏡' 
  },
  { 
    key: 'south-extension', 
    label: 'South Ext', 
    lat: 28.5720, 
    lng: 77.2210, 
    color: '#8b5cf6', 
    binLevel: 32, 
    icon: '🏢' 
  },
  { 
    key: 'andrews-ganj', 
    label: 'Andrews Ganj', 
    lat: 28.5610, 
    lng: 77.2280, 
    color: '#10b981', 
    binLevel: 42, 
    icon: '🏘️' 
  },
  { 
    key: 'moolchand', 
    label: 'Moolchand', 
    lat: 28.5630, 
    lng: 77.2340, 
    color: '#f43f5e', 
    binLevel: 85, 
    icon: '🏥' 
  },
  { 
    key: 'jangpura', 
    label: 'Jangpura', 
    lat: 28.5830, 
    lng: 77.2410, 
    color: '#6366f1', 
    binLevel: 56, 
    icon: '🏘️' 
  },
  { 
    key: 'sewa-nagar', 
    label: 'Sewa Nagar', 
    lat: 28.5770, 
    lng: 77.2260, 
    color: '#84cc16', 
    binLevel: 34, 
    icon: '🏠' 
  },
  { 
    key: 'kotla-mubarakpur', 
    label: 'Kotla Market', 
    lat: 28.5710, 
    lng: 77.2240, 
    color: '#ec4899', 
    binLevel: 94, 
    icon: '🏬' 
  },
]

const levelColor = (lvl) => lvl > 80 ? '#ef4444' : lvl > 60 ? '#f59e0b' : '#4CAF50'

// Create custom marker component for each area
const AreaMarker = ({ area, onClick }) => {
  const customIcon = L.divIcon({
    className: 'custom-area-marker',
    html: `
      <div class="relative group flex flex-col items-center">
        <div class="absolute rounded-full animate-ping" 
             style="width: 50px; height: 50px; background: ${area.color}; opacity: 0.2; top: -10px; left: -10px;"></div>
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 bg-white border-2 shadow-lg group-hover:scale-110" 
             style="border-color: ${area.color}; color: ${area.color}">
          ${area.icon}
        </div>
        <div class="mt-2 px-3 py-1 rounded-xl bg-white/95 backdrop-blur shadow-md border border-gray-100 font-dm font-black text-[9px] text-gray-800 tracking-wider uppercase whitespace-nowrap">
          ${area.label}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  return (
    <Marker 
      position={[area.lat, area.lng]} 
      icon={customIcon} 
      eventHandlers={{ click: () => onClick(area.key) }}
    >
      <Popup closeButton={false} className="custom-popup">
        <div className="font-dm p-1 text-center">
          <p className="font-black text-gray-900 leading-tight uppercase tracking-tighter">${area.label}</p>
          <div className="mt-2 px-2 py-0.5 rounded-full text-[10px] text-white font-bold" style={{ background: area.color }}>
            Bin Level: ${area.binLevel}%
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

export default function MunicipalHome() {
  const navigate  = useNavigate()
  const [zoomedArea, setZoomedArea] = useState(null)

  const handleAreaClick = (areaKey) => {
    if (zoomedArea) return
    setZoomedArea(areaKey)
    setTimeout(() => {
      navigate(`/municipal/area/${areaKey}`)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] relative overflow-x-hidden pt-24 pb-12">
      <MunicipalNavbar />

      <div className={`max-w-[1440px] mx-auto px-8 transition-all duration-700 ${zoomedArea ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between flex-wrap gap-8">
          <div className="flex-1">
            <h1 className="font-baloo font-bold text-4xl text-gray-900 tracking-tight">🗺️ Area Monitoring</h1>
            <p className="text-gray-500 font-dm mt-2 text-lg">Live interactive map of high-priority municipal sectors</p>
          </div>

          <div className="flex gap-4">
            {[
              ['Active Zones', '9', '#4CAF50'],
              ['High Alerts', '3', '#ef4444'],
              ['Feed Active', 'LIVE', '#3b82f6'],
            ].map(([label, val, color]) => (
              <div key={label} className="bg-white rounded-[1.5rem] px-8 py-5 border border-gray-100 text-center shadow-sm" style={{ minWidth: '160px' }}>
                <p className="font-baloo font-black text-3xl tracking-tight leading-none" style={{ color }}>{val}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px] mt-2">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real Interactive Map */}
        <div 
          className="relative w-full rounded-[3rem] overflow-hidden border border-gray-200 shadow-xl"
          style={{ height: '650px' }}
        >
          <MapContainer 
            center={[28.568, 77.232]} 
            zoom={14} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            
            {AREAS.map(area => (
              <AreaMarker key={area.key} area={area} onClick={handleAreaClick} />
            ))}

            {/* Float Overlay (Static UI preservation) */}
            <div className="absolute top-8 left-8 z-[1000] bg-white/90 backdrop-blur-xl rounded-[1.5rem] px-6 py-4 shadow-2xl border border-white/20 pointer-events-none">
              <p className="font-baloo font-bold text-gray-900 text-lg leading-none">Global Sector Monitoring</p>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[3px] mt-2">Interactive Live Map</p>
            </div>
            
            <div className="absolute top-8 right-8 z-[1000] flex items-center gap-3 bg-[#0d2137]/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 pointer-events-none">
                <div className="relative">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping absolute inset-0" />
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full relative" />
                </div>
                <span className="text-white text-[11px] font-black tracking-[4px] leading-none uppercase">Live Feed</span>
            </div>
          </MapContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 transition-all duration-[800ms]">
          {AREAS.map(area => (
            <Card key={area.key} className="group hover:-translate-y-2 transition-all duration-300">
               <div className="flex items-center gap-5 p-2 cursor-pointer" onClick={() => handleAreaClick(area.key)}>
                  <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-3xl transition-transform group-hover:scale-110" 
                       style={{ background: area.color + '15' }}>
                    {area.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-dm font-black text-gray-900 text-lg tracking-tight mb-1">{area.label}</p>
                    <div className="flex justify-between items-center bg-gray-50/80 rounded-full px-3 py-1">
                      <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Bins Fill</span>
                      <span className="font-dm font-black text-xs" style={{ color: levelColor(area.binLevel) }}>{area.binLevel}%</span>
                    </div>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
