import React, { useState } from 'react';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Input from '../ui/Input';
import ProgressBar from './ProgressBar';

// Import des étapes
import StepCV         from './steps/StepCV';
import StepCompte     from './steps/StepCompte';
import StepProfil     from './steps/StepProfil';
import StepExperience from './steps/StepExperience';
import StepSkills     from './steps/StepSkills';
import StepPrefs      from './steps/StepPrefs';
import StepDone       from './steps/StepDone';
import StepOTP        from './steps/Stepotp';
import { useNavigate } from 'react-router-dom';
const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/auth';

const TOTAL  = 8;
const TITLES = [
  'Déposez votre CV', 
  'Créez votre compte', 
  'Profil académique', 
  'Expériences', 
  'Compétences & langues', 
  'Préférences', 
  'Vérification', 
  'Félicitations !'
];
const SUBS   = [
  "L'IA extrait vos informations en quelques secondes", 
  'Inscription gratuite — Étudiant', 
  'Dites-nous en plus sur votre parcours', 
  'Vos stages et projets comptent', 
  'Valorisez votre savoir-faire', 
  'Personnalisez vos alertes', 
  'Saisissez le code envoyé par email', 
  ''
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', city: '', address: '', profilePicture: '',
  password: '',
  niveau: 'Master 2', filiere: 'Informatique',
  universite: "ESPRIT — École Supérieure Privée d'Ingénierie",
};

