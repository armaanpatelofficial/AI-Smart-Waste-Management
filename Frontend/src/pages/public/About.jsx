import PublicNavbar from '../../components/PublicNavbar.jsx'

const FEATURES = [
  {
    icon: '🤖', title: 'AI Waste Detection',
    desc: 'Advanced computer vision classifies waste into Biodegradable, Recyclable, Hazardous, and Mixed categories with high accuracy. Helps citizens dispose correctly and earn Swachh Points.',
  },
  {
    icon: '🚛', title: 'Smart Kachra Vahan',
    desc: 'GPS-tracked collection vehicles with real-time monitoring. Smart routing ensures timely collection and reduces fuel consumption by up to 30% compared to manual routing.',
  },
  {
    icon: '🏆', title: 'Reward System',
    desc: 'Citizens earn Swachh Points for proper waste segregation and reporting. Points are redeemable against electricity bills, water bills, and LPG cylinder subsidies.',
  },
  {
    icon: '🧬', title: 'Waste DNA Intelligence',
    desc: 'Advanced analytics creates a waste fingerprint for each area, helping authorities understand behaviour patterns and optimise collection strategies in real time.',
  },
]

const STATS = [
  { icon: '🗺️', value: '4 Zones',  label: 'Active Coverage'    },
  { icon: '👥', value: '12,000+',  label: 'Citizens Enrolled'   },
  { icon: '♻️', value: '98 T',     label: 'Waste Collected'     },
]

const TIMELINE = [
  { year: '2023', event: 'Pilot launched in Lajpat Nagar with 500 households' },
  { year: '2024', event: 'Expanded to Defence Colony & South Extension' },
  { year: '2025', event: 'AI Waste Detection model deployed across all zones' },
  { year: '2026', event: 'Reward system live · 12,000+ citizens enrolled' },
]

export default function About() {
  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden pt-24 pb-12">
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-6">

        {/* Hero banner */}
        <div
          className="rounded-3xl overflow-hidden mb-10 fade-in"
          style={{ background: 'linear-gradient(135deg,#1a3c5e,#0d2137)', padding: '48px' }}
        >
          <div className="max-w-2xl">
            <span
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-dm font-semibold text-green-300 mb-4"
              style={{ background: 'rgba(76,175,80,0.2)', border: '1px solid rgba(76,175,80,0.3)' }}
            >
              🇮🇳 Government of India Initiative
            </span>
            <h1 className="font-baloo font-bold text-4xl text-white mb-2 leading-tight">
              AI Smart Kachra Vahan System
            </h1>
            <p className="font-hindi text-green-300 text-xl mb-4">एआई स्मार्ट कचरा वाहन प्रणाली</p>
            <p className="text-gray-300 font-dm leading-relaxed">
              A next-generation waste management platform under Swachh Bharat Mission 2.0,
              leveraging Artificial Intelligence, IoT sensors, and smart routing to create
              cleaner, smarter cities across India.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100 slide-up"
              style={{ animationDelay: `${i * 0.08}s`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
            >
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="font-baloo font-bold text-2xl text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500 font-dm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* About section */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-8 mb-6"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <h2 className="font-baloo font-bold text-2xl text-gray-800 mb-4">About the System</h2>
          <p className="text-gray-600 font-dm leading-relaxed mb-4">
            The AI Smart Kachra Vahan System is a comprehensive municipal waste management
            solution designed to bring intelligence, efficiency, and citizen participation
            to urban waste handling across Indian cities.
          </p>
          <p className="text-gray-600 font-dm leading-relaxed">
            By integrating AI-powered waste classification, real-time vehicle tracking, and a
            citizen incentive system, the platform bridges the gap between residents and
            municipal authorities — creating a cleaner urban ecosystem for all.
          </p>
        </div>

        {/* Features grid */}
        <div className="mb-10">
          <h2 className="font-baloo font-bold text-2xl text-gray-800 mb-5">⚡ Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
                style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
              >
                <div className="flex gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-dm font-bold text-gray-800 mb-2">{f.title}</h3>
                    <p className="text-gray-500 font-dm text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-8 mb-6"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <h2 className="font-baloo font-bold text-2xl text-gray-800 mb-6">📅 Project Timeline</h2>
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-green-100" />
            <div className="space-y-6">
              {TIMELINE.map((t, i) => (
                <div key={i} className="flex gap-6 items-start pl-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-dm font-bold text-white flex-shrink-0 relative z-10"
                    style={{ background: 'linear-gradient(135deg,#4CAF50,#388E3C)' }}
                  >
                    {t.year.slice(2)}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className="font-dm font-semibold text-green-600 text-sm mb-0.5">{t.year}</p>
                    <p className="font-dm text-gray-600 text-sm">{t.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div
          className="bg-white rounded-2xl p-6 border border-gray-100 text-center"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
        >
          <p className="text-gray-400 font-dm text-sm">
            🌿 Swachh Bharat Mission 2.0 &nbsp;•&nbsp; Smart Cities Mission &nbsp;•&nbsp;
            Ministry of Housing &amp; Urban Affairs, Government of India
          </p>
        </div>
      </div>
    </div>
  )
}
