import React, { useState } from 'react';

export default function Input({ ai = false, style, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%',
        height: 46,
        background: ai ? '#fdfbf0' : '#fafaf8',
        border: `1.5px solid ${
          focused
            ? ai ? '#D4AF37' : '#0d9488'
            : ai ? '#e8d88a' : '#e5e5ec'
        }`,
        borderRadius: 10,
        padding: '0 14px',
        fontSize: 14,
        color: ai ? '#b8960c' : '#0a0a12',
        outline: 'none',
        fontFamily: 'inherit',
        boxShadow: focused
          ? `0 0 0 3px ${ai ? 'rgba(212,175,55,.12)' : 'rgba(13,148,136,.1)'}`
          : 'none',
        transition: 'border-color .2s, box-shadow .2s',
        ...style,
      }}
      {...props}
    />
  );
}
