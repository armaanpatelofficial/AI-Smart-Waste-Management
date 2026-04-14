// ─────────────────────────────────────────────
//  Reusable Card components
// ─────────────────────────────────────────────

/** Generic white card */
export function Card({ children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-card border border-gray-100 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-all duration-200' : ''
      } ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}

/** Reward redemption card */
export function RewardCard({ icon, title, description, amount, color, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-gray-100 cursor-pointer
                 transition-all duration-200 hover:-translate-y-1"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: color + '20' }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-dm font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm font-dm mt-1">{description}</p>
          {amount && (
            <span
              className="mt-2 inline-flex px-3 py-1 rounded-full text-sm font-dm font-semibold"
              style={{ background: color + '15', color }}
            >
              {amount}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Bin status card with fill bar */
export function BinStatusCard({ area, level, waste }) {
  const color = level >= 80 ? '#ef4444' : level >= 60 ? '#f59e0b' : '#4CAF50'
  const label = level >= 80 ? 'Critical'  : level >= 60 ? 'Medium'   : 'Good'

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-3"
      style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>🗑️</span>
          <span className="font-dm font-semibold text-gray-800 text-sm">{area}</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-dm font-semibold text-white"
            style={{ background: color }}
          >
            {label}
          </span>
          <span className="font-dm font-bold" style={{ color }}>{level}%</span>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
        <div
          className="h-2.5 rounded-full transition-all duration-1000"
          style={{ width: `${level}%`, background: `linear-gradient(90deg,${color}88,${color})` }}
        />
      </div>

      {waste && (
        <div className="flex gap-2 flex-wrap mt-1">
          {Object.entries(waste).map(([type, pct]) => (
            <span key={type} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 font-dm">
              {type}: {pct}%
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Chat message bubble */
export function ChatBubble({ message, isUser, time }) {
  return (
    <div className={`flex mb-3 fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm mr-2 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#4CAF50,#388E3C)' }}
        >🤖</div>
      )}

      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 ${isUser ? 'chat-bubble-right' : 'chat-bubble-left'}`}
        style={{
          background: isUser ? 'linear-gradient(135deg,#4CAF50,#388E3C)' : 'white',
          color: isUser ? 'white' : '#333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        <p>{message}</p>
        <p
          style={{
            fontSize: '11px',
            marginTop: '4px',
            color: isUser ? 'rgba(255,255,255,0.65)' : '#9ca3af',
          }}
        >
          {time}
        </p>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm ml-2 flex-shrink-0 bg-gray-200">
          👤
        </div>
      )}
    </div>
  )
}
