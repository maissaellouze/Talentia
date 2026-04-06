import React from 'react';

const LABELS = ['CV', 'Compte', 'Profil', 'Expériences', 'Skills', 'Préfs', 'OTP', 'Fin'];

export default function ProgressBar({ step, total = 8 }) {
  // Palette extraite du nouveau logo
  const colors = {
    blueMain: '#4682B4',    // Bleu moyen du bloc central
    blueDark: '#2B547E',    // Bleu foncé (pixels et flèche)
    blueLight: '#7BAFD4',   // Bleu clair des petits carrés
    grayPixel: '#8E8E8E',   // Gris des pixels décoratifs
    border: '#E2E8F0',
  };

  const pct = step === 0 ? 5 : Math.round((step / (total - 1)) * 100);

  return (
    <div style={{ marginBottom: '2.5rem', padding: '0 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
        {LABELS.slice(0, total).map((lbl, i) => {
          const isCompleted = i < step;
          const isActive = i === step;

          return (
            <React.Fragment key={i}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                position: 'relative',
                zIndex: 2 
              }}>
                {/* Forme Carrée (Pixel Style) au lieu de cercle */}
                <div style={{
                  width: 24, height: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900, transition: 'all .4s',
                  borderRadius: 2, // Légèrement arrondi pour le style "pixel"
                  background: isCompleted ? colors.blueDark : isActive ? colors.blueMain : '#fff',
                  border: `2px solid ${isCompleted || isActive ? 'transparent' : colors.border}`,
                  color: isCompleted || isActive ? '#fff' : '#94a3b8',
                  boxShadow: isActive ? `0 0 15px ${colors.blueMain}50` : 'none',
                  transform: isActive ? 'scale(1.15)' : 'scale(1)',
                }}>
                  {isCompleted ? '✓' : i + 1}
                </div>
                
                {/* Label avec style du logo */}
                <div style={{
                  fontSize: 10, marginTop: 8,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  color: isActive ? colors.blueDark : '#94a3b8',
                  fontWeight: isActive || isCompleted ? 800 : 500,
                }}>
                  {lbl}
                </div>
              </div>

              {/* Ligne de connexion style "Pixel" */}
              {i < total - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 0 18px',
                  background: isCompleted ? colors.blueMain : colors.border,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {isCompleted && (
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                      background: `linear-gradient(90deg, ${colors.blueDark}, ${colors.blueMain})`
                    }} />
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bar de progression avec Flèche (inspirée du logo) */}
      <div style={{ 
        height: 6, 
        background: '#F1F5F9', 
        borderRadius: 2, 
        position: 'relative',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{
          height: '100%', 
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${colors.blueDark} 0%, ${colors.blueMain} 100%)`,
          borderRadius: '0 2px 2px 0', 
          transition: 'width .6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          position: 'relative'
        }}>
          {/* La flèche du logo en bout de barre */}
          <div style={{
            position: 'absolute',
            right: -8,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderLeft: `8px solid ${colors.blueMain}`,
          }} />
        </div>
      </div>
      
      {/* Petits carrés décoratifs (Pixels du logo) */}
      <div style={{ display: 'flex', gap: 4, marginTop: 8, opacity: 0.4 }}>
        <div style={{ width: 6, height: 6, background: colors.blueLight }} />
        <div style={{ width: 6, height: 6, background: colors.grayPixel }} />
        <div style={{ width: 6, height: 6, background: colors.blueDark }} />
      </div>
    </div>
  );
}