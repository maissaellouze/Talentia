import React from 'react';

export default function Toggle({ on, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 40, height: 22, borderRadius: 11,
        background: on ? '#0d9488' : '#e5e5ec',
        position: 'relative', cursor: 'pointer',
        transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', width: 16, height: 16, background: '#fff',
        borderRadius: '50%', top: 3, left: on ? 21 : 3,
        transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)',
      }} />
    </div>
  );
}
