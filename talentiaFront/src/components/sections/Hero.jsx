import React from 'react';
import { JOBS_DEMO } from '../../data/cvData';

export default function Hero({ onSignup, onCompany }) {
  // Couleurs ISSAT
  const colors = {
    blueMain: '#6391B9',
    blueDark: '#2B547E',
    grayText: '#4D4D4D',
    bgLight: '#F8FAFC'
  };

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '100px 2rem 5rem', position: 'relative', overflow: 'hidden',
      background: '#fff'
    }}>
      {/* Background glows - Adaptés au bleu ISSAT */}
      <div style={{ position: 'absolute', top: -200, right: -150, width: 700, height: 700, borderRadius: '50%', background: `radial-gradient(circle, ${colors.blueMain}14, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 450, height: 450, borderRadius: '50%', background: `radial-gradient(circle, ${colors.blueDark}08, transparent 65%)`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
        {/* Left */}
        <div>
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#eff6ff', border: `1px solid ${colors.blueMain}40`,
            color: colors.blueDark, fontSize: 12, fontWeight: 700,
            padding: '6px 14px', borderRadius: 4, // Plus carré comme le logo
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.blueMain }} />
            Plateforme Technologique ISSAT
          </div>

          <h1 className="fade-up-1" style={{
            fontFamily: "system-ui, -apple-system, sans-serif", // Style plus pro
            fontSize: 'clamp(40px,5vw,62px)', fontWeight: 800,
            lineHeight: 1.06, letterSpacing: '-.03em',
            color: colors.grayText, marginBottom: '1.5rem',
          }}>
            Propulsez votre<br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              avenir
              {/* Soulignement avec le bleu du logo */}
              <span style={{ position: 'absolute', bottom: 4, left: 0, right: 0, height: 8, background: colors.blueMain, opacity: 0.2, zIndex: -1 }} />
            </span>
            {' '}à l'unisson de l'<span style={{ color: colors.blueMain }}>IA</span>
          </h1>

          <p className="fade-up-2" style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, maxWidth: 480, marginBottom: '2.5rem' }}>
            L'excellence académique de l'ISSAT Sousse rencontre l'intelligence artificielle pour connecter nos talents aux meilleures opportunités du marché.
          </p>

          <div className="fade-up-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onSignup} style={{
              height: 52, padding: '0 32px', borderRadius: 6,
              background: colors.blueMain, border: 'none', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: `0 4px 14px ${colors.blueMain}40`,
              transition: 'all .25s',
            }}>
              Créer mon profil d'étude
            </button>
            <button onClick={onCompany} style={{
              height: 52, padding: '0 28px', borderRadius: 6,
              background: '#fff', border: `1.5px solid ${colors.blueMain}`,
              color: colors.blueMain, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .25s',
            }}>
              Espace Entreprise
            </button>
          </div>

          <div className="fade-up-4" style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem', borderTop: '1px solid #f1f5f9', paddingTop: '2rem' }}>
            {[['20+', 'Filières'], ['500+', 'Partenaires'], ['98%', 'Réussite']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 28, fontWeight: 800, color: colors.blueDark, letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Card adaptée */}
        <div className="fade-up-2">
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.8rem', boxShadow: '0 20px 50px rgba(43, 84, 126, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
              <div style={{ width: 12, height: 12, background: colors.blueMain }}></div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: colors.grayText }}>Matching Intelligent</div>
            </div>
            
            {JOBS_DEMO.slice(0, 3).map(j => (
              <div key={j.title} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 8, background: '#f8fafc',
                marginBottom: 10, border: '1px solid #f1f5f9', transition: 'transform 0.2s'
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: colors.blueMain, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{j.ico}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.grayText }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{j.company}</div>
                </div>
                <div style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  padding: '4px 8px', borderRadius: 4,
                  background: colors.blueDark, color: '#fff'
                }}>
                  {j.match}%
                </div>
              </div>
            ))}
            
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: `${colors.blueMain}10`, border: `1px solid ${colors.blueMain}30`,
              borderRadius: 8, padding: '12px', marginTop: 15,
            }}>
              <span style={{ color: colors.blueMain, fontWeight: 'bold' }}>ℹ</span>
              <span style={{ fontSize: 12, color: colors.blueDark, fontWeight: 500 }}>
                Analyse : Votre profil correspond aux critères de l'industrie 4.0.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}