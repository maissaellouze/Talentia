import React, { useState } from 'react';
import Field from '../../ui/Field';

const LEVELS = ['Basique','Intermédiaire','Courant','Natif'];

export default function StepSkills({ skills, skillLevels, langues }) {
  const [tags, setTags] = useState(skills);
  const [levels, setLevels] = useState(langues);

  return (
    <div>
      <Field label="Techniques" badge={{ type: 'ai', label: `IA · ${tags.length}` }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
          {tags.map(t => (
            <div key={t} onClick={() => setTags(tags.filter(x => x !== t))}
              style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: '1.5px solid #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              {t} <span style={{ fontSize: 10, color: '#6b7280' }}>✕</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', border: '1.5px dashed #e5e5ec', borderRadius: 20, padding: '4px 11px', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>+ Ajouter</div>
        </div>
      </Field>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 8 }}>Niveaux de maîtrise</div>
        <div style={{ background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 12, overflow: 'hidden' }}>
          {Object.entries(skillLevels).slice(0, 3).map(([sk, lv], i, arr) => (
            <div key={sk} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid #e5e5ec' : 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{sk}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3,4,5].map(d => <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: d <= lv ? '#D4AF37' : '#e5e5ec' }} />)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 8 }}>
          Langues — IA · {levels.length} détectées
        </div>
        <div style={{ background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 12, overflow: 'hidden' }}>
          {levels.map((lg, i) => (
            <div key={lg.nom} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: i < levels.length - 1 ? '1px solid #e5e5ec' : 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{lg.nom}</span>
              <select defaultValue={lg.niveau} style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#6b7280', cursor: 'pointer', outline: 'none', fontFamily: 'inherit' }}>
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <Field label="Poste visé" style={{ marginTop: '1rem' }}>
        <select style={{ width: '100%', height: 46, background: '#fafaf8', border: '1.5px solid #e5e5ec', borderRadius: 10, padding: '0 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
          <option>Stage PFE</option><option>CDI / CDD</option><option>Alternance</option><option>Freelance</option>
        </select>
      </Field>
    </div>
  );
}
