import React from "react"

export function DronesIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Central camera body */}
      <circle cx="12" cy="12" r="2.5" className="fill-primary/10" />
      {/* Rotor arms extending outwards */}
      <path d="M9.5 9.5L5 5M14.5 9.5L19 5M9.5 14.5L5 19M14.5 14.5L19 19" />
      {/* Rotor guards / motors */}
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
      {/* Camera lens highlight */}
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function CategoriesIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Stylized honeycomb grid categories */}
      <path d="M12 3l4 2.3v4.7l-4 2.3-4-2.3V5.3L12 3z" />
      <path d="M19 15l3-1.7V9.8l-3-1.7" />
      <path d="M5 15l-3-1.7V9.8l3-1.7" />
      <path d="M12 12.3v4.7l-4 2.3-4-2.3V15" />
      <path d="M12 17l4 2.3v2.7l-4 2-4-2v-2.7" />
    </svg>
  )
}

export function DronePilotsIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Aviator Helmet outline */}
      <path d="M12 4a7 7 0 0 0-7 7v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a7 7 0 0 0-7-7z" />
      {/* Flight Goggles */}
      <rect x="7" y="9" width="4" height="2.5" rx="0.5" />
      <rect x="13" y="9" width="4" height="2.5" rx="0.5" />
      <path d="M11 10.25h2" />
      {/* Pilot wings left/right */}
      <path d="M4 11H1M20 11h3" />
      <path d="M3.5 12.5H1M20.5 12.5h3" />
    </svg>
  )
}

export function ServicesIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Mechanical gears / telemetry */}
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" className="fill-primary/10" />
      <path d="M12 9V5" strokeWidth="1.5" />
    </svg>
  )
}

export function AboutIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Hangar dome with blueprint line details */}
      <path d="M3 20h18" />
      <path d="M19 20a7 7 0 0 0-14 0" />
      <circle cx="12" cy="14" r="2.5" className="fill-primary/10" />
      <path d="M12 7V3M9 4.5l6 0" />
    </svg>
  )
}

export function ContactIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Drone Remote Control transmitter */}
      <rect x="4" y="8" width="16" height="12" rx="3" />
      <circle cx="8" cy="14" r="2" />
      <circle cx="16" cy="14" r="2" />
      {/* Transmission Antennas */}
      <path d="M9 8V4M15 8V4" />
      <circle cx="9" cy="3" r="0.5" fill="currentColor" />
      <circle cx="15" cy="3" r="0.5" fill="currentColor" />
      {/* LED indicators */}
      <circle cx="12" cy="10" r="0.8" fill="currentColor" />
    </svg>
  )
}

export function AdminPanelIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* HUD Telemetry console board */}
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M21 12H3" />
      <path d="M12 3v18" />
      <circle cx="7.5" cy="7.5" r="2.5" className="fill-primary/10" />
      <path d="M16.5 5.5l2 4" />
      <circle cx="7.5" cy="16.5" r="2" />
      <path d="M14 16.5h4" />
    </svg>
  )
}

export function MyOrdersIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cargo box / delivery package */}
      <rect x="8" y="13" width="8" height="7" rx="1" className="fill-primary/10" />
      {/* Winch straps to delivery drone */}
      <path d="M10 13l-1-4M14 13l1-4" />
      {/* Drone body */}
      <path d="M6 9h12" />
      <circle cx="6" cy="9" r="1" />
      <circle cx="18" cy="9" r="1" />
      {/* Quad blades */}
      <path d="M4 7.5h4M16 7.5h4" />
    </svg>
  )
}
