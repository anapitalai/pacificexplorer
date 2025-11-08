export default function PNGPattern({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 400 400" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="tribal-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          {/* Traditional PNG tribal patterns */}
          <circle cx="50" cy="50" r="3" fill="#FCD116" opacity="0.3" />
          <circle cx="25" cy="25" r="2" fill="#CE1126" opacity="0.3" />
          <circle cx="75" cy="75" r="2" fill="#CE1126" opacity="0.3" />
          <path d="M 50 40 L 60 50 L 50 60 L 40 50 Z" fill="#FCD116" opacity="0.2" />
        </pattern>
      </defs>
      <rect width="400" height="400" fill="url(#tribal-pattern)" />
    </svg>
  )
}