export default function Modal({ mode, onClose }) {
  const [step,        setStep]        = useState(mode === 'login' ? -1 : 0);
  const [aiUsed,      setAiUsed]      = useState(false);
  const [formData,    setFormData]    = useState(EMPTY_FORM);
  const [cvFile,      setCvFile]      = useState(null);
  const [aiData,      setAiData]      = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [skills,      setSkills]      = useState([]);
  const [languages,   setLanguages]   = useState([]);
  const [prefs,       setPrefs]       = useState({ notifs: { offres: true, hebdo: true, recrut: true }, availability: 'Immédiate', sectors: ['FinTech','SaaS / Cloud','IA / Data'] });
  
  const [submitting,  setSubmitting]  = useState(false);
  const [submitErr,   setSubmitErr]   = useState(null);
  const [otpError,    setOtpError]    = useState(null);
  
  const [loginErr,    setLoginErr]    = useState(null);
  const [loginCreds,  setLoginCreds]  = useState({ email: '', password: '' });
  const navigate = useNavigate();
  function update(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  // --- LOGIQUE DE NAVIGATION ---
  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  // --- ANALYSE CV ---
  function handleAnalyze(parsed, file) {
    setCvFile(file);
    setAiData(parsed);
    setAiUsed(true);
    setExperiences(parsed.experiences || []);
    setSkills(parsed.skills || []);
    setLanguages(parsed.languages || []);
    setFormData(prev => ({
      ...prev,
      ...parsed, // Mappe les champs correspondants
      niveau: parsed.degree_level || prev.niveau,
      filiere: parsed.field_of_study || prev.filiere,
      universite: parsed.university || prev.universite,
    }));
    setStep(1);
  }

  // --- ÉTAPE 5 : ENVOI OTP ---
  async function handleSendOTP() {
    setSubmitErr(null);
    if (!formData.password || formData.password.length < 8) {
      setSubmitErr('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!formData.email) { setSubmitErr('Email requis.'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('email', formData.email);
      const res = await fetch(`${API}/send-otp`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Erreur lors de l'envoi de l'OTP");
      }
      setStep(6); // Direction StepOTP
    } catch (e) {
      setSubmitErr(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  // --- ÉTAPE 6 : VÉRIFICATION & INSCRIPTION FINALE ---
  async function handleVerifyAndRegister(otpCode) {
    setOtpError(null);
    setSubmitting(true);
    try {
      // 1. Vérification du code
      const fdOtp = new FormData();
      fdOtp.append('email', formData.email);
      fdOtp.append('code',  otpCode);
      const otpRes = await fetch(`${API}/verify-otp`, { method: 'POST', body: fdOtp });
      
      if (!otpRes.ok) {
        const err = await otpRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Code OTP incorrect');
      }

      // 2. Finalisation (Appel API Register)
      await handleFinalize(otpCode);
    } catch (e) {
      setOtpError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

 async function handleFinalize(otpCode) {
    const endpoint = cvFile ? 'register/student/auto' : 'register/student/manual';
    const fd = new FormData();

    // 1. Common Data
    fd.append('password', formData.password);

    if (cvFile) {
      // --- PATH: AUTO ---
      fd.append('file', cvFile);
      
      // Construct overrides to match Backend variable names
      const overrides = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        university: formData.universite,
        field_of_study: formData.filiere,
        degree_level: formData.niveau,
        skills: skills,
        experiences: experiences,
        languages: languages,
        soft_skills: [] 
      };
      
      fd.append('overrides', JSON.stringify(overrides));
      
      // MUST append prefs separately for register_student_auto
      fd.append('prefs', JSON.stringify({ ...prefs, otp_code: otpCode }));

    } else {
      // --- PATH: MANUAL ---
      fd.append('email', formData.email);
      fd.append('first_name', formData.firstName);
      fd.append('last_name', formData.lastName);
      fd.append('university', formData.universite);
      fd.append('field_of_study', formData.filiere);
      fd.append('degree_level', formData.niveau);
      fd.append('phone', formData.phone);
      
      // JSON strings for the manual lists
      fd.append('skills', JSON.stringify(skills));
      fd.append('experiences', JSON.stringify(experiences));
      fd.append('languages', JSON.stringify(languages));
      fd.append('soft_skills', JSON.stringify([]));
      
      fd.append('prefs', JSON.stringify({ ...prefs, otp_code: otpCode }));
    }

    try {
      const res = await fetch(`${API}/${endpoint}`, { 
        method: 'POST', 
        body: fd 
        // Note: Do NOT set Content-Type header manually when sending FormData
      });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Erreur lors de l'inscription.");
      }
      
      setStep(7); // Success
      setTimeout(() => {
    onClose();
    navigate('/home');
}, 3000); // Redirect after 3 seconds so they can see the success message
    } catch (e) {
      setOtpError(e.message);
    }
}

  // --- LOGIN ---
 // --- LOGIN ---
async function handleLogin() {
  setLoginErr(null);
  try {
    const fd = new FormData();
    fd.append('username', loginCreds.email);
    fd.append('password', loginCreds.password);

    const res = await fetch(`${API}/login`, { method: 'POST', body: fd });
    
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Identifiants incorrects');
    }

    const { access_token } = await res.json();
    
    // 1. Save the token
    localStorage.setItem('token', access_token);
    
    // 2. Close the modal
    onClose();
    
    // 3. Redirect to the home page
    navigate('/home'); 

  } catch (e) { 
    setLoginErr(e.message); 
  }
}

  const totalMois = Math.round(experiences.reduce((acc, exp) => {
    if (!exp.start_date) return acc;
    const start = new Date(exp.start_date);
    const end   = exp.end_date ? new Date(exp.end_date) : new Date();
    return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
  }, 0));

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,18,.55)', backdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,.1)', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        
        {/* Bouton Fermer */}
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e5ec', background: '#fff', cursor: 'pointer', zIndex: 10 }}>✕</button>

        <div style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '2rem' }}>
            <Logo size={28} />
            <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 18, fontWeight: 700 }}>
              Talent<span style={{ color: '#0d9488' }}>IA</span>
            </span>
          </div>

          {step >= 0 && <ProgressBar step={step} total={TOTAL} />}

          {/* ─── LOGIN (Step -1) ─── */}
          {step === -1 && (
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Bon retour 👋</h2>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.8rem' }}>Accédez à votre tableau de bord</p>
              <Field label="Email"><Input value={loginCreds.email} onChange={e => setLoginCreds(p => ({ ...p, email: e.target.value }))} /></Field>
              <Field label="Mot de passe"><Input type="password" value={loginCreds.password} onChange={e => setLoginCreds(p => ({ ...p, password: e.target.value }))} /></Field>
              {loginErr && <div style={{ color: 'red', fontSize: 12, marginBottom: 8 }}>{loginErr}</div>}
              <Button onClick={handleLogin}>Se connecter →</Button>
              <Button variant="ghost" onClick={() => setStep(0)}>Créer un compte</Button>
            </div>
          )}

          {/* ─── STEPS D'INSCRIPTION ─── */}
          {step >= 0 && (
            <div>
              {step < 7 && (
                <>
                  <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{TITLES[step]}</h2>
                  <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.8rem' }}>{SUBS[step]}</p>
                </>
              )}

              {/* Rendu dynamique des étapes */}
              {step === 0 && <StepCV onAnalyze={handleAnalyze} onSkip={() => setStep(1)} />}
              {step === 1 && <StepCompte data={formData} onChange={update} aiUsed={aiUsed} />}
              {step === 2 && <StepProfil data={formData} onChange={update} totalMois={totalMois} />}
              {step === 3 && <StepExperience experiences={experiences} onChange={setExperiences} />}
              {step === 4 && (
                <StepSkills
                  skills={skills.map(s => s.name || s)}
                  langues={languages.map(l => ({ nom: l.name, niveau: l.level }))}
                  onSkillsChange={setSkills}
                  onLanguagesChange={setLanguages}
                />
              )}
              {step === 5 && <StepPrefs onChange={setPrefs} />}
              {step === 6 && <StepOTP email={formData.email} onVerify={handleVerifyAndRegister} error={otpError} loading={submitting} />}
              {step === 7 && <StepDone data={formData} onClose={onClose} />}

              {/* Barre d'action basse (sauf Step 0, 6 et 7) */}
              {step >= 1 && step <= 5 && (
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10 }}>
                  <Button variant="ghost" onClick={prev} style={{ flex: 1 }}>Retour</Button>
                  <Button 
                    onClick={step === 5 ? handleSendOTP : next} 
                    disabled={submitting} 
                    style={{ flex: 2 }}
                  >
                    {step === 5 ? (submitting ? 'Envoi...' : 'Vérifier mon email') : 'Continuer →'}
                  </Button>
                </div>
              )}

              {submitErr && <div style={{ color: 'red', marginTop: 10, fontSize: 12 }}>{submitErr}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}