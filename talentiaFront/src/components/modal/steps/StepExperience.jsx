import React, { useState } from 'react';

const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#2B547E',
  blueLight: '#7BAFD4',
  border: '#E2E8F0',
  bgLight: '#F8FAFC',
  error: '#ef4444'
};

const inputStyle = {
  width: '100%', height: 42, background: '#fff',
  border: `2px solid ${COLORS.border}`, borderRadius: 4,
  padding: '0 12px', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

function ExpForm({ exp, onSave, onCancel }) {
  const [form, setForm] = useState({ ...exp });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ background: '#F0F7FF', border: `2px solid ${COLORS.blueMain}`, borderRadius: 4, padding: 18, marginBottom: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.blueDark, marginBottom: 5, textTransform: 'uppercase' }}>Entreprise</div>
          <input style={inputStyle} value={form.company || ''} onChange={e => set('company', e.target.value)} placeholder="ex: Telnet, Sagemcom..." />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.blueDark, marginBottom: 5, textTransform: 'uppercase' }}>Poste</div>
          <input style={inputStyle} value={form.position || ''} onChange={e => set('position', e.target.value)} placeholder="ex: Stagiaire, Développeur..." />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.blueDark, marginBottom: 5, textTransform: 'uppercase' }}>Date début</div>
          <input style={inputStyle} type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.blueDark, marginBottom: 5, textTransform: 'uppercase' }}>Date fin</div>
          <input style={inputStyle} type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value || null)} />
        </div>
      </div>
      <div style={{ marginBottom: 15 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.blueDark, marginBottom: 5, textTransform: 'uppercase' }}>Missions & Technologies</div>
        <textarea
          style={{ ...inputStyle, height: 90, padding: '10px 12px', resize: 'none', lineHeight: 1.5 }}
          value={form.description || ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Décrivez vos tâches principales..."
        />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => onSave(form)} style={{ flex: 1, height: 42, background: COLORS.blueDark, color: '#fff', border: 'none', borderRadius: 4, fontSize: 13, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase' }}>
          Enregistrer
        </button>
        <button onClick={onCancel} style={{ height: 42, padding: '0 20px', background: '#fff', color: '#64748b', border: `2px solid ${COLORS.border}`, borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

function ExpCard({ exp, onEdit, onRemove }) {
  const start = exp.start_date ? exp.start_date.slice(0, 7) : '—';
  const end   = exp.end_date   ? exp.end_date.slice(0, 7)   : 'Présent';

  return (
    <div style={{ background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: '16px', marginBottom: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 15 }}>
        <div style={{ width: 44, height: 44, borderRadius: 4, background: `linear-gradient(135deg, ${COLORS.blueDark}, ${COLORS.blueMain})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, color: '#fff', fontWeight: 900 }}>
          {exp.company ? exp.company[0].toUpperCase() : 'E'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: COLORS.blueDark, textTransform: 'uppercase' }}>{exp.position || 'Poste non spécifié'}</div>
          <div style={{ fontSize: 13, color: COLORS.blueMain, fontWeight: 700, marginTop: 2 }}>{exp.company || 'Entreprise'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: 700 }}>📅 {start} — {end}</div>
          {exp.description && (
            <div style={{ fontSize: 12, color: '#475569', marginTop: 8, lineHeight: 1.6, borderLeft: `3px solid ${COLORS.blueLight}`, paddingLeft: 10 }}>
              {exp.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={onEdit} style={{ background: '#f8fafc', border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: 'pointer', fontSize: 14, padding: '5px 10px', color: COLORS.blueDark }}>✏</button>
          <button onClick={onRemove} style={{ background: '#fff', border: `1px solid ${COLORS.error}`, borderRadius: 4, cursor: 'pointer', fontSize: 14, padding: '5px 10px', color: COLORS.error }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function StepExperience({ experiences = [], onChange }) {
  const [exps, setExps] = useState(experiences);
  const [editIndex, setEditIndex] = useState(null);
  const EMPTY = { company: '', position: '', start_date: '', end_date: '', description: '' };

  function save(form) {
    let updated = (editIndex === -1) ? [...exps, form] : exps.map((e, i) => i === editIndex ? form : e);
    setExps(updated);
    onChange && onChange('experiences', updated);
    setEditIndex(null);
  }

  function remove(i) {
    const updated = exps.filter((_, idx) => idx !== i);
    setExps(updated);
    onChange && onChange('experiences', updated);
  }

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Stats rapides style ISSAT */}
      <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
        <div style={{ flex: 1, background: COLORS.bgLight, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: '12px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Expériences</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.blueDark, marginTop: 2 }}>{exps.length}</div>
        </div>
        <div style={{ flex: 1, background: COLORS.bgLight, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: '12px' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Statut Analyse</div>
          <div style={{ fontSize: 12, fontWeight: 900, color: COLORS.blueMain, marginTop: 6 }}>{exps.length > 0 ? '✓ EXTRAIT DU CV' : 'MANUEL'}</div>
        </div>
      </div>

      {/* Liste des cartes */}
      {exps.map((exp, i) => (
        editIndex === i
          ? <ExpForm key={i} exp={exp} onSave={save} onCancel={() => setEditIndex(null)} />
          : <ExpCard key={i} exp={exp} onEdit={() => setEditIndex(i)} onRemove={() => remove(i)} />
      ))}

      {editIndex === -1 && (
        <ExpForm exp={EMPTY} onSave={save} onCancel={() => setEditIndex(null)} />
      )}

      {editIndex === null && (
        <button
          onClick={() => setEditIndex(-1)}
          style={{ 
            width: '100%', height: 48, background: 'none', 
            border: `2px dashed ${COLORS.blueMain}`, borderRadius: 4, 
            color: COLORS.blueMain, fontSize: 13, fontWeight: 800, 
            cursor: 'pointer', marginTop: 10, textTransform: 'uppercase' 
          }}
        >
          + Ajouter une expérience professionnelle
        </button>
      )}
    </div>
  );
}