import React, { useState } from 'react';
import Field from '../../ui/Field';

const LEVELS      = ['Débutant', 'Introductif', 'Intermédiaire', 'Avancé', 'Expert'];
const LANG_LEVELS = ['A1 / A2', 'B1 / B2', 'C1 / C2', 'Courant', 'Natif'];
const CATEGORIES   = ['Développement', 'Réseaux', 'Mécanique', 'Management', 'Autre'];

const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#2B547E',
  blueLight: '#7BAFD4',
  border: '#E2E8F0',
  error: '#ef4444',
  bgLight: '#F8FAFC'
};

export default function StepSkills({ skills = [], skillLevels = {}, langues = [], onSkillsChange, onLanguagesChange }) {
  const [tags, setTags] = useState(
    skills.map((name) => ({
      name,
      category: 'Développement',
      level: skillLevels[name] ? LEVELS[Math.min(skillLevels[name] - 1, 4)] : 'Intermédiaire',
    }))
  );
  const [langs, setLangs] = useState(langues.map(l => ({ name: l.nom || l.name, level: l.niveau || l.level })));
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Développement', level: 'Intermédiaire' });
  const [newLang, setNewLang] = useState({ name: '', level: 'Intermédiaire' });
  const [editSkill, setEditSkill] = useState(null);
  const [editLang, setEditLang] = useState(null);

  const inputStyle = {
    height: 38, background: '#fff', border: `2px solid ${COLORS.border}`,
    borderRadius: 4, padding: '0 10px', fontSize: 12, fontWeight: 600,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  // ── Handlers ──
  function syncSkills(u) { setTags(u); onSkillsChange && onSkillsChange(u); }
  function syncLangs(u) { setLangs(u); onLanguagesChange && onLanguagesChange(u); }

  function addSkill() {
    if (!newSkill.name.trim()) return;
    const nu = [...tags, { ...newSkill }];
    syncSkills(nu);
    setNewSkill({ name: '', category: 'Développement', level: 'Intermédiaire' });
  }

  function addLang() {
    if (!newLang.name.trim()) return;
    const nl = [...langs, { ...newLang }];
    syncLangs(nl);
    setNewLang({ name: '', level: 'Intermédiaire' });
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* ── SKILLS ── */}
      <Field label="Expertise Technique" badge={{ type: 'ai', label: `IA · ${tags.length} COMPÉTENCES` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {tags.map((t, i) => (
            <div key={i}>
              {editSkill === i ? (
                <div style={{ background: '#F0F7FF', border: `2px solid ${COLORS.blueMain}`, borderRadius: 4, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                  <input style={inputStyle} value={t.name} onChange={e => { const u = [...tags]; u[i].name = e.target.value; setTags(u); }} />
                  <select style={selectStyle} value={t.category} onChange={e => { const u = [...tags]; u[i].category = e.target.value; setTags(u); }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select style={selectStyle} value={t.level} onChange={e => { const u = [...tags]; u[i].level = e.target.value; setTags(u); }}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => { syncSkills(tags); setEditSkill(null); }} style={{ background: COLORS.blueDark, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: '10px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.blueDark, textTransform: 'uppercase' }}>{t.name}</span>
                    <span style={{ fontSize: 10, background: COLORS.bgLight, color: COLORS.blueMain, border: `1px solid ${COLORS.blueLight}`, borderRadius: 2, padding: '2px 8px', fontWeight: 700 }}>{t.category.toUpperCase()}</span>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{t.level}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setEditSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                    <button onClick={() => { const u = tags.filter((_, idx) => idx !== i); syncSkills(u); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: COLORS.error }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 8, marginTop: 5 }}>
            <input style={inputStyle} value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} placeholder="+ Nouvelle compétence" onKeyDown={e => e.key === 'Enter' && addSkill()} />
            <select style={selectStyle} value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={selectStyle} value={newSkill.level} onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={addSkill} style={{ background: COLORS.blueMain, color: '#fff', border: 'none', borderRadius: 4, padding: '0 15px', fontSize: 18, fontWeight: 900, cursor: 'pointer', height: 38 }}>+</button>
          </div>
        </div>
      </Field>

      {/* ── LANGUES ── */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1.5px', color: COLORS.blueDark, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
           <span style={{ width: 8, height: 8, background: COLORS.blueMain }}></span> Maîtrise des Langues
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {langs.map((lg, i) => (
            <div key={i}>
              {editLang === i ? (
                <div style={{ background: COLORS.bgLight, border: `2px solid ${COLORS.blueMain}`, borderRadius: 4, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                  <input style={inputStyle} value={lg.name} onChange={e => { const u = [...langs]; u[i].name = e.target.value; setLangs(u); }} />
                  <select style={selectStyle} value={lg.level} onChange={e => { const u = [...langs]; u[i].level = e.target.value; setLangs(u); }}>
                    {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => { syncLangs(langs); setEditLang(null); }} style={{ background: COLORS.blueDark, color: '#fff', border: 'none', borderRadius: 4, padding: '8px 12px', fontSize: 14, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: '10px 16px' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: COLORS.blueDark }}>{lg.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: COLORS.blueMain, fontWeight: 800, textTransform: 'uppercase' }}>{lg.level}</span>
                    <button onClick={() => setEditLang(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✏️</button>
                    <button onClick={() => { const u = langs.filter((_, idx) => idx !== i); syncLangs(u); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: COLORS.error }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginTop: 5 }}>
            <input style={inputStyle} value={newLang.name} onChange={e => setNewLang(p => ({ ...p, name: e.target.value }))} placeholder="+ Ajouter une langue" onKeyDown={e => e.key === 'Enter' && addLang()} />
            <select style={selectStyle} value={newLang.level} onChange={e => setNewLang(p => ({ ...p, level: e.target.value }))}>
              {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={addLang} style={{ background: COLORS.blueMain, color: '#fff', border: 'none', borderRadius: 4, padding: '0 15px', fontSize: 18, fontWeight: 900, cursor: 'pointer', height: 38 }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}