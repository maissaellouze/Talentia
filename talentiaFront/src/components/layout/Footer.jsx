import React from 'react';
import Logo from '../ui/Logo';

export default function Footer() {
  return (
    <footer style={{
      background: '#1e1e2e', padding: '2.5rem 2rem',
      borderTop: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Logo size={24} />
          <span style={{
            fontFamily: "'Clash Display', sans-serif", fontSize: 16,
            fontWeight: 700, color: '#fff',
          }}>
            Talent<span style={{ color: '#14b8a6' }}>IA</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['À propos', 'Recruteurs', 'Confidentialité', 'Contact'].map(l => (
            <a key={l} href="#" style={{
              fontSize: 13, color: 'rgba(255,255,255,.35)', textDecoration: 'none',
            }}>{l}</a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.2)' }}>
          © 2025 TalentIA. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
