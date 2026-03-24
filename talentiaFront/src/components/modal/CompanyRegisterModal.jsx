import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import Field from '../ui/Field';
import Input from '../ui/Input';

const API = 'http://127.0.0.1:8000/auth';

export default function CompanyRegisterModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', industry: '', city: '', description: '', phone: ''
  });
  const [loginCreds, setLoginCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('username', loginCreds.email);
      fd.append('password', loginCreds.password);
      const res = await fetch('http://127.0.0.1:8000/auth/login', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Identifiants incorrects');

      if (data.role !== 'company') {
        throw new Error('Ce compte n\'est pas un compte entreprise.');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name || '');
      localStorage.setItem('companyId', String(data.company_id));

      // Navigate first, then close so CompanyDashboard reads localStorage correctly
      navigate('/company-dashboard');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
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
      setSuccess(true);
      setTimeout(() => onClose(), 3000);
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
        width: '100%', maxWidth: 500, maxHeight: '95vh', overflowY: 'auto', position: 'relative',
        padding: '2.5rem'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20, width: 32, height: 32,
          borderRadius: '50%', border: '1px solid #e5e5ec', background: '#fff',
          cursor: 'pointer', color: '#6b7280'
        }}>✕</button>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <Logo size={32} />
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Espace Entreprise</h2>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #eee' }}>
             <button 
               onClick={() => setIsLogin(false)}
               style={{ 
                 padding: '10px 0', flex: 1, background: 'none', border: 'none', borderBottom: !isLogin ? '3px solid #0d9488' : '3px solid transparent',
                 fontWeight: 600, color: !isLogin ? '#0a0a12' : '#9ca3af', cursor: 'pointer' 
               }}
             >Inscription</button>
             <button 
               onClick={() => setIsLogin(true)}
               style={{ 
                 padding: '10px 0', flex: 1, background: 'none', border: 'none', borderBottom: isLogin ? '3px solid #0d9488' : '3px solid transparent',
                 fontWeight: 600, color: isLogin ? '#0a0a12' : '#9ca3af', cursor: 'pointer' 
               }}
             >Connexion</button>
          </div>

          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>Demande envoyée !</h3>
              <p style={{ color: '#6b7280', fontSize: 14 }}>Votre demande est en attente de vérification.</p>
            </div>
          ) : isLogin ? (
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
            <form onSubmit={handleSubmitRequest}>
              <Field label="Nom de l'entreprise">
                <Input name="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="ex: TalentIA" required />
              </Field>
              <Field label="Email professionnel">
                <Input type="email" name="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@entreprise.com" required />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Secteur">
                  <Input name="industry" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} placeholder="Qualité, IT..." />
                </Field>
                <Field label="Ville">
                  <Input name="city" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Tunis..." />
                </Field>
              </div>
              {error && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: '1rem' }}>{error}</div>}
              <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Demander l\'accès →'}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
