import React from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

export default function StepCompanySocial({ data, onChange }) {
  const handleListChange = (key, value) => {
    // Split by comma and trim
    const list = value.split(',').map(s => s.trim()).filter(s => s !== '');
    onChange(key, list);
  };

  return (
    <div>
      <Field label="Domaine principal">
        <Input 
          value={data.main_domain || ''} 
          onChange={e => onChange('main_domain', e.target.value)} 
          placeholder="ex: Intelligence Artificielle" 
        />
      </Field>

      <Field label="Domaines secondaires (séparés par des virgules)">
        <Input 
          value={Array.isArray(data.secondary_domains) ? data.secondary_domains.join(', ') : ''} 
          onChange={e => handleListChange('secondary_domains', e.target.value)} 
          placeholder="ex: Cloud, Big Data, Cyber-sécurité" 
        />
      </Field>

      <Field label="Technologies utilisées (séparées par des virgules)">
        <Input 
          value={Array.isArray(data.technologies) ? data.technologies.join(', ') : ''} 
          onChange={e => handleListChange('technologies', e.target.value)} 
          placeholder="ex: React, Python, AWS, Docker" 
        />
      </Field>

      <p style={{ fontSize: 13, fontWeight: 700, margin: '20px 0 10px' }}>Réseaux Sociaux</p>
      
      {Object.entries(data.social_media || {}).map(([platform, url], i) => (
        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Field label="Plateforme">
              <select 
                value={platform} 
                onChange={e => {
                  const newSocial = { ...data.social_media };
                  const newPlatform = e.target.value;
                  if (newPlatform !== platform) {
                    newSocial[newPlatform] = url;
                    delete newSocial[platform];
                    onChange('social_media', newSocial);
                  }
                }}
                style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #e5e5ec', fontSize: 13 }}
              >
                <option value="linkedin">LinkedIn</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter / X</option>
                <option value="youtube">YouTube</option>
                <option value="website">Autre Site</option>
              </select>
            </Field>
          </div>
          <div style={{ flex: 2 }}>
            <Field label="URL">
              <Input 
                value={url} 
                onChange={e => onChange('social_media', { ...data.social_media, [platform]: e.target.value })} 
                placeholder="https://..." 
              />
            </Field>
          </div>
          <button 
            onClick={() => {
              const newSocial = { ...data.social_media };
              delete newSocial[platform];
              onChange('social_media', newSocial);
            }}
            style={{ marginBottom: 5, padding: '10px', borderRadius: 10, border: '1px solid #fee2e2', background: '#fff1f1', color: '#ef4444', cursor: 'pointer' }}
          >✕</button>
        </div>
      ))}

      <button 
        onClick={() => {
          const platforms = ['linkedin', 'facebook', 'instagram', 'twitter', 'youtube', 'website'];
          const unused = platforms.find(p => !data.social_media || !data.social_media[p]);
          if (unused) {
            onChange('social_media', { ...(data.social_media || {}), [unused]: '' });
          }
        }}
        style={{ width: '100%', padding: '10px', borderRadius: 12, border: '1px dashed #0d9488', background: '#f0fdfa', color: '#0d9488', fontWeight: 600, cursor: 'pointer', marginTop: 10 }}
      >
        + Ajouter un réseau social
      </button>
    </div>
  );
}
