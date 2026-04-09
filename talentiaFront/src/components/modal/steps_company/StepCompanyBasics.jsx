import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

export default function StepCompanyBasics({ data, onChange }) {
  return (
    <div>
      <Field label="Nom de l'entreprise (Usuel)">
        <Input 
          value={data.name || ''} 
          onChange={e => onChange('name', e.target.value)} 
          placeholder="ex: TalentIA" 
          required 
        />
      </Field>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Identifiant RNE">
          <Input 
            value={data.rne_id || ''} 
            onChange={e => onChange('rne_id', e.target.value)} 
            placeholder="ex: 1234567A" 
          />
        </Field>
        <Field label="Raison sociale">
          <Input 
            value={data.legal_name || ''} 
            onChange={e => onChange('legal_name', e.target.value)} 
            placeholder="ex: TalentIA SARL" 
          />
        </Field>
      </div>

      <Field label="Email professionnel">
        <Input 
          type="email"
          value={data.email || ''} 
          onChange={e => onChange('email', e.target.value)} 
          placeholder="contact@entreprise.com" 
          required 
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Téléphone">
          <Input 
            value={data.phone || ''} 
            onChange={e => onChange('phone', e.target.value)} 
            placeholder="+216 -- --- ---" 
          />
        </Field>
        <Field label="Site Web">
          <Input 
            value={data.website || ''} 
            onChange={e => onChange('website', e.target.value)} 
            placeholder="https://..." 
          />
        </Field>
      </div>

      <Field label="Logo de l'entreprise (URL)">
        <Input 
          value={data.logo || ''} 
          onChange={e => onChange('logo', e.target.value)} 
          placeholder="https://.../logo.png" 
        />
      </Field>
    </div>
  );
}
