import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';
import Select from '../../ui/Select';

const COLORS = {
  blueMain: '#4682B4',   // Bleu acier
  blueDark: '#2B547E',   // Bleu marine
  blueLight: '#7BAFD4',  // Bleu ciel (pixels)
  border: '#E2E8F0',
  bgLight: '#F8FAFC'
};

export default function StepProfil({ data, onChange, totalMois }) {
  const cards = [
    { label: 'Niveau',      value: data.niveau      || '—' },
    { label: 'Université',  value: data.universite   || '—' },
    { label: 'Filière',     value: data.filiere      || '—' },
    { label: 'Expérience',  value: `${totalMois || 0} mois` },
  ];

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Grille de résumé style "Dashboard" ISSAT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '2rem' }}>
        {cards.map((c) => (
          <div 
            key={c.label} 
            style={{ 
              background: COLORS.bgLight, 
              border: `1px solid ${COLORS.border}`, 
              borderRadius: 4, 
              padding: '12px 14px', 
              display: 'flex', 
              gap: 10, 
              alignItems: 'center',
              borderLeft: `4px solid ${COLORS.blueMain}`
            }}
          >
            {/* Petit carré "Pixel" du logo */}
            <div style={{ width: 8, height: 8, background: COLORS.blueLight, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {c.label}
              </div>
              <div style={{ fontSize: 13, fontWeight: 900, color: COLORS.blueDark, marginTop: 1 }}>
                {c.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire de validation des données extraites */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
        <Field label="Niveau d'études" badge={{ type: 'ai', label: 'IA' }}>
          <Select 
            ai 
            value={data.niveau} 
            onChange={e => onChange('niveau', e.target.value)}
            style={{ borderRadius: 4, height: 42 }}
          >
            {['Licence','Ingénierie','Master 1','Master 2','Doctorat'].map(v => <option key={v}>{v}</option>)}
          </Select>
        </Field>
        
        <Field label="Filière / Spécialité" badge={{ type: 'ai', label: 'IA' }}>
          <Input 
            ai 
            value={data.filiere} 
            onChange={e => onChange('filiere', e.target.value)} 
            placeholder="ex: Informatique Industrielle"
            style={{ borderRadius: 4 }}
          />
        </Field>
      </div>

      <Field label="Établissement / Université" badge={{ type: 'ai', label: 'IA' }}>
        <Input 
          ai 
          value={data.universite} 
          onChange={e => onChange('universite', e.target.value)} 
          placeholder="ex: ISSAT Sousse"
          style={{ borderRadius: 4 }}
        />
      </Field>

      <div style={{ marginTop: '1.5rem', padding: '15px', background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 4 }}>
        <Field label="Expérience cumulée" badge={{ type: 'ai', label: 'Calculée' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 5 }}>
            <div style={{ position: 'relative', width: 100 }}>
              <Input 
                ai 
                value={totalMois || 0} 
                readOnly 
                style={{ 
                  width: '100%', 
                  textAlign: 'center', 
                  fontWeight: 900, 
                  fontSize: 16, 
                  color: COLORS.blueDark,
                  borderRadius: 4,
                  background: COLORS.bgLight
                }} 
              />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.blueMain, textTransform: 'uppercase' }}>
              Mois d'expérience au total
            </span>
          </div>
        </Field>
      </div>
      
      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 15, textAlign: 'center', fontWeight: 600 }}>
        ✦ Ces informations seront visibles par les recruteurs sur votre profil.
      </div>
    </div>
  );
}