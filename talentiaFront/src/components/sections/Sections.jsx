import React from 'react';
import { FEATURES, TESTIMONIALS } from '../../data/cvData';

/* ─── HOW IT WORKS ─── */
export function HowItWorks() {
  const steps = [
    { n: '01', t: 'Déposez votre CV',    d: "L'IA extrait immédiatement toutes vos informations personnelles" },
    { n: '02', t: 'Compte pré-rempli',   d: 'Prénom, nom, email, téléphone et date de naissance extraits automatiquement' },
    { n: '03', t: 'Profil complet',      d: 'Compétences, formation et expériences structurées en un clic' },
    { n: '04', t: 'Recevez vos offres',  d: 'Recommandations personnalisées avec score IA de compatibilité' },
  ];
  return (
    <section style={{ padding: '6rem 2rem', background: '#1e1e2e' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#14b8a6', marginBottom: 12 }}>Comment ça marche</div>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#fff', letterSpacing: '-.02em', marginBottom: '4rem' }}>
          De votre CV à l'offre idéale en 4 étapes
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.5rem' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ position: 'relative' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(13,184,166,.12)', border: '1px solid rgba(13,184,166,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700, color: '#14b8a6', marginBottom: '1.2rem' }}>{s.n}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7 }}>{s.d}</div>
              {i < 3 && <div style={{ position: 'absolute', right: '-1rem', top: 12, color: 'rgba(255,255,255,.15)', fontSize: 22 }}>→</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES ─── */
export function Features() {
  return (
    <section style={{ padding: '6rem 2rem', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0d9488', marginBottom: 12 }}>Fonctionnalités</div>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#0a0a12', letterSpacing: '-.02em', marginBottom: '3.5rem' }}>
          Tout ce dont vous avez besoin
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '1px solid #e5e5ec', borderRadius: 16, padding: '1.8rem', transition: 'all .25s', cursor: 'default' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: '1.2rem' }}>{f.ico}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0a0a12', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS ─── */
export function Testimonials() {
  return (
    <section style={{ padding: '6rem 2rem', background: '#fafaf8' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0d9488', marginBottom: 12 }}>Témoignages</div>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#0a0a12', letterSpacing: '-.02em', marginBottom: '3.5rem' }}>
          Ils ont trouvé leur opportunité
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: '#fff', border: '1px solid #e5e5ec', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ fontSize: 14, color: '#0a0a12', lineHeight: 1.7, marginBottom: '1.2rem', fontStyle: 'italic' }}>{t.q}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{t.av}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a12' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
export function CTA({ onSignup }) {
  return (
    <section style={{ background: '#0a0a12', padding: '6rem 2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, color: '#fff', letterSpacing: '-.02em', marginBottom: '1rem' }}>
          Prêt à booster votre <span style={{ color: '#14b8a6' }}>carrière</span> ?
        </div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,.45)', marginBottom: '2.5rem' }}>
          Rejoignez 12 000+ étudiants qui utilisent TalentIA.
        </div>
        <button onClick={onSignup} style={{ height: 56, padding: '0 40px', borderRadius: 12, background: '#0d9488', border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(13,148,136,.3)' }}>
          Créer mon profil gratuitement →
        </button>
      </div>
    </section>
  );
}
