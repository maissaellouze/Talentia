import React from 'react';

const BADGE = {
  req: { background: '#fef2f2', color: '#dc2626' },
  opt: { background: '#fafaf8', color: '#6b7280' },
  ai:  { background: '#fdfbf0', color: '#b8960c', border: '1px solid #e8d88a' },
};

export function Badge({ type, children }) {
  return (
    <span style={{
      fontSize: 9, padding: '2px 6px', borderRadius: 4,
      fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
      ...BADGE[type],
    }}>
      {children}
    </span>
  );
}

export default function Field({ label, badge, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      {label && (
        <div style={{
          fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: '#6b7280',
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
        }}>
          {label}
          {badge && <Badge type={badge.type}>{badge.label}</Badge>}
        </div>
      )}
      {children}
    </div>
  );
}
