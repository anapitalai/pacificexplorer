'use client'

export default function BirdOfParadise({ className = "", animated = false }: { className?: string, animated?: boolean }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} ${animated ? 'animate-float' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients for realistic feather coloring */}
        <radialGradient id="bodyGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="50%" stopColor="#654321" />
          <stop offset="100%" stopColor="#3E2723" />
        </radialGradient>
        
        <linearGradient id="plumageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="40%" stopColor="#FFA500" />
          <stop offset="80%" stopColor="#FF8C00" />
          <stop offset="100%" stopColor="#FF6347" />
        </linearGradient>
        
        <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        
        <linearGradient id="greenSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
      </defs>
      
      {/* Raggiana Bird of Paradise */}
      <g className="bird-of-paradise">
        
        {/* Background plumes (behind body) - Orange/Red */}
        <g className="back-plumes" opacity="0.9">
          <path 
            d="M 85 110 Q 45 125, 25 160 Q 20 170, 22 178" 
            stroke="url(#plumageGradient)" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 85 110 Q 50 130, 35 165 Q 32 175, 35 182" 
            stroke="url(#plumageGradient)" 
            strokeWidth="7" 
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path 
            d="M 90 112 Q 60 135, 48 170 Q 47 178, 50 185" 
            stroke="url(#plumageGradient)" 
            strokeWidth="6" 
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path 
            d="M 115 110 Q 155 125, 175 160 Q 180 170, 178 178" 
            stroke="url(#plumageGradient)" 
            strokeWidth="8" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 115 110 Q 150 130, 165 165 Q 168 175, 165 182" 
            stroke="url(#plumageGradient)" 
            strokeWidth="7" 
            fill="none"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path 
            d="M 110 112 Q 140 135, 152 170 Q 153 178, 150 185" 
            stroke="url(#plumageGradient)" 
            strokeWidth="6" 
            fill="none"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
        
        {/* Tail feathers - Long wire-like feathers */}
        <g className="tail-wires" opacity="0.95">
          <path 
            d="M 95 125 Q 70 165, 60 195" 
            stroke="#2C1810" 
            strokeWidth="1.5" 
            fill="none"
          />
          <circle cx="60" cy="195" r="2.5" fill="#2C1810" />
          
          <path 
            d="M 105 125 Q 130 165, 140 195" 
            stroke="#2C1810" 
            strokeWidth="1.5" 
            fill="none"
          />
          <circle cx="140" cy="195" r="2.5" fill="#2C1810" />
        </g>
        
        {/* Left Wing - detailed */}
        <g className="left-wing">
          <ellipse 
            cx="75" 
            cy="100" 
            rx="28" 
            ry="40" 
            fill="#654321"
            transform="rotate(-35 75 100)"
          />
          <ellipse 
            cx="75" 
            cy="100" 
            rx="24" 
            ry="36" 
            fill="#4A3728"
            transform="rotate(-35 75 100)"
          />
          {/* Wing feather details */}
          <path 
            d="M 60 85 Q 55 95, 58 105" 
            stroke="#3E2723" 
            strokeWidth="2" 
            fill="none"
            opacity="0.6"
          />
          <path 
            d="M 65 80 Q 58 92, 62 108" 
            stroke="#3E2723" 
            strokeWidth="2" 
            fill="none"
            opacity="0.6"
          />
        </g>
        
        {/* Right Wing - detailed */}
        <g className="right-wing">
          <ellipse 
            cx="125" 
            cy="100" 
            rx="28" 
            ry="40" 
            fill="#654321"
            transform="rotate(35 125 100)"
          />
          <ellipse 
            cx="125" 
            cy="100" 
            rx="24" 
            ry="36" 
            fill="#4A3728"
            transform="rotate(35 125 100)"
          />
          {/* Wing feather details */}
          <path 
            d="M 140 85 Q 145 95, 142 105" 
            stroke="#3E2723" 
            strokeWidth="2" 
            fill="none"
            opacity="0.6"
          />
          <path 
            d="M 135 80 Q 142 92, 138 108" 
            stroke="#3E2723" 
            strokeWidth="2" 
            fill="none"
            opacity="0.6"
          />
        </g>
        
        {/* Body - Brown/Maroon */}
        <ellipse cx="100" cy="105" rx="22" ry="32" fill="url(#bodyGradient)" />
        <ellipse cx="100" cy="105" rx="18" ry="28" fill="#654321" opacity="0.7" />
        
        {/* Chest/Breast - Green iridescent shield */}
        <ellipse 
          cx="100" 
          cy="95" 
          rx="16" 
          ry="20" 
          fill="url(#greenSheen)"
          opacity="0.95"
        />
        <ellipse 
          cx="100" 
          cy="95" 
          rx="12" 
          ry="16" 
          fill="#10B981"
          opacity="0.8"
        />
        
        {/* Neck */}
        <ellipse 
          cx="100" 
          cy="78" 
          rx="10" 
          ry="12" 
          fill="url(#bodyGradient)"
        />
        
        {/* Head - Blue/Black with iridescent sheen */}
        <ellipse cx="100" cy="65" rx="12" ry="14" fill="url(#headGradient)" />
        <ellipse cx="100" cy="65" rx="10" ry="12" fill="#1E3A8A" opacity="0.9" />
        
        {/* Beak - Strong curved beak */}
        <path 
          d="M 108 65 Q 122 64, 125 66 Q 122 67, 108 67 Z" 
          fill="#4B5563" 
        />
        <path 
          d="M 108 65 Q 120 63, 123 65" 
          stroke="#6B7280" 
          strokeWidth="0.5" 
          fill="none"
        />
        
        {/* Eye - Alert and detailed */}
        <ellipse cx="104" cy="64" rx="2.5" ry="3" fill="#FEF3C7" />
        <circle cx="105" cy="64" r="1.5" fill="#1F2937" />
        <circle cx="105.5" cy="63.5" r="0.5" fill="white" opacity="0.9" />
        
        {/* Head plumes - Decorative crest */}
        <g className="head-crest" opacity="0.95">
          <path 
            d="M 92 58 Q 85 48, 88 38" 
            stroke="#1E3A8A" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 96 56 Q 91 45, 94 35" 
            stroke="#2563EB" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 100 55 Q 98 42, 100 32" 
            stroke="#1E40AF" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 104 56 Q 109 45, 106 35" 
            stroke="#2563EB" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
          <path 
            d="M 108 58 Q 115 48, 112 38" 
            stroke="#1E3A8A" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
        </g>
        
        {/* Legs and feet */}
        <g className="legs">
          <path 
            d="M 95 130 L 92 145" 
            stroke="#4B5563" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <path 
            d="M 105 130 L 108 145" 
            stroke="#4B5563" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          {/* Feet */}
          <path 
            d="M 92 145 L 88 148 M 92 145 L 92 149 M 92 145 L 96 148" 
            stroke="#4B5563" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
          <path 
            d="M 108 145 L 104 148 M 108 145 L 108 149 M 108 145 L 112 148" 
            stroke="#4B5563" 
            strokeWidth="1.5" 
            strokeLinecap="round"
          />
        </g>
        
        {/* Highlight details for dimension */}
        <ellipse 
          cx="98" 
          cy="62" 
          rx="4" 
          ry="5" 
          fill="white" 
          opacity="0.15"
        />
        <ellipse 
          cx="97" 
          cy="92" 
          rx="5" 
          ry="7" 
          fill="white" 
          opacity="0.1"
        />
        
      </g>
      
      <style jsx>{`
        .bird-of-paradise {
          filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.3));
        }
      `}</style>
    </svg>
  )
}
