import React from 'react';
import Button from '../../ui/Button';

export default function CompanyStepDone({ data, onClose }) {
  return (
    <div style={{ textAlign: 'center', paddingBottom: '1rem' }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f0fdfa', border: '1px solid #0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 1.5rem', animation: 'pop .5s ease' }}>🏢</div>
      <div style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 26, fontWeight: 700, color: '#0a0a12', marginBottom: 6 }}>
        Demande envoyée !
      </div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>
        Votre entreprise **{data.name}** a été enregistrée avec succès.
      </div>

      <div style={{ background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 14, padding: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: '1rem' }}>
          Notre équipe va vérifier vos informations. Vous recevrez un email de confirmation à **{data.email}** une fois votre compte activé.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['✓ Informations extraites','✓ Secteur renseigné','✓ Siège social','✓ Réseaux sociaux'].map(t => (
            <div key={t} style={{ background: '#f0fdfa', border: '1px solid #0d9488', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#0d9488' }}>{t}</div>
          ))}
        </div>
      </div>

      <Button onClick={onClose}>Fermer →</Button>
    </div>
  );
}
