import React, { useState } from 'react';
import Field from '../../ui/Field';
import Toggle from '../../ui/Toggle';

export default function StepPrefs() {
  const [notifs, setNotifs] = useState({ offres: true, hebdo: true, recrut: true });
  const [avail,  setAvail]  = useState('Immédiate');
  const [tags,   setTags]   = useState(['FinTech','SaaS / Cloud','IA / Data']);

  const rows = [
    { k: 'offres', label: 'Nouvelles offres',      sub: 'Alertes correspondant à votre profil' },
    { k: 'hebdo',  label: 'Résumé hebdomadaire',   sub: 'Email récapitulatif chaque semaine' },
    { k: 'recrut', label: 'Messages recruteurs',   sub: 'Quand un recruteur vous contacte' },
  ];

  return (
    <div>
      {rows.map(r => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 10, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{r.sub}</div>
          </div>
          <Toggle on={notifs[r.k]} onClick={() => setNotifs(p => ({ ...p, [r.k]: !p[r.k] }))} />
        </div>
      ))}

      <Field label="Secteurs d'intérêt" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {tags.map(t => (
            <div key={t} onClick={() => setTags(tags.filter(x => x !== t))}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px solid #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, cursor: 'pointer' }}>
              {t} <span style={{ fontSize: 10, color: '#6b7280' }}>✕</span>
            </div>
          ))}
          <div style={{ border: '1.5px dashed #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>+ Ajouter</div>
        </div>
      </Field>

      <Field label="Disponibilité">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
          {['Immédiate','1 – 3 mois','+ 3 mois'].map(o => (
            <div key={o} onClick={() => setAvail(o)}
              style={{ textAlign: 'center', padding: '11px 8px', background: avail === o ? '#f0fdfa' : '#fafaf8', border: `1.5px solid ${avail === o ? '#0d9488' : '#e5e5ec'}`, borderRadius: 10, fontSize: 12, fontWeight: 600, color: avail === o ? '#0d9488' : '#6b7280', cursor: 'pointer', transition: 'all .2s' }}>
              {o}
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}
