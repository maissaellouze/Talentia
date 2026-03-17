import React from 'react';
import { JOBS_DEMO } from '../../data/cvData';

export default function Hero({ onSignup }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '100px 2rem 5rem', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: -200, right: -150, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(13,148,136,.08),transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,.05),transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
        {/* Left */}
        <div>
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#f0fdfa', border: '1px solid rgba(13,148,136,.2)',
            color: '#0d9488', fontSize: 12, fontWeight: 700,
            padding: '6px 14px', borderRadius: 20,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0d9488', animation: 'pulse 2s infinite' }} />
            Propulsé par l'Intelligence Artificielle
          </div>

          <h1 className="fade-up-1" style={{
            fontFamily: "'Clash Display', sans-serif",
            fontSize: 'clamp(40px,5vw,62px)', fontWeight: 700,
            lineHeight: 1.06, letterSpacing: '-.03em',
            color: '#0a0a12', marginBottom: '1.5rem',
          }}>
            Votre carrière,<br />
            <span style={{ position: 'relative', display: 'inline-block' }}>
              accélérée
              <span style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#f97316,#0d9488)', borderRadius: 2 }} />
            </span>
            {' '}par l'<span style={{ color: '#0d9488' }}>IA</span>
          </h1>

          <p className="fade-up-2" style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.7, maxWidth: 480, marginBottom: '2.5rem' }}>
            Importez votre CV, laissez notre IA analyser votre profil et recevez des opportunités parfaitement adaptées à vos compétences.
          </p>

          <div className="fade-up-3" style={{ display: 'flex', gap: 12 }}>
            <button onClick={onSignup} style={{
              height: 52, padding: '0 32px', borderRadius: 12,
              background: '#0d9488', border: 'none', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(13,148,136,.3)',
              transition: 'all .25s',
            }}>
              Créer mon profil d'étude
            </button>
            <button style={{
              height: 52, padding: '0 28px', borderRadius: 12,
              background: '#fff', border: '1.5px solid #e5e5ec',
              color: '#0a0a12', fontSize: 15, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .25s',
            }}>
              Voir une démo →
            </button>
          </div>

          <div className="fade-up-4" style={{ display: 'flex', gap: '2.5rem', marginTop: '3rem' }}>
            {[['12k+', 'Étudiants inscrits'], ['3 400', 'Offres actives'], ['94%', 'Taux de placement']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 28, fontWeight: 700, color: '#0a0a12', letterSpacing: '-.02em' }}>{n}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — demo card */}
        <div className="fade-up-2">
          <div style={{ background: '#fff', border: '1px solid #e5e5ec', borderRadius: 20, padding: '1.8rem', boxShadow: '0 20px 60px rgba(0,0,0,.10)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: '1rem' }}>Recommandations pour vous</div>
            {JOBS_DEMO.map(j => (
              <div key={j.title} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 12, background: '#fafaf8',
                marginBottom: 8, border: '1px solid #e5e5ec', cursor: 'pointer',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: j.high ? '#e0f2fe' : '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{j.ico}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0a0a12' }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{j.company}</div>
                </div>
                <div style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 600,
                  padding: '4px 10px', borderRadius: 20,
                  background: j.high ? '#f0fdfa' : '#fff7ed',
                  color: j.high ? '#0d9488' : '#f97316',
                  border: j.high ? '1px solid rgba(13,148,136,.2)' : 'none',
                  whiteSpace: 'nowrap',
                }}>
                  {j.match}% match
                </div>
              </div>
            ))}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#eff6ff', border: '1px solid #bfdbfe',
              borderRadius: 10, padding: '10px 14px', marginTop: 12,
            }}>
              <span style={{ fontSize: 16 }}>✦</span>
              <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 500 }}>
                IA : 3 offres correspondent à vos compétences React.js et Python
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
