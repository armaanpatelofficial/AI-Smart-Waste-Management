import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { authAPI, vahanAPI } from '../services/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const { role } = useParams()                    // 'public' or 'municipal'

  const isPublic = role === 'public'
  const isVahan = role === 'vahan'
  const roleName = isVahan ? 'Vahan Chalak' : isPublic ? 'Public User' : 'Municipal Corporation'
  const roleIcon = isVahan ? '🚛' : isPublic ? '👤' : '🏛️'
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

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtpStep, setShowOtpStep] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [address, setAddress] = useState('')

  // Vahan-specific fields
  const [phone, setPhone] = useState('')
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [assignedArea, setAssignedArea] = useState('')

  const handleVahanRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSuccess('Vahan Chalak registered successfully! Redirecting...')
      setTimeout(() => navigate(`/login/vahan`), 1500)
      setLoading(false)
    }, 1000)
  }

  // Step 1: Request OTP (Mock)
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSuccess('Mock OTP sent (Demo Mode)!')
      setShowOtpStep(true)
      setLoading(false)
    }, 1000)
  }

  // Step 2: Verify OTP and Register (Mock)
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate(`/login/${role}`), 1500)
      setLoading(false)
    }, 1000)
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
          onClick={() => showOtpStep ? setShowOtpStep(false) : navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 font-dm text-sm group"
        >
          <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
          {showOtpStep ? 'Back to Signup' : 'Back to Role Selection'}
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
            {showOtpStep ? 'Verify OTP' : 'Create Account'}
          </h1>
          <p className="text-gray-400 text-sm font-dm text-center mb-8">
            {showOtpStep 
              ? `We've sent a code to ${email}`
              : 'Join the smart waste management initiative'}
          </p>

          {/* ── Messages ──────────────────────────── */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-dm text-red-200 bg-red-500 bg-opacity-20 border border-red-400 border-opacity-30 fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm font-dm text-green-200 bg-green-500 bg-opacity-20 border border-green-400 border-opacity-30 fade-in">
              {success}
            </div>
          )}

          {!showOtpStep ? (
            /* ── Signup Form ────────────────────────── */
            <form onSubmit={isVahan ? handleVahanRegister : handleRequestOtp} className="flex flex-col gap-4">
              
              <div className="flex gap-4">
                {/* First Name */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
                {/* Last Name */}
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Password</label>
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Confirm Password</label>
                <input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>

              {/* Public: Address */}
              {isPublic && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">House Address</label>
                  <input
                    type="text"
                    placeholder="Sector 12, Buildling 4..."
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                  />
                </div>
              )}

              {/* Vahan Special Fields */}
              {isVahan && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Phone Number</label>
                    <input
                      type="text"
                      placeholder="9876543210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Vehicle Number</label>
                    <input
                      type="text"
                      placeholder="DL 1C AB 1234"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase">Assigned Area</label>
                    <input
                      type="text"
                      placeholder="Zone 5 - Rohini"
                      value={assignedArea}
                      onChange={e => setAssignedArea(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl font-dm text-sm text-white placeholder-gray-500 outline-none transition-all duration-300 login-input"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-dm font-bold text-white text-base
                           flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden mt-4"
                style={{ background: accentGrad, boxShadow: accentShadow, opacity: loading ? 0.85 : 1 }}
              >
                {loading ? <div className="spinner" /> : 'Sign Up'}
              </button>
            </form>
          ) : (
            /* ── OTP Verification Form ──────────────── */
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-gray-300 text-xs font-dm font-medium tracking-wider uppercase text-center">Enter 6-Digit Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-4 rounded-xl font-dm text-2xl tracking-[1em] text-center text-white placeholder-gray-600 outline-none transition-all duration-300 login-input"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-dm font-bold text-white text-base
                           flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden"
                style={{ background: accentGrad, boxShadow: accentShadow, opacity: loading ? 0.85 : 1 }}
              >
                {loading ? <div className="spinner" /> : 'Verify & Register'}
              </button>

              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-gray-400 text-xs font-dm hover:text-white transition-colors"
              >
                Didn't receive code? Resend
              </button>
            </form>
          )}

          {/* ── Divider ───────────────────────────── */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-gray-600 text-[10px] font-dm font-bold uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-sm font-dm text-gray-400">
            Already have an account?{' '}
            <Link to={`/login/${role}`} className="font-bold transition-all hover:underline underline-offset-4" style={{ color: accentColor }}>
              Sign In
            </Link>
          </p>

          <p className="text-gray-600 text-xs font-dm mt-6 text-center">
            Swachh Bharat Mission 2.0 • Smart City Initiative
          </p>
        </div>
      </div>
    </div>
  )
}
