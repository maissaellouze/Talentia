import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import CompanyProgressBar from './steps_company/CompanyProgressBar';

// Import Company Steps
import StepCompanyExtraction from './steps_company/StepCompanyExtraction';
import StepCompanyBasics from './steps_company/StepCompanyBasics';
import StepCompanyDetails from './steps_company/StepCompanyDetails';
import StepCompanyLocation from './steps_company/StepCompanyLocation';
import StepCompanySocial from './steps_company/StepCompanySocial';
import CompanyStepDone from './steps_company/CompanyStepDone';
import Field from '../ui/Field';
import Input from '../ui/Input';

const API = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/auth';

const TOTAL = 6;
const TITLES = [
  "Extraction d'informations",
  "Informations générales",
  "Détails de l'entreprise",
  "Localisation & Description",
  "Présence en ligne",
  "Félicitations !"
];
const SUBS = [
  "L'IA extrait vos données depuis un PDF ou votre site web",
  "Vérifiez l'identité de votre entreprise",
  "Dites-nous en plus sur votre activité",
  "Où vous trouver et que faites-vous ?",
  "Vos liens et vos domaines d'expertise",
  ""
];

export default function CompanyRegisterModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState(0); 
  const [formData, setFormData] = useState({
    name: '', email: '', rne_id: '', legal_name: '', website: '', phone: '',
    sector: '', activity: '', naf_code: '', legal_form: '', creation_year: '', employee_count: '',
    address: '', city: '', code_postal: '', description: '',
    main_domain: '', secondary_domains: [], technologies: [],
    social_media: { linkedin: '', twitter: '' }
  });
  
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('username', loginCreds.email);
      fd.append('password', loginCreds.password);
      const res = await fetch(`${API}/login`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Identifiants incorrects');

      if (data.role !== 'company') throw new Error("Ce compte n'est pas un compte entreprise.");

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('companyId', String(data.company_id));

      navigate('/company-dashboard');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (extractedData) => {
    setFormData(prev => ({ ...prev, ...extractedData }));
    setStep(1);
  };

  const next = () => setStep(s => Math.min(s + 1, TOTAL - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API}/register/company/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Une erreur est survenue");
      setStep(5); // Success step
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(10,10,18,.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        padding: '2.5rem'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 32, height: 32,
          borderRadius: '50%', border: '1px solid #e5e5ec', background: '#fff',
          cursor: 'pointer', color: '#6b7280', zIndex: 10
        }}>✕</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '2rem' }}>
          <Logo size={32} />
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Espace Entreprise</h2>
        </div>

        {step < 5 && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
            <button 
              onClick={() => setIsLogin(false)}
              style={{ 
                padding: '10px 0', flex: 1, background: 'none', border: 'none', 
                borderBottom: !isLogin ? '3px solid #0d9488' : '3px solid transparent',
                fontWeight: 600, color: !isLogin ? '#0a0a12' : '#9ca3af', cursor: 'pointer' 
              }}
            >Inscription</button>
            <button 
              onClick={() => setIsLogin(true)}
              style={{ 
                padding: '10px 0', flex: 1, background: 'none', border: 'none', 
                borderBottom: isLogin ? '3px solid #0d9488' : '3px solid transparent',
                fontWeight: 600, color: isLogin ? '#0a0a12' : '#9ca3af', cursor: 'pointer' 
              }}
            >Connexion</button>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <Field label="Email professionnel">
              <Input type="email" value={loginCreds.email} onChange={e => setLoginCreds({...loginCreds, email: e.target.value})} placeholder="email@entreprise.com" required />
            </Field>
            <Field label="Mot de passe">
              <Input type="password" value={loginCreds.password} onChange={e => setLoginCreds({...loginCreds, password: e.target.value})} placeholder="••••••••" required />
            </Field>
            {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: '1rem' }}>{error}</div>}
            <Button type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</Button>
          </form>
        ) : (
          <div>
            {step < 5 && (
              <>
                <CompanyProgressBar step={step} total={TOTAL} />
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{TITLES[step]}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.5rem' }}>{SUBS[step]}</p>
              </>
            )}

            {step === 0 && <StepCompanyExtraction onAnalyze={handleAnalyze} onSkip={() => setStep(1)} />}
            {step === 1 && <StepCompanyBasics data={formData} onChange={update} />}
            {step === 2 && <StepCompanyDetails data={formData} onChange={update} />}
            {step === 3 && <StepCompanyLocation data={formData} onChange={update} />}
            {step === 4 && <StepCompanySocial data={formData} onChange={update} />}
            {step === 5 && <CompanyStepDone data={formData} onClose={onClose} />}

            {step > 0 && step < 5 && (
              <div style={{ marginTop: '2rem', display: 'flex', gap: 12 }}>
                <Button variant="ghost" onClick={prev} style={{ width: '100px' }}>Retour</Button>
                <Button 
                  onClick={step === 4 ? handleSubmit : next} 
                  disabled={loading}
                >
                  {loading ? 'Traitement...' : step === 4 ? 'Envoyer la demande →' : 'Continuer →'}
                </Button>
              </div>
            )}
            {error && <div style={{ color: '#ef4444', fontSize: 13, marginTop: '1rem' }}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
