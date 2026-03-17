import React, { useState } from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Input from '../ui/Input';
import ProgressBar from './ProgressBar';
import StepCV      from './steps/StepCV';
import StepCompte  from './steps/StepCompte';
import StepProfil  from './steps/StepProfil';
import StepSkills  from './steps/StepSkills';
import StepPrefs   from './steps/StepPrefs';
import StepDone    from './steps/StepDone';
import { CV_DATA } from '../../data/cvData';
import { calcExpMois } from '../../utils/experience';

const TOTAL  = 6;
const TITLES = ['Déposez votre CV', 'Créez votre compte', 'Profil académique', 'Compétences & langues', 'Préférences', ''];
const SUBS   = ["L'IA extrait vos informations en quelques secondes", 'Inscription gratuite — Étudiant', '', '', '', ''];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', city: '', address: '', profilePicture: '',
  niveau: 'Master 2', filiere: 'Informatique',
  universite: "ESPRIT — École Supérieure Privée d'Ingénierie",
};

export default function Modal({ mode, onClose }) {
  const [step,     setStep]     = useState(mode === 'login' ? -1 : 0);
  const [aiUsed,   setAiUsed]   = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const totalMois = calcExpMois(CV_DATA.experiences);

  function update(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  function handleAnalyze() {
    setAiUsed(true);
    setFormData({
      firstName:      CV_DATA.firstName,
      lastName:       CV_DATA.lastName,
      email:          CV_DATA.email,
      phone:          CV_DATA.phone,
      dateOfBirth:    CV_DATA.dateOfBirth,
      city:           CV_DATA.city,
      address:        CV_DATA.address,
      profilePicture: CV_DATA.profilePicture,
      niveau:         CV_DATA.niveau,
      filiere:        CV_DATA.filiere,
      universite:     CV_DATA.universite,
    });
    setStep(1);
  }

  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,18,.55)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,.1),0 8px 24px rgba(0,0,0,.06)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative', scrollbarWidth: 'none' }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e5ec', background: '#fff', cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>✕</button>

        <div style={{ padding: '2.5rem' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '2rem' }}>
            <Logo size={28} />
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 18, fontWeight: 700, color: '#0a0a12' }}>
              Talent<span style={{ color: '#0d9488' }}>IA</span>
            </span>
          </div>

          {/* Progress bar — hidden on login */}
          {step >= 0 && <ProgressBar step={step} total={TOTAL} />}

          {/* ─── LOGIN ─── */}
          {step === -1 && (
            <div>
              <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 24, fontWeight: 700, color: '#0a0a12', marginBottom: 6 }}>Bon retour 👋</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.8rem' }}>Accédez à votre tableau de bord</p>
              <Field label="Email" badge={{ type: 'req', label: 'requis' }}>
                <Input type="email" placeholder="ahmed@etudiant.tn" />
              </Field>
              <Field label="Mot de passe" badge={{ type: 'req', label: 'requis' }}>
                <Input type="password" placeholder="••••••••" />
              </Field>
              <div style={{ textAlign: 'right', marginBottom: 6 }}>
                <a href="#" style={{ fontSize: 12, color: '#0d9488', textDecoration: 'none' }}>Mot de passe oublié ?</a>
              </div>
              <Button style={{ marginTop: '1.5rem' }}>Se connecter →</Button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6b7280', margin: '12px 0' }}>
                <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} />
                pas encore de compte ?
                <div style={{ flex: 1, height: 1, background: '#e5e5ec' }} />
              </div>
              <Button variant="ghost" onClick={() => setStep(0)}>Créer un compte gratuit</Button>
            </div>
          )}

          {/* ─── STEPS ─── */}
          {step >= 0 && (
            <div>
              {step < 5 && (
                <>
                  <h2 style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 24, fontWeight: 700, color: '#0a0a12', marginBottom: 6 }}>
                    {TITLES[step]}
                  </h2>
                  {SUBS[step] && (
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.8rem' }}>{SUBS[step]}</p>
                  )}
                </>
              )}

              {step === 0 && <StepCV onAnalyze={handleAnalyze} onSkip={() => setStep(1)} />}
              {step === 1 && <StepCompte data={formData} onChange={update} aiUsed={aiUsed} />}
              {step === 2 && <StepProfil data={formData} onChange={update} totalMois={totalMois} />}
              {step === 3 && <StepSkills skills={CV_DATA.skills} skillLevels={CV_DATA.skillLevels} langues={CV_DATA.langues} />}
              {step === 4 && <StepPrefs />}
              {step === 5 && <StepDone data={formData} onClose={onClose} />}

              {step >= 1 && step < 5 && (
                <Button style={{ marginTop: '1.5rem' }} onClick={next}>
                  {step === 4 ? 'Finaliser mon inscription →' : 'Continuer →'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
