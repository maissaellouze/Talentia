import React, { useState } from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

function PasswordField() {
  const [val, setVal] = useState('');

  function score(v) {
    let s = 0;
    if (v.length >= 6) s++;
    if (v.length >= 10) s++;
    if (/[A-Z]/.test(v) && /[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }

  const s   = score(val);
  const clr = s <= 1 ? '#ef4444' : s === 2 ? '#d97706' : '#D4AF37';
  const lbl = ['', 'Faible', 'Faible', 'Moyen', 'Fort ✓'][s];

  return (
    <Field label="Mot de passe" badge={{ type: 'req', label: 'requis' }}>
      <Input
        type="password"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="Minimum 8 caractères"
      />
      <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < s ? clr : '#e5e5ec', transition: 'background .3s' }} />
        ))}
      </div>
      {val && <div style={{ fontSize: 11, marginTop: 5, color: clr }}>{lbl}</div>}
    </Field>
  );
}

export default function StepCompte({ data, onChange, aiUsed }) {
  return (
    <div>
      {/* AI note */}
      {aiUsed && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fdfbf0', border: '1px solid #e8d88a', borderRadius: 10, padding: '9px 14px', marginBottom: '1.2rem', fontSize: 12, color: '#b8960c', fontWeight: 500 }}>
          ✦ Informations extraites de votre CV — vérifiez si nécessaire
        </div>
      )}

      {/* Photo de profil */}
      <Field label="Photo de profil" badge={{ type: 'opt', label: 'optionnel' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 16, flexShrink: 0 }}>
            {(data.firstName?.[0] || 'A') + (data.lastName?.[0] || 'B')}
          </div>
          <Input
            ai={aiUsed && !!data.profilePicture}
            value={data.profilePicture}
            onChange={e => onChange('profilePicture', e.target.value)}
            placeholder="URL photo (extraite du CV si disponible)"
            style={{ flex: 1 }}
          />
        </div>
      </Field>

      {/* Prénom / Nom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Prénom" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="Ahmed" />
        </Field>
        <Field label="Nom" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="Ben Ali" />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email" badge={{ type: 'req', label: 'requis' }}>
        <Input ai={aiUsed} value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="votre@email.tn" type="email" />
      </Field>

      {/* Téléphone / Date naissance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Téléphone" badge={{ type: 'opt', label: 'optionnel' }}>
          <Input ai={aiUsed} value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+216 XX XXX XXX" type="tel" />
        </Field>
        <Field label="Date de naissance" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.dateOfBirth} onChange={e => onChange('dateOfBirth', e.target.value)} type="date" />
        </Field>
      </div>

      {/* Ville / Adresse */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Ville" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.city} onChange={e => onChange('city', e.target.value)} placeholder="Tunis" />
        </Field>
        <Field label="Adresse" badge={{ type: 'opt', label: 'optionnel' }}>
          <Input ai={aiUsed} value={data.address} onChange={e => onChange('address', e.target.value)} placeholder="Rue, quartier..." />
        </Field>
      </div>

      {/* Password section */}
      <div style={{ height: 1, background: '#e5e5ec', margin: '1.4rem 0' }} />
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#6b7280', marginBottom: 12 }}>
        🔒 Sécurisez votre compte
      </div>
      <PasswordField />
      <Field label="Confirmer" badge={{ type: 'req', label: 'requis' }}>
        <Input type="password" placeholder="Répétez le mot de passe" />
      </Field>
    </div>
  );
}
