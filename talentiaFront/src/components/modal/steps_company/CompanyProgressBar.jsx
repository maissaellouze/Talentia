import React from 'react';

const LABELS = ['Extraction', 'Bases', 'Détails', 'Lieu', 'Social', 'Fin'];

export default function CompanyProgressBar({ step, total = 6 }) {
  const pct = step === 0 ? 2 : Math.round((step / (total - 1)) * 100);
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        {LABELS.slice(0, total).map((lbl, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, transition: 'all .3s',
                background: i < step ? '#0d9488' : i === step ? '#0d9488' : '#fff',
                border: `2px solid ${i <= step ? '#0d9488' : '#e5e5ec'}`,
                color: i <= step ? '#fff' : '#6b7280',
                boxShadow: i === step ? '0 0 0 4px rgba(13,148,136,.15)' : 'none',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <div style={{
                fontSize: 9, whiteSpace: 'nowrap',
                color: i <= step ? '#0d9488' : '#6b7280',
                fontWeight: i === step ? 700 : 400,
              }}>
                {lbl}
              </div>
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 2px 18px',
                background: i < step ? '#0d9488' : '#e5e5ec',
                transition: 'background .4s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <div style={{ height: 3, background: '#e5e5ec', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg,#0d9488,#14b8a6)',
          borderRadius: 2, transition: 'width .5s ease',
        }} />
      </div>
    </div>
  );
}
