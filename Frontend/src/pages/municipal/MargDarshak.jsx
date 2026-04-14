import { useState, useEffect } from 'react'
import MunicipalNavbar from '../../components/MunicipalNavbar.jsx'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Custom marker icons
const truckIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995504.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Component to dynamically fit route bounds
function ChangeView({ bounds }) {
  const map = useMap();
  if (bounds && bounds.length > 0) map.fitBounds(bounds);
  return null;
}

const KPI = [
  ['🚛', 'Active Vehicles', '1',     '#4CAF50'],
  ['⛽', 'Fuel Saved Today', '6.8 L', '#3b82f6'],
  ['📍', 'Total Stops',      'Dynamic',    '#f59e0b'],
  ['⚖️', 'Total Collected',  '0.0 T','#8b5cf6'],
]

export default function MargDarshak() {
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoute = async () => {
    try {
      const response = await fetch('/api/routes/live')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Server error')
      }
      const data = await response.json()
      setRouteData(data)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Server is not running')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoute()
    const interval = setInterval(fetchRoute, 30000) // update every 30 seconds to avoid API Rate Limits
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-x-hidden pt-24 pb-12">
      <MunicipalNavbar />

      <div className="max-w-[1440px] mx-auto px-8">

        {/* Header */}
        <div className="mb-6 fade-in flex items-center justify-between">
          <div>
            <h1 className="font-baloo font-bold text-3xl text-gray-800">🛣️ Marg Darshak (AI Live)</h1>
            <p className="text-gray-500 font-dm mt-1">
              AI-optimised routing — Connected to real-time waste optimization model
            </p>
          </div>
          <button 
            onClick={fetchRoute}
            className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-all font-dm text-sm flex items-center gap-2"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            Refresh API
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {KPI.map(([icon, label, val, color]) => (
            <div
              key={label}
              className="bg-white rounded-2xl p-4 border border-gray-100 text-center slide-up"
              style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <p className="text-2xl mb-1">{icon}</p>
              <p className="font-baloo font-bold text-xl" style={{ color }}>
                {label === 'Total Stops' ? (routeData?.route?.length || '...') : val}
              </p>
              <p className="text-xs text-gray-500 font-dm">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left panel: Info & Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-baloo font-bold text-lg text-gray-800 mb-3">📡 System Status</h3>
                {error ? (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-xs font-dm leading-tight">
                        <strong>⚠️ {error}</strong><br/>
        Ensure the Python FastAPI route server is running at port 8001 (uvicorn app.main:app --port 8001).
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 text-xs font-dm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        AI Model Live & Running
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-y-auto max-h-[400px]">
                <h3 className="font-baloo font-bold text-lg text-gray-800 mb-3">📍 Mission Stops</h3>
                <div className="space-y-3">
                    {(routeData?.stops || routeData?.route)?.map((stop, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border border-gray-200">
                                {i + 1}
                            </div>
                            <div className="text-xs font-dm text-gray-600">
                                {i === 0 ? "Depot / Start" : `Stop Location (${stop[0].toFixed(3)}, ${stop[1].toFixed(3)})`}
                            </div>
                        </div>
                    ))}
                    {!routeData && <p className="text-xs text-gray-400 font-dm italic">Waiting for AI route data...</p>}
                </div>
            </div>
          </div>

          {/* Main Map: Route View */}
          <div
            className="lg:col-span-3 bg-white rounded-[2rem] border border-gray-100 overflow-hidden relative"
            style={{ 
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                minHeight: '600px'
            }}
          >
            {loading && !routeData && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
                    <p className="font-dm font-bold text-gray-600">Connecting to AI Engine...</p>
                </div>
            )}

            <MapContainer 
              center={[28.6139, 77.2090]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {routeData && (
                <>
                  <ChangeView bounds={routeData.route} />
                  
                  {/* Route Polyline - Enhanced with Pulsing Animation */}
                  <Polyline 
                    positions={routeData.route} 
                    pathOptions={{
                      color: "#00e676", // Vibrant Neon Green
                      weight: 8,
                      opacity: 0.9,
                      lineJoin: 'round',
                      dashArray: "1, 15",
                      className: "route-pulse-animation"
                    }}
                  />
                  
                  {/* Subtle Background Glow for the Route */}
                  <Polyline 
                    positions={routeData.route} 
                    pathOptions={{
                      color: "#00e676",
                      weight: 15,
                      opacity: 0.15,
                      lineJoin: 'round'
                    }}
                  />

                  {/* Truck Marker */}
                  <Marker position={[routeData.truck.lat, routeData.truck.lng]} icon={truckIcon}>
                    <Popup>
                        <div className="font-dm p-2">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xl">🚛</span>
                                <p className="font-bold text-gray-800 text-sm">Vahan #4421</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-500 flex justify-between uppercase tracking-wider"><span>Status:</span> <span className="text-green-600 font-bold">En Route</span></p>
                                <p className="text-[10px] text-gray-500 flex justify-between uppercase tracking-wider"><span>Driver:</span> <span className="text-gray-800">Ramesh Singh</span></p>
                            </div>
                        </div>
                    </Popup>
                  </Marker>

                  {/* Bin Markers with Pulsating Logic */}
                  {routeData.bins.map((bin) => (
                    <Marker 
                      key={bin.id} 
                      position={[bin.lat, bin.lng]}
                      icon={L.divIcon({
                        className: 'custom-div-icon',
                        html: `
                          <div class="bin-marker-container">
                            ${bin.fill > 80 ? '<div class="marker-pulse red"></div>' : bin.fill > 50 ? '<div class="marker-pulse orange"></div>' : ''}
                            <div class="bin-core" style="background-color: ${bin.fill > 80 ? '#ef4444' : bin.fill > 50 ? '#f59e0b' : '#22c55e'};"></div>
                          </div>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    >
                        <Popup>
                            <div className="font-dm min-w-[120px]">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-bold text-gray-800">🗑️ Bin #${bin.id}</p>
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-400">IoT Active</span>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] mb-1 uppercase font-bold text-gray-400">
                                            <span>Fill Level</span>
                                            <span>${bin.fill}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div class="h-full transition-all duration-1000" style="width: ${bin.fill}%; background-color: ${bin.fill > 80 ? '#ef4444' : bin.fill > 50 ? '#f59e0b' : '#22c55e'};"></div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 italic">Expected Pickup: ${Math.floor(Math.random() * 15) + 5} mins</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                  ))}
                </>
              )}
            </MapContainer>

            {/* Float Overlay: AI Insight (Glassmorphism) */}
            <div 
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 bg-white/70 backdrop-blur-xl rounded-[2rem] p-6 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center gap-6 slide-up w-[90%] md:w-auto"
              style={{ maxWidth: '650px' }}
            >
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-green-200">🤖</div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-baloo font-bold text-gray-800 text-lg">MargDarshak AI Intelligence</h4>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Optimized</span>
                   </div>
                   <p className="text-sm text-gray-500 font-dm leading-relaxed">
                     Dynamic route generated using <strong>Google OR-Tools</strong>. Current path efficiency is 
                     <span className="text-green-600 font-bold"> 94% higher</span> than static routes.
                   </p>
                </div>
            </div>

            {/* Custom Animations CSS */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes routePulse {
                    from { stroke-dashoffset: 200; }
                    to { stroke-dashoffset: 0; }
                }
                .route-pulse-animation {
                    animation: routePulse 8s linear infinite;
                    filter: drop-shadow(0 0 8px rgba(0, 230, 118, 0.6));
                }
                .bin-marker-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bin-core {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                    z-index: 2;
                }
                .marker-pulse {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    animation: markerPulseAnimate 1.5s ease-out infinite;
                    z-index: 1;
                }
                .marker-pulse.red { background: rgba(239, 68, 68, 0.5); }
                .marker-pulse.orange { background: rgba(245, 158, 11, 0.5); }
                
                @keyframes markerPulseAnimate {
                    0% { transform: scale(0.5); opacity: 1; }
                    100% { transform: scale(2.5); opacity: 0; }
                }
                .leaflet-container {
                    background: #f1f5f9 !important;
                }
                .leaflet-bar {
                    border: none !important;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
                }
                .leaflet-bar a {
                    background-color: white !important;
                    color: #64748b !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                }
            `}} />
          </div>
        </div>
      </div>
    </div>
  )
}
