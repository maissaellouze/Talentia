import React, { useState } from 'react';
import Field from '../../ui/Field';
import Input from '../../ui/Input';

const COLORS = {
  blueMain: '#4682B4',   // Bleu du chapeau
  blueDark: '#2B547E',   // Bleu de la flèche
  blueLight: '#7BAFD4',  // Bleu ciel des pixels
  border: '#E2E8F0',
  warning: '#b8960c',
  error: '#ef4444'
};

function PasswordField({ value, onChange }) {
  function score(v) {
    let s = 0;
    if (v.length >= 8)  s++;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    return s;
  }
  const s   = score(value);
  // Dégradé de bleu selon la force
  const clr = s <= 1 ? COLORS.error : s === 2 ? '#d97706' : COLORS.blueMain;
  const lbl = ['', 'Faible', 'Faible', 'Moyen', 'Fort ✓'][s];

  return (
    <Field label="Mot de passe" badge={{ type: 'req', label: 'requis' }}>
      <Input
        type="password"
        value={value}
        onChange={e => onChange('password', e.target.value)}
        placeholder="Minimum 8 caractères"
        style={{ borderRadius: 4 }}
      />
      <div style={{ display: 'flex', gap: 4, marginTop: 7 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 1, background: i < s ? clr : '#e5e5ec', transition: 'background .3s' }} />
        ))}
      </div>
      {value && <div style={{ fontSize: 11, marginTop: 5, color: clr, fontWeight: 700 }}>{lbl}</div>}
    </Field>
  );
}

export default function StepCompte({ data, onChange, aiUsed }) {
  const [confirmPwd, setConfirmPwd] = useState('');
  const pwdMatch = !confirmPwd || confirmPwd === data.password;

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* Bannière IA inspirée des pixels du logo */}
      {aiUsed && (
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 8, 
          background: '#fffdf0', border: `1px solid #e8d88a`, 
          borderRadius: 4, padding: '10px 14px', marginBottom: '1.5rem', 
          fontSize: 12, color: COLORS.warning, fontWeight: 600,
          borderLeft: `4px solid ${COLORS.warning}`
        }}>
          ✦ ANALYSE IA : Les champs ont été pré-remplis via votre CV.
        </div>
      )}

      {/* Photo de profil avec le gradient du logo */}
      <Field label="Photo de profil" badge={{ type: 'opt', label: 'optionnel' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 52, height: 52, borderRadius: 4, 
            background: `linear-gradient(135deg, ${COLORS.blueDark}, ${COLORS.blueMain})`, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 900, color: '#fff', fontSize: 18, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(43, 84, 126, 0.2)'
          }}>
            {(data.firstName?.[0] || 'A') + (data.lastName?.[0] || 'B')}
          </div>
          <Input
            ai={aiUsed && !!data.profilePicture}
            value={data.profilePicture}
            onChange={e => onChange('profilePicture', e.target.value)}
            placeholder="URL de votre photo"
            style={{ flex: 1, borderRadius: 4 }}
          />
        </div>
      </Field>

      {/* Prénom / Nom */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Prénom" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.firstName} onChange={e => onChange('firstName', e.target.value)} placeholder="Ahmed" style={{ borderRadius: 4 }} />
        </Field>
        <Field label="Nom" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.lastName} onChange={e => onChange('lastName', e.target.value)} placeholder="Ben Ali" style={{ borderRadius: 4 }} />
        </Field>
      </div>

      <Field label="Email Universitaire" badge={{ type: 'req', label: 'requis' }}>
        <Input
          ai={aiUsed}
          value={data.email}
          onChange={e => onChange('email', e.target.value)}
          placeholder="etudiant@issatso.u-sousse.tn"
          type="email"
          style={{ borderRadius: 4, borderLeft: aiUsed ? `3px solid ${COLORS.blueMain}` : `2px solid ${COLORS.border}` }}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Téléphone" badge={{ type: 'opt', label: 'optionnel' }}>
          <Input ai={aiUsed} value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="+216 -- --- ---" type="tel" style={{ borderRadius: 4 }} />
        </Field>
        <Field label="Date de naissance" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.dateOfBirth} onChange={e => onChange('dateOfBirth', e.target.value)} type="date" style={{ borderRadius: 4 }} />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Ville" badge={{ type: 'req', label: 'requis' }}>
          <Input ai={aiUsed} value={data.city} onChange={e => onChange('city', e.target.value)} placeholder="Sousse" style={{ borderRadius: 4 }} />
        </Field>
        <Field label="Adresse" badge={{ type: 'opt', label: 'optionnel' }}>
          <Input ai={aiUsed} value={data.address} onChange={e => onChange('address', e.target.value)} placeholder="Quartier..." style={{ borderRadius: 4 }} />
        </Field>
      </div>

      <div style={{ height: 2, background: COLORS.border, margin: '2rem 0', opacity: 0.5 }} />
      
      <div style={{ 
        fontSize: 11, fontWeight: 900, textTransform: 'uppercase', 
        letterSpacing: '1.5px', color: COLORS.blueDark, marginBottom: 15,
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span style={{ width: 8, height: 8, background: COLORS.blueMain }}></span> 
        Sécurité du compte
      </div>

      <PasswordField value={data.password || ''} onChange={onChange} />

      <Field label="Confirmation" badge={{ type: 'req', label: 'requis' }}>
        <Input
          type="password"
          value={confirmPwd}
          onChange={e => setConfirmPwd(e.target.value)}
          placeholder="Ressaisir le mot de passe"
          style={{ 
            borderRadius: 4,
            borderColor: confirmPwd && !pwdMatch ? COLORS.error : COLORS.border 
          }}
        />
        {confirmPwd && !pwdMatch && (
          <div style={{ fontSize: 11, color: COLORS.error, marginTop: 5, fontWeight: 600 }}>Les mots de passe ne correspondent pas</div>
        )}
      </Field>
    </div>
  );
}