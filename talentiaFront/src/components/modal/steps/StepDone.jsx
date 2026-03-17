import React from 'react';
import Button from '../../ui/Button';

export default function StepDone({ data, onClose }) {
  return (
    <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#fdfbf0', border: '1px solid #e8d88a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.5rem', animation: 'pop .5s ease' }}>🎉</div>
      <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 26, fontWeight: 700, color: '#0a0a12', marginBottom: 6 }}>
        Bienvenue, {data.firstName} !
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        Profil créé avec succès grâce à l'analyse IA.
      </div>

      <div style={{ background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 14, padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#fff', flexShrink: 0, fontFamily: "'Clash Display', sans-serif" }}>
            {(data.firstName?.[0] || 'A') + (data.lastName?.[0] || 'B')}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0a0a12', fontFamily: "'Clash Display', sans-serif" }}>{data.firstName} {data.lastName}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{data.niveau} {data.filiere} · {data.city}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['✓ 6 compétences','✓ 3 langues','✓ CV importé','✓ Alertes actives'].map(t => (
            <div key={t} style={{ background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#b8960c' }}>{t}</div>
          ))}
        </div>
      </div>

      <Button onClick={onClose}>Accéder à mon tableau de bord →</Button>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>
        Email de confirmation envoyé à {data.email}
      </div>
    </div>
  );
}
