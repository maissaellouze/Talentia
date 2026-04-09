import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

export default function StepCompanyLocation({ data, onChange }) {
  return (
    <div>
      <Field label="Adresse du siège">
        <Input 
          value={data.address || ''} 
          onChange={e => onChange('address', e.target.value)} 
          placeholder="ex: 12 Rue des Technologies" 
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Ville">
          <Input 
            value={data.city || ''} 
            onChange={e => onChange('city', e.target.value)} 
            placeholder="ex: Tunis" 
          />
        </Field>
        <Field label="Code Postal">
          <Input 
            type="number"
            value={data.code_postal || ''} 
            onChange={e => onChange('code_postal', e.target.value)} 
            placeholder="ex: 1080" 
          />
        </Field>
      </div>

      <Field label="Description de l'entreprise">
        <textarea 
          value={data.description || ''} 
          onChange={e => onChange('description', e.target.value)} 
          placeholder="Présentation de l'entreprise pour les candidats..."
          style={{ 
            width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e5ec',
            fontSize: 14, minHeight: 120, fontFamily: 'inherit', resize: 'vertical'
          }}
        />
      </Field>
    </div>
  );
}
