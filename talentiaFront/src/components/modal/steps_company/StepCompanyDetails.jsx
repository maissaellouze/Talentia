import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

export default function StepCompanyDetails({ data, onChange }) {
  return (
    <div>
      <Field label="Secteur d'activité">
        <Input 
          value={data.sector || ''} 
          onChange={e => onChange('sector', e.target.value)} 
          placeholder="ex: Technologies de l'information" 
        />
      </Field>

      <Field label="Activité (Détails)">
        <textarea 
          value={data.activity || ''} 
          onChange={e => onChange('activity', e.target.value)} 
          placeholder="Décrivez brièvement l'activité principale..."
          style={{ 
            width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e5ec',
            fontSize: 14, minHeight: 80, fontFamily: 'inherit', resize: 'vertical'
          }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Code NAF">
          <Input 
            value={data.naf_code || ''} 
            onChange={e => onChange('naf_code', e.target.value)} 
            placeholder="ex: 6201Z" 
          />
        </Field>
        <Field label="Forme juridique">
          <Input 
            value={data.legal_form || ''} 
            onChange={e => onChange('legal_form', e.target.value)} 
            placeholder="ex: SARL, SA..." 
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Année de création">
          <Input 
            type="number"
            value={data.creation_year || ''} 
            onChange={e => onChange('creation_year', e.target.value)} 
            placeholder="ex: 2010" 
          />
        </Field>
        <Field label="Nombre d'employés">
          <Input 
            type="number"
            value={data.employee_count || ''} 
            onChange={e => onChange('employee_count', e.target.value)} 
            placeholder="ex: 50" 
          />
        </Field>
      </div>
    </div>
  );
}
