import React from 'react';

export default function Select({ ai = false, children, style, ...props }) {
  return (
    <select
      style={{
        width: '100%',
        height: 46,
        background: ai ? '#fdfbf0' : '#fafaf8',
        border: `1.5px solid ${ai ? '#e8d88a' : '#e5e5ec'}`,
        borderRadius: 10,
        padding: '0 36px 0 14px',
        fontSize: 14,
        color: ai ? '#b8960c' : '#0a0a12',
        outline: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  );
}
