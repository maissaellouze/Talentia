import React from 'react';
// Importation de l'image depuis le dossier assets
// On remonte d'un niveau (..) pour sortir du dossier layout/modal et aller vers assets
import logoImg from '../../assets/logo.png'; 

const links = ['Fonctionnalités', 'Comment ça marche', 'Recruteurs'];

export default function Navbar({ onLogin, onSignup, onCompany }) {
  // Couleurs institutionnelles ISSAT Sousse
  const colors = {
    blueMain: '#6391B9',
    blueDark: '#2B547E',
    grayText: '#4D4D4D',
    border: '#e5e5ec',
  };

  return (
    <nav style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      zIndex: 100,
      background: 'rgba(255,255,255,.95)', 
      backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${colors.border}`,
    }}>
      <div style={{
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '0 2rem',
        height: 70, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem',
      }}>
        
        {/* --- SECTION LOGO (PHOTO) --- */}
        <div 
          onClick={() => window.location.href = '/'} 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img 
            src={logoImg} 
            alt="ISSAT Sousse Talent Logo" 
            style={{ 
              height: 75,      // Hauteur idéale pour une navbar de 70px
              width: 'auto',   // Conserve les proportions
              display: 'block',
              objectFit: 'contain'
            }} 
          />
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2rem', marginLeft: '1rem' }}>
          {links.map(l => (
            <a key={l} href="#" style={{
              fontSize: 14, 
              color: '#4b5563', 
              textDecoration: 'none', 
              fontWeight: 500,
              transition: 'color 0.2s'
            }}>{l}</a>
          ))}
          <button onClick={onCompany} style={{
            fontSize: 14, 
            color: colors.blueMain, 
            textDecoration: 'none', 
            fontWeight: 600,
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: 0, 
            fontFamily: 'inherit'
          }}>Espace Recruteur</button>
        </div>

        {/* Boutons d'action (CTAs) */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <button onClick={onLogin} style={{
            background: 'none', 
            border: `1.5px solid ${colors.blueMain}`, 
            borderRadius: 6,
            padding: '8px 18px', 
            fontSize: 13, 
            fontWeight: 600, 
            cursor: 'pointer',
            color: colors.blueMain, 
            fontFamily: 'inherit', 
            transition: 'all .2s',
          }}>
            Se connecter
          </button>
          <button onClick={onSignup} style={{
            background: colors.blueMain, 
            border: 'none', 
            borderRadius: 6,
            padding: '9px 20px', 
            fontSize: 13, 
            fontWeight: 700, 
            cursor: 'pointer',
            color: '#fff', 
            fontFamily: 'inherit', 
            transition: 'all .2s',
          }}>
            Créer mon profil
          </button>
        </div>
      </div>
    </nav>
  );
}