import React from 'react';

export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill="#0d9488" />
      <rect x="9" y="9" width="18" height="3" rx="1.5" fill="white" />
      <rect x="16.5" y="12" width="3" height="9" rx="1.5" fill="white" />
      <path
        d="M11 25 Q14.5 21.5 18 25 Q21.5 28.5 25 25"
        stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
      <circle cx="18" cy="25.5" r="1.8" fill="white" />
    </svg>
  );
}
