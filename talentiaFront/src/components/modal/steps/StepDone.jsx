import React from 'react';

const COLORS = {
  blueMain: '#4682B4',   // Bleu acier
  blueDark: '#2B547E',   // Bleu marine
  blueLight: '#7BAFD4',  // Bleu pixels
  border: '#E2E8F0',
  success: '#10B981'
};

export default function StepDone({ data, onClose }) {
  return (
    <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
      {/* Icône de succès style ISSAT */}
      <div style={{ 
        width: 80, height: 80, borderRadius: 4, 
        background: '#F0F7FF', border: `2px solid ${COLORS.blueMain}`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontSize: 36, margin: '0 auto 1.5rem',
        boxShadow: '0 10px 20px rgba(70, 130, 180, 0.15)'
      }}>
        🎓
      </div>

      <h2 style={{ 
        fontSize: 28, fontWeight: 900, color: COLORS.blueDark, 
        marginBottom: 8, letterSpacing: '-1px' 
      }}>
        Bienvenue, {data.firstName} !
      </h2>
      
      <p style={{ fontSize: 14, color: '#64748B', marginBottom: '2rem', fontWeight: 600 }}>
        Votre profil académique et professionnel est désormais actif.
      </p>

      {/* Carte Récapitulative Professionnelle */}
      <div style={{ 
        background: '#fff', border: `1px solid ${COLORS.border}`, 
        borderRadius: 4, padding: '1.5rem', textAlign: 'left', 
        marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Badge d'accentuation en coin */}
        <div style={{ 
          position: 'absolute', top: 0, right: 0, 
          width: 40, height: 40, background: COLORS.blueMain, 
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)' 
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 15 }}>
          <div style={{ 
            width: 56, height: 56, borderRadius: 4, 
            background: `linear-gradient(135deg, ${COLORS.blueDark}, ${COLORS.blueMain})`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 
          }}>
            {(data.firstName?.[0] || 'A') + (data.lastName?.[0] || 'B')}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.blueDark }}>
              {data.firstName} {data.lastName}
            </div>
            <div style={{ fontSize: 13, color: COLORS.blueMain, fontWeight: 700, marginTop: 2 }}>
              {data.niveau} · {data.filiere}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            '✓ Dossier complet',
            '✓ CV analysé par IA',
            '✓ Compétences validées',
            '✓ Visibilité recruteurs'
          ].map(t => (
            <div key={t} style={{ 
              background: '#F8FAFC', border: `1px solid ${COLORS.border}`, 
              borderRadius: 2, padding: '5px 12px', fontSize: 11, 
              color: COLORS.blueDark, fontWeight: 800, textTransform: 'uppercase'
            }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Bouton d'action principal */}
      <button 
        onClick={onClose}
        style={{ 
          width: '100%', height: 56, background: `linear-gradient(135deg, ${COLORS.blueDark} 0%, ${COLORS.blueMain} 100%)`,
          color: '#fff', border: 'none', borderRadius: 4, fontWeight: 900, 
          fontSize: 15, cursor: 'pointer', letterSpacing: '1px',
          boxShadow: '0 4px 15px rgba(43, 84, 126, 0.3)',
          transition: 'transform 0.2s'
        }}
      >
        ACCÉDER AU DASHBOARD →
      </button>

      <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 15, fontWeight: 700 }}>
        Un email de confirmation a été envoyé à <span style={{ color: COLORS.blueMain }}>{data.email}</span>
      </div>
    </div>
  );
}