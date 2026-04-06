import React from 'react';
// Note : Assurez-vous que FEATURES et TESTIMONIALS dans cvData utilisent 
// aussi les nouvelles couleurs de l'ISSAT.
import { FEATURES, TESTIMONIALS } from '../../data/cvData';

const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre Footer/Hero
  grayText: '#6b7280',
  white: '#ffffff'
};

/* ─── HOW IT WORKS (Comment ça marche) ─── */
export function HowItWorks() {
  const steps = [
    { n: '01', t: 'Déposez votre CV',    d: "L'IA de l'ISSAT extrait immédiatement toutes vos informations" },
    { n: '02', t: 'Compte pré-rempli',   d: 'Vos coordonnées sont automatiquement remplies grâce à l\'analyse' },
    { n: '03', t: 'Profil complet',      d: 'Compétences et expériences structurées en un clic' },
    { n: '04', t: 'Recevez vos offres',  d: 'Accédez aux stages exclusifs pour les étudiants de l\'ISSAT' },
  ];
  return (
    <section style={{ padding: '6rem 2rem', background: COLORS.bgDark }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.blueMain, marginBottom: 12 }}>Processus</div>
        <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#fff', letterSpacing: '-.02em', marginBottom: '4rem', fontFamily: 'sans-serif' }}>
          De votre CV au stage idéal en 4 étapes
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {steps.map((s, i) => (
            <div key={s.n} style={{ position: 'relative' }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: 12, 
                background: 'rgba(99, 145, 185, 0.15)', 
                border: `1px solid ${COLORS.blueMain}`, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 20, fontWeight: 800, color: COLORS.blueMain, marginBottom: '1.5rem' 
              }}>
                {s.n}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{s.t}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FEATURES (Fonctionnalités) ─── */
export function Features() {
  return (
    <section style={{ padding: '6rem 2rem', background: '#fff' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.blueDark, marginBottom: 12 }}>Avantages</div>
        <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-.02em', marginBottom: '3.5rem', fontFamily: 'sans-serif' }}>
          La plateforme carrière de l'ISSAT Sousse
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ 
              background: '#fff', border: '1px solid #eee', borderRadius: 16, 
              padding: '2rem', transition: 'transform .2s', cursor: 'default',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: 12, background: 'rgba(99, 145, 185, 0.1)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: '1.2rem' 
              }}>{f.ico}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: COLORS.grayText, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── TESTIMONIALS (Témoignages) ─── */
export function Testimonials() {
  return (
    <section style={{ padding: '6rem 2rem', background: '#f8fafc' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.blueMain, marginBottom: 12 }}>Réussite</div>
        <div style={{ fontSize: 'clamp(28px,4vw,40px)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-.02em', marginBottom: '3.5rem', fontFamily: 'sans-serif' }}>
          Ils ont trouvé leur stage via ISSAT Talent
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.8rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 14, color: '#334155', lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.q}"</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: '50%', background: COLORS.blueMain, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: 14, fontWeight: 700, color: '#fff' 
                }}>{t.av}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.grayText }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA (Call to Action) ─── */
export function CTA({ onSignup, onCompany }) {
  return (
    <section style={{ background: '#0f172a', padding: '6rem 2rem', textAlign: 'center' }}>
      <div style={{ maxWidth: 650, margin: '0 auto' }}>
        <div style={{ 
          fontSize: 'clamp(30px,5vw,48px)', fontWeight: 800, color: '#fff', 
          letterSpacing: '-.02em', marginBottom: '1.2rem', fontFamily: 'sans-serif' 
        }}>
          Prêt à lancer votre <span style={{ color: COLORS.blueMain }}>carrière</span> ?
        </div>
        <div style={{ fontSize: 17, color: 'rgba(255,255,255,.5)', marginBottom: '3rem', lineHeight: 1.6 }}>
          Rejoignez la communauté des étudiants de l'ISSAT Sousse et accédez aux meilleures opportunités.
        </div>
        <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onSignup} style={{ 
            height: 60, padding: '0 45px', borderRadius: 8, background: COLORS.blueMain, 
            border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', 
            transition: 'all .2s', boxShadow: `0 10px 25px rgba(99, 145, 185, 0.3)` 
          }}>
            Créer mon profil ISSAT →
          </button>
          <button onClick={onCompany} style={{ 
            height: 60, padding: '0 35px', borderRadius: 8, background: 'transparent', 
            border: `2px solid ${COLORS.blueMain}`, color: COLORS.blueMain, 
            fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' 
          }}>
            Espace Recruteur
          </button>
        </div>
      </div>
    </section>
  );
}