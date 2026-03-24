import React, { useState } from 'react';

export default function Button({
  variant = 'teal',
  onClick,
  disabled,
  children,
  style,
  type = 'button',
  fullWidth = true,
}) {
  const [hov, setHov] = useState(false);

  const base = {
    width: fullWidth ? '100%' : 'auto',
    height: 50,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all .2s',
    fontFamily: 'inherit',
    opacity: disabled ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  const variants = {
    teal: {
      background: hov ? '#0f766e' : '#0d9488',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(13,148,136,.25)',
      transform: hov && !disabled ? 'translateY(-1px)' : 'none',
    },
    ghost: {
      background: hov ? '#fafaf8' : '#fff',
      color: '#6b7280',
      border: '1.5px solid #e5e5ec',
    },
    dark: {
      background: hov ? '#0d9488' : '#0a0a12',
      color: '#fff',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}
