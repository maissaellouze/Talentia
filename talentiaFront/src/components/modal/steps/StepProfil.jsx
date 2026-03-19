import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

export default function StepProfil({ data, onChange, totalMois }) {
  const cards = [
    { label: 'Niveau',      value: data.niveau      || '—' },
    { label: 'Université',  value: data.universite   || '—' },  // ← dynamique
    { label: 'Filière',     value: data.filiere      || '—' },
    { label: 'Expérience',  value: `${totalMois || 0} mois` },
  ];

  return (
    <div>
      {/* Cartes résumé */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.5rem' }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4AF37', flexShrink: 0, marginTop: 4 }} />
            <div>
              <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>{c.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a12' }}>{c.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Niveau" badge={{ type: 'ai', label: 'IA' }}>
          <Select ai value={data.niveau} onChange={e => onChange('niveau', e.target.value)}>
            {['Master 2','Master 1','Licence','Ingénierie','Doctorat'].map(v => <option key={v}>{v}</option>)}
          </Select>
        </Field>
        <Field label="Filière" badge={{ type: 'ai', label: 'IA' }}>
          <Input ai value={data.filiere} onChange={e => onChange('filiere', e.target.value)} />
        </Field>
      </div>

      <Field label="Université" badge={{ type: 'ai', label: 'IA' }}>
        <Input ai value={data.universite} onChange={e => onChange('universite', e.target.value)} />
      </Field>

      <Field label="Expérience totale" badge={{ type: 'ai', label: 'IA · calculée' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Input ai value={totalMois || 0} readOnly style={{ width: 80, textAlign: 'center' }} />
          <span style={{ fontSize: 13, color: '#6b7280' }}>mois</span>
        </div>
      </Field>
    </div>
  );
}