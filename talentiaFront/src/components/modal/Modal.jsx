import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import IssatsoLogo from '../ui/Logo';

// Import des étapes
import StepCV         from './steps/StepCV';
import StepCompte     from './steps/StepCompte';
import StepProfil     from './steps/StepProfil';
import StepExperience from './steps/StepExperience';
import StepSkills     from './steps/StepSkills';
import StepPrefs      from './steps/StepPrefs';
import StepDone       from './steps/StepDone';
import StepOTP        from './steps/Stepotp';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/auth';

// --- CONFIGURATION ET DESIGN ---
const COLORS = {
  blueMain: '#4682B4',
  blueDark: '#1E3A5F',
  grayPixel: '#64748B',
  border: '#E2E8F0',
  bgInput: '#F8FAFC',
  gradient: 'linear-gradient(135deg, #1E3A5F 0%, #4682B4 100%)',
};

const TOTAL  = 8;
const TITLES = [
  'Déposez votre CV', 
  'Identifiants de connexion', 
  'Parcours Académique', 
  'Expériences Professionnelles', 
  'Compétences & Langues', 
  'Préférences de carrière', 
  'Vérification du compte', 
  'Prêt pour l\'aventure !'
];

const SUBS = [
  "L'IA analyse votre profil instantanément",
  "Créez vos accès pour l'espace ISSAT",
  "Détaillez votre formation à l'institut",
  "Stages, alternances et projets",
  "Valorisez votre expertise technique",
  "Ciblez les opportunités qui vous correspondent",
  "Un code a été envoyé à votre adresse email",
  "Votre profil est désormais visible par les recruteurs"
];

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  dateOfBirth: '', city: '', address: '', profilePicture: '',
  password: '',
  niveau: 'Ingénierie', filiere: '', universite: "ISSAT Sousse",
};

