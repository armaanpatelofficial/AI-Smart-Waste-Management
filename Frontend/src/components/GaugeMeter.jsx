import React from 'react';

/**
 * A highly-attractive, premium Modern Luxury Gauge Meter
 * Featuring gradients, glass-morphism, precision ticks, and a rotating needle.
 */
export default function GaugeMeter({ value = 0, max = 100, label = "Points", accentColor = "#4CAF50" }) {
  const percentage = Math.min((value / max) * 100, 100);
  const size = 200;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = radius * 2 * Math.PI;
  
  // 270 degree arc (0.75 of a circle)
  const arcPercentage = 0.75;
  const arcLength = circumference * arcPercentage;
  const strokeDashoffset = arcLength - (percentage / 100) * arcLength;
  
  // Rotate from -135 to +135 for 270 degrees
  const needleRotation = (percentage / 100) * 270 - 135;

  return (
    <div className="flex flex-col items-center justify-center relative select-none group" 
         style={{ width: size, height: size }}>
      
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#81c784" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer ambient ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + 8}
          fill="transparent"
          stroke="rgba(0,0,0,0.02)"
          strokeWidth="1"
        />

        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size/2} ${size/2})`}
        />

        {/* Precision Ticks */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - 12}
          fill="transparent"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="2"
          strokeDasharray="2 12.5"
          transform={`rotate(135 ${size/2} ${size/2})`}
          className="opacity-40 group-hover:opacity-100 transition-opacity duration-700"
        />

        {/* Progress Fill (with glow) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ 
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 6px ${accentColor}33)`
          }}
          transform={`rotate(135 ${size/2} ${size/2})`}
        />

        {/* Needle / Pointer (Hidden circle for rotation ref) */}
        <g transform={`rotate(${needleRotation + 90} ${size / 2} ${size / 2})`} 
           style={{ transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line 
                x1={size / 2} 
                y1={size / 2 - radius - 5} 
                x2={size / 2} 
                y2={size / 2 - radius + 15} 
                stroke={accentColor} 
                strokeWidth="4" 
                strokeLinecap="round"
            />
        </g>
      </svg>
      
      {/* Central Glass-morphism Disc */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-32 h-32 rounded-full flex flex-col items-center justify-center
                      bg-white/40 backdrop-blur-md border border-white/60 shadow-inner">
        <div className="relative z-10 text-center animate-pulse-slow">
            <p className="text-4xl font-baloo font-black text-gray-800 tracking-tighter tabular-nums leading-none">
                {value.toLocaleString()}
            </p>
            <p className="text-[10px] font-dm font-black text-gray-400 uppercase tracking-[3px] mt-2 opacity-80">
                {label}
            </p>
        </div>
        {/* Subtle decorative inner ring */}
        <div className="absolute inset-2 rounded-full border border-gray-100/30 pointer-events-none" />
      </div>

      {/* Range Indicators */}
      <div className="absolute bottom-6 w-full flex justify-between px-10 text-[9px] font-dm font-black text-gray-400 uppercase tracking-[2px] leading-none">
        <span className="opacity-50">0</span>
        <span className="opacity-50">{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
