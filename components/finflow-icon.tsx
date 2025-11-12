export function FinFlowIcon({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="url(#gradient)" />

      {/* Flow waves */}
      <path
        d="M 40 80 Q 60 70, 80 80 T 120 80 T 160 80"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.4"
      />

      <path
        d="M 40 100 Q 60 90, 80 100 T 120 100 T 160 100"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      <path
        d="M 40 120 Q 60 110, 80 120 T 120 120 T 160 120"
        stroke="white"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Trending up arrow */}
      <g transform="translate(130, 60)">
        <path
          d="M 0 30 L 30 0"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 30 0 L 30 15 M 30 0 L 15 0"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Currency symbol (Ft) */}
      <text
        x="50"
        y="70"
        fill="white"
        fontSize="32"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Ft
      </text>
    </svg>
  )
}
