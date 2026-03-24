import React from 'react';
import Logo from '../ui/Logo';

const links = ['Fonctionnalités', 'Comment ça marche', 'Recruteurs'];

export default function Navbar({ onLogin, onSignup, onCompany }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(250,250,248,.93)', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid #e5e5ec',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 2rem',
        height: 64, display: 'flex', alignItems: 'center', gap: '2rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={36} />
          <span style={{
            fontFamily: "'Clash Display', sans-serif", fontSize: 21,
            fontWeight: 700, color: '#0a0a12', letterSpacing: '-.02em',
          }}>
            Talent<span style={{ color: '#0d9488' }}>IA</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2rem', marginLeft: '2rem' }}>
          {links.map(l => (
            <a key={l} href="#" style={{
              fontSize: 14, color: '#6b7280', textDecoration: 'none', fontWeight: 500,
            }}>{l}</a>
          ))}
         <a href="/admin" style={{
            fontSize: 14, color: '#94a3b8', textDecoration: 'none', fontWeight: 500,
          }}>Admin</a>
          <button onClick={onCompany} style={{
            fontSize: 14, color: '#0d9488', textDecoration: 'none', fontWeight: 600,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit'
          }}>Espace Recruteur</button>
        </div>

        {/* CTAs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button onClick={onLogin} style={{
            background: 'none', border: '1.5px solid #e5e5ec', borderRadius: 9,
            padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            color: '#0a0a12', fontFamily: 'inherit', transition: 'all .2s',
          }}>
            Se connecter
          </button>
          <button onClick={onSignup} style={{
            background: '#0a0a12', border: 'none', borderRadius: 9,
            padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            color: '#fff', fontFamily: 'inherit', transition: 'all .2s',
          }}>
            Créer mon profil d'étude
          </button>
        </div>
      </div>
    </nav>
  );
}
