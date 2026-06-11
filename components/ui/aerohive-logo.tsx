"use client"

import React from "react"

interface AerohiveLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number
}

export function AerohiveLogo({ size = 120, className = "", ...props }: AerohiveLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`relative select-none ${className}`}
      {...props}
    >
      {/* Clean Letter 'A' Shape matching logo-icon.jpeg */}
      <path
        d="M120 30 L185 190 H150 L138 155 H102 L90 190 H55 L120 30 Z M120 70 L133 115 H107 L120 70 Z"
        fill="currentColor"
        fillRule="evenodd"
        className="text-[#2563eb] dark:text-[#f97316] transition-colors duration-300"
      />
    </svg>
  )
}
