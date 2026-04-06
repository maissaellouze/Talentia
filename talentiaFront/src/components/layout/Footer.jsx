import React from 'react';
// Importation de l'image depuis le dossier assets
// On remonte d'un niveau (..) pour sortir du dossier layout et aller vers assets
import logoImg from '../../assets/logo.png'; 

export default function Footer() {
  const colors = {
    bg: '#1e1e2e',
    border: 'rgba(255,255,255,.06)',
    textMuted: 'rgba(255,255,255,.35)',
    textCopyright: 'rgba(255,255,255,.2)',
    blueMain: '#6391B9'
  };

  return (
    <footer style={{
      background: colors.bg, 
      padding: '2.5rem 2rem',
      borderTop: `1px solid ${colors.border}`,
    }}>
      <div style={{
        maxWidth: 1200, 
        margin: '0 auto',
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '1.5rem',
      }}>
        
        {/* --- SECTION LOGO (PHOTO) --- */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img 
            src={logoImg} 
            alt="ISSAT Sousse Logo" 
            style={{ 
              height: 32, // Taille légèrement plus petite pour le footer
              width: 'auto',
              filter: 'brightness(1.2)' // Optionnel : rend le logo un peu plus clair sur fond sombre
            }} 
          />
          <span style={{
            fontSize: 18,
            fontWeight: 800, 
            color: '#fff',
            fontFamily: 'sans-serif',
            letterSpacing: '-0.5px'
          }}>
            ISSAT<span style={{ color: colors.blueMain }}> Talent</span>
          </span>
        </div>

        {/* Liens du Footer */}
        <div style={{ display: 'flex', gap: '2rem' }}>
          {['À propos', 'Recruteurs', 'Confidentialité', 'Contact'].map(l => (
            <a key={l} href="#" style={{
              fontSize: 13, 
              color: colors.textMuted, 
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#fff'}
            onMouseOut={(e) => e.target.style.color = colors.textMuted}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div style={{ 
          fontSize: 12, 
          color: colors.textCopyright,
          fontFamily: 'sans-serif'
        }}>
          © 2026 ISSAT Sousse Talent. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}