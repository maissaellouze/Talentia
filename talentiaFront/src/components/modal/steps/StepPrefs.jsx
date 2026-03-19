import React, { useState } from 'react';
import Field from '../../ui/Field';
import Toggle from '../../ui/Toggle';

export default function StepPrefs({ data, onChange }) {
  const [notifs, setNotifs] = useState(
    data?.notifs || { offres: true, hebdo: true, recrut: true }
  );
  const [avail, setAvail] = useState(data?.availability || 'Immédiate');
  const [tags,  setTags]  = useState(data?.sectors || ['FinTech', 'SaaS / Cloud', 'IA / Data']);
  const [input, setInput] = useState('');

  function notify(key, val) {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    onChange && onChange({ notifs: updated, availability: avail, sectors: tags });
  }

  function setAvailAndNotify(val) {
    setAvail(val);
    onChange && onChange({ notifs, availability: val, sectors: tags });
  }

  function removeTag(t) {
    const updated = tags.filter(x => x !== t);
    setTags(updated);
    onChange && onChange({ notifs, availability: avail, sectors: updated });
  }

  function addTag() {
    if (!input.trim() || tags.includes(input.trim())) return;
    const updated = [...tags, input.trim()];
    setTags(updated);
    setInput('');
    onChange && onChange({ notifs, availability: avail, sectors: updated });
  }

  const rows = [
    { k: 'offres', label: 'Nouvelles offres',    sub: 'Alertes correspondant à votre profil' },
    { k: 'hebdo',  label: 'Résumé hebdomadaire', sub: 'Email récapitulatif chaque semaine' },
    { k: 'recrut', label: 'Messages recruteurs', sub: 'Quand un recruteur vous contacte' },
  ];

  return (
    <div>
      {/* Notifications */}
      {rows.map(r => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 10, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{r.sub}</div>
          </div>
          <Toggle on={notifs[r.k]} onClick={() => notify(r.k, !notifs[r.k])} />
        </div>
      ))}

      {/* Secteurs */}
      <Field label="Secteurs d'intérêt" style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {tags.map(t => (
            <div key={t} onClick={() => removeTag(t)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px solid #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, cursor: 'pointer' }}>
              {t} <span style={{ fontSize: 10, color: '#6b7280' }}>✕</span>
            </div>
          ))}
          {/* Champ ajout inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="+ Ajouter"
              style={{ border: '1.5px dashed #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, color: '#6b7280', outline: 'none', background: 'transparent', width: 100 }}
            />
            {input && (
              <button onClick={addTag} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 20, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
            )}
          </div>
        </div>
      </Field>

      {/* Disponibilité */}
      <Field label="Disponibilité">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 8 }}>
          {['Immédiate', '1 – 3 mois', '+ 3 mois'].map(o => (
            <div key={o} onClick={() => setAvailAndNotify(o)}
              style={{ textAlign: 'center', padding: '11px 8px', background: avail === o ? '#f0fdfa' : '#fafaf8', border: `1.5px solid ${avail === o ? '#0d9488' : '#e5e5ec'}`, borderRadius: 10, fontSize: 12, fontWeight: 600, color: avail === o ? '#0d9488' : '#6b7280', cursor: 'pointer', transition: 'all .2s' }}>
              {o}
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}