export default function Modal({ mode, onClose }) {
  const navigate = useNavigate();
  
  // --- ÉTATS ---
  const [step, setStep] = useState(mode === 'login' ? -1 : 0);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [cvFile, setCvFile] = useState(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [prefs, setPrefs] = useState({ 
    notifs: { offres: true, hebdo: true, recrut: true }, 
    availability: 'Immédiate', 
    sectors: ['Ingénierie', 'IA', 'Software'] 
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [loginErr, setLoginErr] = useState(null);
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  // --- LOGIQUE ---
  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  function handleAnalyze(parsed, file) {
    setCvFile(file);
    setAiUsed(true);
    setExperiences(parsed.work_experience || parsed.experiences || []);
    setSkills(parsed.skills || []);
    setLanguages(parsed.languages || parsed.langues || []);
    setFormData(prev => ({ 
      ...prev, 
      firstName: parsed.first_name || parsed.firstName || prev.firstName,
      lastName: parsed.last_name || parsed.lastName || prev.lastName,
      email: parsed.email || prev.email,
      phone: parsed.phone || prev.phone,
    }));
    setStep(1);
  }

  // --- ÉTAPE 5 : ENVOI OTP ---
  async function handleSendOTP() {
    setSubmitErr(null);
    if (!formData.password || formData.password.length < 8) {
      setSubmitErr('Sécurité : 8 caractères minimum pour le mot de passe.');
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
      });
      
      if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Erreur lors de l'inscription.");
      }
      
      setStep(7); // Success
      setTimeout(() => {
        onClose();
        navigate('/opportunities');
      }, 3000); 
    } catch (e) {
      setOtpError(e.message);
    }
  }

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setLoginErr(null);
    setLoginLoading(true);
    try {
      const fd = new FormData();
      fd.append('username', loginCreds.email.trim());
      fd.append('password', loginCreds.password);
      const res = await fetch(`${API}/login`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Email ou mot de passe incorrect');
      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      if (data.company_id) localStorage.setItem('companyId', String(data.company_id));
      if (data.student_id) localStorage.setItem('studentId', String(data.student_id));
      onClose();
      if (data.role === 'company') navigate('/company-dashboard');
      else navigate('/opportunities');
    } catch (e) {
      setLoginErr(e.message);
    } finally {
      setLoginLoading(false);
    }
  }

  const totalMois = Math.round(experiences.reduce((acc, exp) => {
    if (!exp.start_date) return acc;
    const start = new Date(exp.start_date);
    const end = exp.end_date ? new Date(exp.end_date) : new Date();
    return acc + Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
  }, 0));

  // --- RENDU ---
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ 
        position: 'fixed', inset: 0, zIndex: 200, 
        background: 'rgba(15, 23, 42, 0.75)', 
        backdropFilter: 'blur(12px)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', padding: '1rem' 
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-content::-webkit-scrollbar { width: 6px; }
        .modal-content::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        input:focus { border-color: ${COLORS.blueMain} !important; background: #fff !important; box-shadow: 0 0 0 4px rgba(70, 130, 180, 0.15); outline: none; }
      `}</style>

      <div className="modal-content" style={{ 
        background: '#fff', borderRadius: 24, 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
        width: '100%', maxWidth: 560, maxHeight: '92vh', 
        overflowY: 'auto', position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        
        <div style={{ height: 6, background: COLORS.gradient, width: '100%', position: 'sticky', top: 0, zIndex: 10 }} />

        <button onClick={onClose} style={{ 
          position: 'absolute', top: 20, right: 20, width: 36, height: 36, 
          background: COLORS.bgInput, border: 'none', borderRadius: '50%', 
          cursor: 'pointer', color: COLORS.blueDark, fontWeight: 'bold', zIndex: 11
        }}>✕</button>

        <div style={{ padding: '3rem 2.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <IssatsoLogo size={70} />
            <h1 style={{ fontSize: 22, fontWeight: 900, color: COLORS.blueDark, marginTop: 15, letterSpacing: '-0.5px' }}>
              ISSAT <span style={{ color: COLORS.blueMain }}>TALENT</span>
            </h1>
            <div style={{ width: 40, height: 4, background: COLORS.blueMain, margin: '10px auto', borderRadius: 2 }} />
          </div>

          {step >= 0 && <ProgressBar step={step} total={TOTAL} />}

          <div style={{ animation: step === -1 ? 'fadeIn 0.5s ease' : 'slideUp 0.4s ease' }}>
            {step === -1 ? (
              <form onSubmit={handleLogin}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.blueDark, marginBottom: 8, textAlign: 'center' }}>Connexion</h2>
                <p style={{ fontSize: 15, color: COLORS.grayPixel, marginBottom: '2rem', textAlign: 'center' }}>Accédez à votre espace carrière</p>
                
                <div style={{ marginBottom: 15 }}>
                  <label style={labelStyle}>Email Universitaire</label>
                  <input type="email" value={loginCreds.email} onChange={e => setLoginCreds(p => ({ ...p, email: e.target.value }))} style={inputStyle} placeholder="nom.prenom@issatso.u-sousse.tn" required />
                </div>

                <div style={{ marginBottom: 25 }}>
                  <label style={labelStyle}>Mot de passe</label>
                  <input type="password" value={loginCreds.password} onChange={e => setLoginCreds(p => ({ ...p, password: e.target.value }))} style={inputStyle} placeholder="••••••••" required />
                </div>

                {loginErr && <div style={errorBannerStyle}>{loginErr}</div>}
                
                <button type="submit" disabled={loginLoading} style={primaryBtnStyle}>
                  {loginLoading ? 'Vérification...' : 'Se connecter'}
                </button>
                
                <button type="button" onClick={() => setStep(0)} style={{ width: '100%', marginTop: 20, background: 'none', border: 'none', color: COLORS.blueMain, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  Pas encore de compte ? S'inscrire →
                </button>
              </form>
            ) : (
              <div>
                {step < 7 && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: COLORS.blueDark, marginBottom: 6 }}>{TITLES[step]}</h2>
                    <p style={{ fontSize: 15, color: COLORS.grayPixel }}>{SUBS[step]}</p>
                  </div>
                )}

                <div style={{ minHeight: '300px' }}>
                  {step === 0 && <StepCV onAnalyze={handleAnalyze} onSkip={() => setStep(1)} />}
                  {step === 1 && <StepCompte data={formData} onChange={update} aiUsed={aiUsed} />}
                  {step === 2 && <StepProfil data={formData} onChange={update} totalMois={totalMois} />}
                  {step === 3 && <StepExperience experiences={experiences} onChange={setExperiences} />}
                  {step === 4 && <StepSkills skills={skills.map(s => s.name || s)} langues={languages} onSkillsChange={setSkills} onLanguagesChange={setLanguages} />}
                  {step === 5 && <StepPrefs data={prefs} onChange={(key, val) => setPrefs(p => ({ ...p, [key]: val }))} />}
                  {step === 6 && <StepOTP email={formData.email} onVerify={handleVerifyAndRegister} error={otpError} loading={submitting} />}
                  {step === 7 && <StepDone data={formData} onClose={onClose} />}
                </div>

                {step >= 1 && step <= 5 && (
                  <div style={{ marginTop: '3rem', display: 'flex', gap: 12, borderTop: `1px solid ${COLORS.border}`, paddingTop: '1.5rem' }}>
                    <button onClick={prev} style={secondaryBtnStyle}>Retour</button>
                    <button onClick={step === 5 ? handleSendOTP : next} disabled={submitting} style={{ ...primaryBtnStyle, flex: 2, marginTop: 0 }}>
                      {step === 5 ? (submitting ? 'Traitement...' : 'Vérifier mon email') : 'Continuer →'}
                    </button>
                  </div>
                )}
                {submitErr && <div style={{ ...errorBannerStyle, marginTop: 15 }}>{submitErr}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles réutilisables
const inputStyle = { width: '100%', padding: '14px 16px', border: `1px solid ${COLORS.border}`, borderRadius: '12px', fontSize: '15px', backgroundColor: COLORS.bgInput, transition: 'all 0.2s' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '700', color: COLORS.blueDark, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const primaryBtnStyle = { width: '100%', height: '56px', background: COLORS.gradient, color: '#fff', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 15px -3px rgba(43, 84, 126, 0.3)' };
const secondaryBtnStyle = { flex: 1, height: '56px', background: '#f1f5f9', color: COLORS.grayPixel, border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: '0.3s' };
const errorBannerStyle = { color: '#e11d48', fontSize: '13px', fontWeight: '600', padding: '12px', background: '#FFF1F2', borderRadius: '10px', textAlign: 'center', border: '1px solid #FECDD3' };