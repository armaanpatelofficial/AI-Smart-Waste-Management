import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authAPI, vahanAPI } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { role } = useParams()                    // 'public', 'municipal', or 'vahan'

  const isPublic = role === 'public'
  const isVahan = role === 'vahan'
  const roleName = isVahan ? 'Vahan Chalak' : isPublic ? 'Public User' : 'Municipal Corporation'
  const roleIcon = isVahan
    ? <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl">🚛</div>
    : isPublic 
    ? <img src="/public/images/public_user_v2_1774238167548.png" alt="Public" className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl"/>
    : <img src="/public/images/municipal_corp_v2_1774238185511.png" alt="Municipal" className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center text-2xl" />;
  
  const accentGrad = isVahan
    ? 'linear-gradient(135deg,#7C3AED,#5B21B6)'
    : isPublic
      ? 'linear-gradient(135deg,#4CAF50,#388E3C)'
      : 'linear-gradient(135deg,#FF6B35,#e85520)'
  const accentColor = isVahan ? '#7C3AED' : isPublic ? '#4CAF50' : '#FF6B35'
  const accentShadow = isVahan
    ? '0 4px 25px rgba(124,58,237,0.45)'
    : isPublic
      ? '0 4px 25px rgba(76,175,80,0.45)'
      : '0 4px 25px rgba(255,107,53,0.45)'
  const accentGlow = isVahan
    ? '0 0 40px rgba(124,58,237,0.3)'
    : isPublic
      ? '0 0 40px rgba(76,175,80,0.3)'
      : '0 0 40px rgba(255,107,53,0.3)'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Mock Login - Bypass API
    setTimeout(() => {
        const mockUser = {
            _id: 'mock-id-' + role,
            name: (role.charAt(0).toUpperCase() + role.slice(1)) + ' Admin',
            email: email || (role + '@example.com'),
            role: role,
            swachhPoints: 1250,
            level: 4
        }
        const mockToken = 'mock-token-' + role
        
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(mockUser))
        
        const targets = { public: '/public', municipal: '/municipal', vahan: '/vahan' }
        navigate(targets[role] || '/public')
        setLoading(false)
    }, 800)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#1a3c5e 0%,#0d2137 50%,#1a4a2e 100%)' }}
    >
      {/* ── Animated background circles ────────────── */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10 pulse-ring"
          style={{
            width:  (40 + i * 28) + 'px',
            height: (40 + i * 28) + 'px',
            background: i % 2 === 0 ? '#4CAF50' : '#FF6B35',
            left:  (i * 12 + 2) + '%',
            top:   (i * 10 + 4) + '%',
            animationDelay:    (i * 0.35) + 's',
            animationDuration: (2.5 + i * 0.5) + 's',
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-md px-4 login-slide-up">

        {/* ── Back button ─────────────────────────── */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-dm text-sm group"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
          Back to Role Selection
        </button>

        {/* ── Card ────────────────────────────────── */}
        <div
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-8 border border-white border-opacity-20"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.35)' }}
        >
          {/* Role badge */}
          <div className="flex items-center justify-center mb-6">
            <div
              className="flex items-center gap-3 px-5 py-2.5 rounded-full"
              style={{ background: accentGrad, boxShadow: accentGlow }}
            >
              <span className="text-2xl">{roleIcon}</span>
              <span className="text-white font-dm font-semibold text-sm tracking-wide">
                {roleName}
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-white text-2xl font-baloo font-bold text-center mb-1">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm font-dm text-center mb-8">
            Sign in to continue to your dashboard
          </p>

          {/* ── Error banner ──────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-dm text-red-200 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 fade-in">
              {error}
            </div>
          )}

          {/* ── Form ──────────────────────────────── */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">✉</span>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => {
                    e.target.style.border = `1px solid ${accentColor}`
                    e.target.style.boxShadow = `0 0 0 3px ${accentColor}33`
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔒</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  onFocus={e => {
                    e.target.style.border = `1px solid ${accentColor}`
                    e.target.style.boxShadow = `0 0 0 3px ${accentColor}33`
                  }}
                  onBlur={e => {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-sm"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white/20 bg-white/5 accent-green-600 transition-all cursor-pointer" 
                />
                <span className="text-xs font-dm text-gray-400 group-hover:text-gray-300 transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                to={`/forgot-password/${role}`}
                className="text-xs font-dm transition-colors"
                style={{ color: accentColor }}
                onMouseEnter={e => (e.target.style.opacity = '0.8')}
                onMouseLeave={e => (e.target.style.opacity = '1')}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-dm font-bold text-white text-base
                         flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden mt-2"
              style={{
                background: accentGrad,
                boxShadow: accentShadow,
                opacity: loading ? 0.85 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* ── Divider ───────────────────────────── */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-gray-600 text-[10px] font-dm font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* ── Sign Up link ──────────────────────── */}
          <p className="text-center text-sm font-dm text-gray-400">
            New to Bharat22?{' '}
            <Link
              to={`/signup/${role}`}
              className="font-bold transition-all hover:underline underline-offset-4"
              style={{ color: accentColor }}
            >
              Create Account
            </Link>
          </p>

          {/* ── Footer ────────────────────────────── */}
          <p className="text-gray-600 text-xs font-dm mt-6 text-center">
            Swachh Bharat Mission 2.0 • Smart City Initiative
          </p>
        </div>
      </div>
    </div>
  )
}
