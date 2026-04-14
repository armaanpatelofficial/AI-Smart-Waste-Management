import { useNavigate } from 'react-router-dom'

export default function RoleSelection() {
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#1a3c5e 0%,#0d2137 50%,#1a4a2e 100%)' }}
    >
      {/* Decorative pulse circles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 pulse-ring"
          style={{
            width:  (30 + i * 22) + 'px',
            height: (30 + i * 22) + 'px',
            background: i % 2 === 0 ? '#4CAF50' : '#FF6B35',
            left:  (i * 10 + 3) + '%',
            top:   (i *  8 + 5) + '%',
            animationDelay:    (i * 0.3) + 's',
            animationDuration: (2 + i * 0.4) + 's',
          }}
        />
      ))}

      <div className="relative z-10 text-center px-4 fade-in">
        {/* Logo */}
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4"
            style={{
              background: 'linear-gradient(135deg,#4CAF50,#81C784)',
              boxShadow: '0 0 40px rgba(76,175,80,0.4)',
            }}
          >
            <span className="text-5xl">♻️</span>
          </div>

          <h1
            className="text-white text-4xl font-bold font-baloo mb-1"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
          >
            AI Smart Kachra Vahan
          </h1>
          <p className="font-hindi text-green-300 text-xl">एआई स्मार्ट कचरा वाहन प्रणाली</p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <div className="h-px w-14 bg-green-400 opacity-40" />
            <span className="text-green-400 text-sm font-dm">Government of India Initiative</span>
            <div className="h-px w-14 bg-green-400 opacity-40" />
          </div>
        </div>

        {/* Card */}
        <div
          className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 max-w-md mx-auto border border-white border-opacity-20"
          style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}
        >
          <h2 className="text-white text-xl font-dm font-semibold mb-1">Select Your Role</h2>
          <p className="text-gray-300 text-sm mb-6 font-dm">Choose how you want to access the system</p>

          <div className="flex flex-col gap-4">
            {/* Public */}
            <button
              onClick={() => navigate('/login/public')}
              className="w-full py-4 px-6 rounded-2xl font-dm font-semibold text-white
                         flex items-center gap-4 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg,#4CAF50,#388E3C)',
                boxShadow: '0 4px 20px rgba(76,175,80,0.4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <img src="/public/images/public_user_v2_1774238167548.png" alt="Public" className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl"/>
              
              <div className="text-left">
                <p className="text-lg leading-tight">Public User</p>
                <p className="text-green-200 text-sm font-normal">Citizens &amp; Residents</p>
              </div>
              <span className="ml-auto text-xl">→</span>
            </button>

            {/* Municipal */}
            <button
              onClick={() => navigate('/login/municipal')}
              className="w-full py-4 px-6 rounded-2xl font-dm font-semibold text-white
                         flex items-center gap-4 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg,#FF6B35,#e85520)',
                boxShadow: '0 4px 20px rgba(255,107,53,0.4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <img src="/public/images/municipal_corp_v2_1774238185511.png" alt="Municipal" className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl" />
              <div className="text-left">
                <p className="text-lg leading-tight">Municipal Corporation</p>
                <p className="text-orange-200 text-sm font-normal">Officials &amp; Administrators</p>
              </div>
              <span className="ml-auto text-xl">→</span>
            </button>

            {/* Vahan Chalak */}
            <button
              onClick={() => navigate('/login/vahan')}
              className="w-full py-4 px-6 rounded-2xl font-dm font-semibold text-white
                         flex items-center gap-4 transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg,#7C3AED,#5B21B6)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">🚛</div>
              <div className="text-left">
                <p className="text-lg leading-tight">Vahan Chalak</p>
                <p className="text-purple-200 text-sm font-normal">Waste Collection Drivers</p>
              </div>
              <span className="ml-auto text-xl">→</span>
            </button>
          </div>

          <p className="text-gray-500 text-xs font-dm mt-6">
            Swachh Bharat Mission 2.0 • Smart City Initiative
          </p>
        </div>
      </div>
    </div>
  )
}
