import React, { useState } from 'react';
import Field from '../../ui/Field';

const LEVELS     = ['Débutant', 'Introductif', 'Intermédiaire', 'Avancé', 'Expert'];
const LANG_LEVELS = ['Débutant', 'Basique', 'Intermédiaire', 'Courant', 'Natif'];
const CATEGORIES  = ['Tech', 'Analytique', 'Design', 'Autre'];

export default function StepSkills({ skills = [], skillLevels = {}, langues = [], onSkillsChange, onLanguagesChange }) {
  const [tags,   setTags]   = useState(
    skills.map((name, i) => ({
      name,
      category: 'Tech',
      level: skillLevels[name] ? LEVELS[Math.min(skillLevels[name] - 1, 4)] : 'Intermédiaire',
    }))
  );
  const [langs,  setLangs]  = useState(langues.map(l => ({ name: l.nom || l.name, level: l.niveau || l.level })));
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Tech', level: 'Intermédiaire' });
  const [newLang,  setNewLang]  = useState({ name: '', level: 'Intermédiaire' });
  const [editSkill, setEditSkill] = useState(null); // index en cours d'édition
  const [editLang,  setEditLang]  = useState(null);

  const inputStyle = {
    height: 34, background: '#fafaf8', border: '1.5px solid #e5e5ec',
    borderRadius: 8, padding: '0 10px', fontSize: 12,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  // ── Skills ──
  function removeSkill(i) { const u = tags.filter((_, idx) => idx !== i); setTags(u); onSkillsChange && onSkillsChange(u); }
  function updateSkill(i, key, val) { const u = [...tags]; u[i] = { ...u[i], [key]: val }; setTags(u); setEditSkill(null); }
  function addSkill() {
    if (!newSkill.name.trim()) return;
    const nu = [...tags, { ...newSkill }]; setTags(nu); onSkillsChange && onSkillsChange(nu);
    setNewSkill({ name: '', category: 'Tech', level: 'Intermédiaire' });
  }

  // ── Langues ──
  function removeLang(i) { const u = langs.filter((_, idx) => idx !== i); setLangs(u); onLanguagesChange && onLanguagesChange(u); }
  function updateLang(i, key, val) { const u = [...langs]; u[i] = { ...u[i], [key]: val }; setLangs(u); setEditLang(null); }
  function addLang() {
    if (!newLang.name.trim()) return;
    const nl = [...langs, { ...newLang }]; setLangs(nl); onLanguagesChange && onLanguagesChange(nl);
    setNewLang({ name: '', level: 'Intermédiaire' });
  }

  return (
    <div>
      {/* ── SKILLS ── */}
      <Field label="Compétences techniques" badge={{ type: 'ai', label: `IA · ${tags.length}` }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {tags.map((t, i) => (
            <div key={i}>
              {editSkill === i ? (
                // Mode édition
                <div style={{ background: '#f0fdfa', border: '1.5px solid #0d9488', borderRadius: 10, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6, alignItems: 'center' }}>
                  <input style={inputStyle} value={t.name} onChange={e => { const u = [...tags]; u[i].name = e.target.value; setTags(u); }} placeholder="Nom" />
                  <select style={selectStyle} value={t.category} onChange={e => { const u = [...tags]; u[i].category = e.target.value; setTags(u); }}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <select style={selectStyle} value={t.level} onChange={e => { const u = [...tags]; u[i].level = e.target.value; setTags(u); }}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => setEditSkill(null)} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                // Mode affichage
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1.5px solid #e5e5ec', borderRadius: 10, padding: '7px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontSize: 10, background: '#f0fdfa', color: '#0d9488', border: '1px solid #0d9488', borderRadius: 4, padding: '1px 6px' }}>{t.category}</span>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{t.level}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setEditSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>✏</button>
                    <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ajouter skill */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 6, marginTop: 4 }}>
            <input style={inputStyle} value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} placeholder="+ Nouveau skill" onKeyDown={e => e.key === 'Enter' && addSkill()} />
            <select style={selectStyle} value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select style={selectStyle} value={newSkill.level} onChange={e => setNewSkill(p => ({ ...p, level: e.target.value }))}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={addSkill} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 13, cursor: 'pointer', height: 34 }}>+</button>
          </div>
        </div>
      </Field>

      {/* ── LANGUES ── */}
      <div style={{ marginTop: '1.2rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 8 }}>
          Langues — {langs.length} détectées
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {langs.map((lg, i) => (
            <div key={i}>
              {editLang === i ? (
                <div style={{ background: '#f0fdfa', border: '1.5px solid #0d9488', borderRadius: 10, padding: 10, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, alignItems: 'center' }}>
                  <input style={inputStyle} value={lg.name} onChange={e => { const u = [...langs]; u[i].name = e.target.value; setLangs(u); }} placeholder="Langue" />
                  <select style={selectStyle} value={lg.level} onChange={e => { const u = [...langs]; u[i].level = e.target.value; setLangs(u); }}>
                    {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                  <button onClick={() => setEditLang(null)} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 7, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}>✓</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 10, padding: '9px 14px' }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{lg.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{lg.level}</span>
                    <button onClick={() => setEditLang(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>✏</button>
                    <button onClick={() => removeLang(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444' }}>✕</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Ajouter langue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, marginTop: 4 }}>
            <input style={inputStyle} value={newLang.name} onChange={e => setNewLang(p => ({ ...p, name: e.target.value }))} placeholder="+ Nouvelle langue" onKeyDown={e => e.key === 'Enter' && addLang()} />
            <select style={selectStyle} value={newLang.level} onChange={e => setNewLang(p => ({ ...p, level: e.target.value }))}>
              {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button onClick={addLang} style={{ background: '#0d9488', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', fontSize: 13, cursor: 'pointer', height: 34 }}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}