import React, { useState } from 'react';
import Field from '../../ui/Field';
import Toggle from '../../ui/Toggle';

const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#2B547E',
  blueLight: '#7BAFD4',
  border: '#E2E8F0',
  bgLight: '#F8FAFC'
};

export default function StepPrefs({ data, onChange }) {
  const [notifs, setNotifs] = useState(
    data?.notifs || { offres: true, hebdo: true, recrut: true }
  );
  const [avail, setAvail] = useState(data?.availability || 'Immédiate');
  const [tags,  setTags]  = useState(data?.sectors || ['Informatique', 'Génie Civil', 'Embarqué']);
  const [input, setInput] = useState('');

  function notify(key, val) {
    const updated = { ...notifs, [key]: val };
    setNotifs(updated);
    onChange && onChange('notifs', updated);
  }

  function setAvailAndNotify(val) {
    setAvail(val);
    onChange && onChange('availability', val);
  }

  function removeTag(t) {
    const updated = tags.filter(x => x !== t);
    setTags(updated);
    onChange && onChange('sectors', updated);
  }

  function addTag() {
    const val = input.trim();
    if (!val || tags.includes(val)) return;
    const updated = [...tags, val];
    setTags(updated);
    setInput('');
    onChange && onChange('sectors', updated);
  }

  const rows = [
    { k: 'offres', label: 'Alertes PFE & Stages', sub: 'Soyez notifié dès qu’une offre correspond à votre filière' },
    { k: 'hebdo',  label: 'Newsletter ISSAT',    sub: 'Événements, séminaires et actualités du campus' },
    { k: 'recrut', label: 'Contact Entreprises',  sub: 'Autoriser les partenaires à vous envoyer des messages' },
  ];

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Notifications */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.blueDark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Préférences de communication
        </div>
        {rows.map(r => (
          <div key={r.k} style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
            padding: '14px', background: '#fff', border: `1px solid ${COLORS.border}`, 
            borderRadius: 4, marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' 
          }}>
            <div style={{ flex: 1, paddingRight: 15 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.blueDark }}>{r.label}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: 600 }}>{r.sub}</div>
            </div>
            <Toggle on={notifs[r.k]} onClick={() => notify(r.k, !notifs[r.k])} color={COLORS.blueMain} />
          </div>
        ))}
      </div>

      {/* Secteurs / Domaines */}
      <Field label="Domaines d'expertise" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
          {tags.map(t => (
            <div key={t} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: 8, 
                background: COLORS.bgLight, border: `1px solid ${COLORS.blueLight}`, 
                borderRadius: 2, padding: '6px 12px', fontSize: 12, 
                fontWeight: 700, color: COLORS.blueDark, cursor: 'default' 
              }}>
              {t} 
              <span 
                onClick={() => removeTag(t)}
                style={{ fontSize: 14, color: COLORS.blueMain, cursor: 'pointer', fontWeight: 900 }}
              >
                ×
              </span>
            </div>
          ))}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTag()}
              placeholder="+ Ajouter un domaine"
              style={{ 
                border: `1.5px dashed ${COLORS.border}`, borderRadius: 2, 
                padding: '6px 12px', fontSize: 12, color: '#64748b', 
                outline: 'none', background: 'transparent', width: 140,
                fontWeight: 600
              }}
            />
            {input && (
              <button 
                onClick={addTag} 
                style={{ 
                  background: COLORS.blueMain, color: '#fff', border: 'none', 
                  borderRadius: 2, padding: '6px 10px', fontSize: 12, 
                  cursor: 'pointer', fontWeight: 900 
                }}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </Field>

      {/* Disponibilité style "Boutons radio pro" */}
      <Field label="Disponibilité pour stage / emploi" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 10 }}>
          {['Immédiate', '1 – 3 mois', '+ 3 mois'].map(o => (
            <div key={o} onClick={() => setAvailAndNotify(o)}
              style={{ 
                textAlign: 'center', padding: '12px 5px', 
                background: avail === o ? COLORS.blueDark : '#fff', 
                border: `2px solid ${avail === o ? COLORS.blueDark : COLORS.border}`, 
                borderRadius: 4, fontSize: 12, fontWeight: 800, 
                color: avail === o ? '#fff' : '#64748b', 
                cursor: 'pointer', transition: 'all .2s',
                textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
              {o}
            </div>
          ))}
        </div>
      </Field>
    </div>
  );
}