import React, { useState } from 'react';

const inputStyle = {
  width: '100%', height: 40, background: '#fafaf8',
  border: '1.5px solid #e5e5ec', borderRadius: 9,
  padding: '0 12px', fontSize: 13, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
};

function ExpForm({ exp, onSave, onCancel }) {
  const [form, setForm] = useState({ ...exp });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div style={{ background: '#f0fdfa', border: '1.5px solid #0d9488', borderRadius: 12, padding: 16, marginBottom: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Entreprise</div>
          <input style={inputStyle} value={form.company || ''} onChange={e => set('company', e.target.value)} placeholder="Nom entreprise ou Freelance" />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Poste</div>
          <input style={inputStyle} value={form.position || ''} onChange={e => set('position', e.target.value)} placeholder="Intitulé du poste" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Date début</div>
          <input style={inputStyle} type="date" value={form.start_date || ''} onChange={e => set('start_date', e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Date fin (vide = en cours)</div>
          <input style={inputStyle} type="date" value={form.end_date || ''} onChange={e => set('end_date', e.target.value || null)} />
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>Description</div>
        <textarea
          style={{ ...inputStyle, height: 80, padding: '8px 12px', resize: 'none', lineHeight: 1.5 }}
          value={form.description || ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Missions, technologies..."
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSave(form)} style={{ flex: 1, height: 38, background: '#0d9488', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Enregistrer
        </button>
        <button onClick={onCancel} style={{ height: 38, padding: '0 16px', background: '#fff', color: '#6b7280', border: '1px solid #e5e5ec', borderRadius: 9, fontSize: 13, cursor: 'pointer' }}>
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
    <div style={{ background: '#fafaf8', border: '1px solid #e5e5ec', borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🏢</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#0a0a12' }}>{exp.position || '—'}</div>
          <div style={{ fontSize: 12, color: '#0d9488', fontWeight: 600, marginTop: 1 }}>{exp.company || '—'}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{start} → {end}</div>
          {exp.description && (
            <div style={{ fontSize: 12, color: '#374151', marginTop: 6, lineHeight: 1.5, borderLeft: '2px solid #e5e5ec', paddingLeft: 8 }}>
              {exp.description.length > 120 ? exp.description.slice(0, 120) + '…' : exp.description}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
          <button onClick={onEdit}   style={{ background: 'none', border: '1px solid #e5e5ec', borderRadius: 6, cursor: 'pointer', fontSize: 12, padding: '3px 8px', color: '#6b7280' }}>✏</button>
          <button onClick={onRemove} style={{ background: 'none', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 12, padding: '3px 8px', color: '#ef4444' }}>✕</button>
        </div>
      </div>
    </div>
  );
}

export default function StepExperience({ experiences = [], onChange }) {
  const [exps,      setExps]      = useState(experiences);
  const [editIndex, setEditIndex] = useState(null);  // null = aucun, -1 = nouveau
  const EMPTY = { company: '', position: '', start_date: '', end_date: '', description: '' };

  function save(form) {
    let updated;
    if (editIndex === -1) {
      updated = [...exps, form];
    } else {
      updated = exps.map((e, i) => i === editIndex ? form : e);
    }
    setExps(updated);
    onChange && onChange(updated);
    setEditIndex(null);
  }

  function remove(i) {
    const updated = exps.filter((_, idx) => idx !== i);
    setExps(updated);
    onChange && onChange(updated);
  }

  const totalMois = Math.round(exps.reduce((acc, exp) => {
    if (!exp.start_date) return acc;
    const start = new Date(exp.start_date);
    const end   = exp.end_date ? new Date(exp.end_date) : new Date();
    return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
  }, 0));

  return (
    <div>
      {/* Résumé */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem' }}>
        <div style={{ flex: 1, background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Expériences</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0a0a12', marginTop: 2 }}>{exps.length}</div>
        </div>
        <div style={{ flex: 1, background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 10, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Durée totale</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0a0a12', marginTop: 2 }}>{totalMois} mois</div>
        </div>
      </div>

      {exps.length > 0 && editIndex === null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 10, padding: '9px 14px', marginBottom: '1rem', fontSize: 12, color: '#b8960c', fontWeight: 500 }}>
          ✦ {exps.length} expérience{exps.length > 1 ? 's' : ''} extraite{exps.length > 1 ? 's' : ''} — cliquez sur ✏ pour modifier
        </div>
      )}

      {exps.length === 0 && editIndex === null && (
        <div style={{ textAlign: 'center', padding: '2rem', background: '#fafaf8', border: '1.5px dashed #e5e5ec', borderRadius: 12, color: '#9ca3af', fontSize: 13, marginBottom: 10 }}>
          Aucune expérience — ajoutez-en une manuellement
        </div>
      )}

      {/* Liste */}
      {exps.map((exp, i) => (
        editIndex === i
          ? <ExpForm key={i} exp={exp} onSave={save} onCancel={() => setEditIndex(null)} />
          : <ExpCard key={i} exp={exp} onEdit={() => setEditIndex(i)} onRemove={() => remove(i)} />
      ))}

      {/* Formulaire nouveau */}
      {editIndex === -1 && (
        <ExpForm exp={EMPTY} onSave={save} onCancel={() => setEditIndex(null)} />
      )}

      {editIndex === null && (
        <button
          onClick={() => setEditIndex(-1)}
          style={{ width: '100%', height: 44, background: '#fff', border: '1.5px dashed #0d9488', borderRadius: 11, color: '#0d9488', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
        >
          + Ajouter une expérience
        </button>
      )}
    </div>
  );
}