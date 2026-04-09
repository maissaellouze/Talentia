import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import Sidebar from '../components/companies/SideBar';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{label}</label>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#1f2937' }}>{children || '--'}</div>
    </div>
  );
}

const API = 'http://127.0.0.1:8000/company';

export default function CompanyDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'opportunities';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const navigate = useNavigate();

  // Get company ID from localStorage set during login
  const companyId = localStorage.getItem('companyId');

  useEffect(() => {
    if (!companyId) {
      navigate('/');
      return;
    }
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      if (activeTab === 'profile') {
        const res = await fetch(`${API}/me?company_id=${companyId}`);
        if (res.ok) setProfile(await res.json());
      } else if (activeTab === 'opportunities') {
        const res = await fetch(`${API}/opportunities?company_id=${companyId}`);
        if (res.ok) {
          const data = await res.json();
          setOpportunities(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      contract_type: formData.get('contract_type'),
      experience_level: formData.get('experience_level') || "Junior",
      location: formData.get('location'),
      remote_work: formData.get('remote_work') === 'true',
      salary_min: parseFloat(formData.get('salary_min')) || null,
      salary_max: parseFloat(formData.get('salary_max')) || null,
      requirements: (formData.get('requirements') || "").split(',').map(s => s.trim()).filter(s => s).map(s => ({ 
        description: s, 
        is_mandatory: true,
        years_required: 0 
      })),
      benefits: (formData.get('benefits') || "").split(',').map(s => s.trim()).filter(s => s).map(s => ({ 
        benefit_type: s 
      }))
    };

    try {
      const res = await fetch(`${API}/opportunities?company_id=${companyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const handleUpdateOpportunity = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      contract_type: formData.get('contract_type'),
      experience_level: formData.get('experience_level'),
      location: formData.get('location'),
      remote_work: formData.get('remote_work') === 'true',
      salary_min: parseFloat(formData.get('salary_min')) || null,
      salary_max: parseFloat(formData.get('salary_max')) || null,
      requirements: (formData.get('requirements') || "").split(',').map(s => s.trim()).filter(s => s).map(s => ({ name: s, level: 'Required' })),
      benefits: (formData.get('benefits') || "").split(',').map(s => s.trim()).filter(s => s).map(s => ({ title: s }))
    };

    try {
      const res = await fetch(`${API}/opportunities/${editingOpportunity.id}?company_id=${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setEditingOpportunity(null);
        fetchData();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rawData = Object.fromEntries(formData.entries());
    
    // Bundle social media
    const social_media = {
      linkedin: rawData.linkedin || "",
      facebook: rawData.facebook || "",
      twitter: rawData.twitter || ""
    };
    
    const data = {
      ...rawData,
      social_media,
      employee_count: rawData.employee_count ? parseInt(rawData.employee_count) : null,
      creation_year: rawData.creation_year ? parseInt(rawData.creation_year) : null
    };

    try {
      const res = await fetch(`${API}/me?company_id=${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowProfileModal(false);
        fetchData();
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du profil");
    }
  };

  const handleDeleteOpportunity = async (oppId) => {
    if (!window.confirm("Supprimer cette offre ?")) return;
    try {
      const res = await fetch(`${API}/opportunities/${oppId}?company_id=${companyId}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte entreprise ?")) return;
    await fetch(`${API}/me?company_id=${companyId}`, { method: 'DELETE' });
    window.location.href = "/";
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', display: 'flex' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .dashboard-card:hover {
          border-color: #0d9488 !important;
          box-shadow: 0 10px 25px rgba(13,148,136, 0.08) !important;
          transform: translateY(-2px);
        }
      `}</style>

      <Sidebar role="company" activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <main style={{ flex: 1, padding: '32px 32px 64px', overflowY: 'auto', height: '100vh', position: 'relative' }}>
          
          {/* Background Decorators */}
          <div style={{
            position: 'absolute', top: -100, right: -50, width: 400, height: 400,
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,.05), transparent 70%)',
            pointerEvents: 'none', zIndex: 0
          }} />

          {/* Hero Banner for Company */}
          <div style={{
            borderRadius: 24,
            background: 'linear-gradient(135deg, #0f2027 0%, #0d4f47 50%, #1a6b5e 100%)',
            padding: '36px 44px',
            marginBottom: 32,
            position: 'relative',
            overflow: 'hidden',
            animation: 'fadeUp 0.5s ease both',
            zIndex: 1
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30, width: 150, height: 150,
              borderRadius: '50%', background: 'rgba(20,184,166,.15)', pointerEvents: 'none'
            }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12,
                  background: 'rgba(20,184,166,0.15)', border: '1px solid rgba(20,184,166,0.3)',
                  color: '#5eead4', fontSize: 10, fontWeight: 700,
                  padding: '5px 12px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  ✦ Dashboard Recruteur
                </div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Clash Display', sans-serif" }}>
                  Bienvenue, {profile?.name || 'Entreprise'}
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.6)', maxWidth: 400 }}>
                  Gérez vos offres d'emploi et découvrez les meilleurs talents pour votre équipe.
                </p>
              </div>
              
              {profile?.logo && (
                <img src={profile.logo} alt="Logo" style={{ width: 80, height: 80, borderRadius: 20, border: '3px solid rgba(255,255,255,0.1)', background: '#fff', objectFit: 'contain' }} />
              )}
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1, animation: 'fadeUp 0.5s 0.1s ease both' }}>
            {activeTab === 'opportunities' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#0f172a' }}>Vos Opportunités</h2>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Vous avez {opportunities.length} offre{opportunities.length > 1 ? 's' : ''} active{opportunities.length > 1 ? 's' : ''}</p>
                  </div>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    style={{ 
                      background: '#0d9488', color: '#fff', border: 'none', 
                      padding: '12px 24px', borderRadius: 12, cursor: 'pointer', 
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
                      boxShadow: '0 4px 12px rgba(13,148,136, 0.2)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  >
                    <span>+</span> Publier une offre
                  </button>
                </div>

                {loading ? (
                   <div style={{ display: 'grid', gap: 16 }}>
                      {[1,2,3].map(i => <div key={i} style={{ height: 100, background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', animation: 'pulse 1.5s infinite' }} />)}
                   </div>
                ) : opportunities.length === 0 ? (
                  <div style={{ padding: '5rem 2rem', textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #e2e8f0' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Prêt à recruter ?</h3>
                    <p style={{ color: '#64748b', maxWidth: 300, margin: '8px auto 24px', fontSize: 14 }}>Commencez par publier votre première offre de stage ou d'emploi.</p>
                    <button onClick={() => setShowCreateModal(true)} style={{ color: '#0d9488', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Créer une opportunité →</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '1.2rem' }}>
                    {opportunities.map((opp, idx) => (
                      <div 
                        key={opp.id} 
                        className="dashboard-card"
                        style={{ 
                          background: '#fff', padding: '1.5rem 2rem', borderRadius: 20, 
                          border: '1.5px solid #f1f5f9', display: 'flex', 
                          justifyContent: 'space-between', alignItems: 'center',
                          transition: 'all 0.2s ease',
                          animation: `fadeUp 0.4s ${0.2 + idx * 0.05}s ease both`
                        }}
                      >
                        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            {opp.contract_type === 'Internship' ? '🎓' : '💼'}
                          </div>
                          <div>
                            <h3 style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: 16, color: '#0f172a' }}>{opp.title}</h3>
                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#64748b', fontSize: 13 }}>
                               <span>📍 {opp.location}</span>
                               <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#cbd5e1' }} />
                               <span style={{ color: '#0d9488', fontWeight: 600 }}>{opp.contract_type}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{ textAlign: 'right', paddingRight: 16, borderRight: '1px solid #f1f5f9' }}>
                            <div style={{ color: '#0f172a', fontWeight: 800, fontSize: 18 }}>{opp.applications_count || 0}</div>
                            <div style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', fontWeight: 700 }}>Candidat{ (opp.applications_count || 0) > 1 ? 's' : ''}</div>
                          </div>
                          
                          <button 
                            onClick={() => navigate(`/company-dashboard/opportunities/${opp.id}/applications`)}
                            style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                          >Voir Candidatures →</button>

                          <div style={{ display: 'flex', gap: 6 }}>
                            <button 
                              onClick={() => setEditingOpportunity(opp)} 
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px', borderRadius: 8, cursor: 'pointer' }}
                              title="Modifier"
                            >✏️</button>
                            <button 
                              onClick={() => handleDeleteOpportunity(opp.id)} 
                              style={{ background: '#fff0f0', border: '1px solid #fee2e2', padding: '8px', color: '#ef4444', borderRadius: 8, cursor: 'pointer' }}
                              title="Supprimer"
                            >🗑️</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && profile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24 }}>
                <div style={{ background: '#fff', padding: '2.5rem', borderRadius: 24, border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Profil de l'entreprise</h2>
                      <button onClick={() => setShowProfileModal(true)} style={{ 
                        background: '#f8fafc', color: '#0d9488', border: '1px solid #ccfbf1', padding: '10px 18px', 
                        borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' 
                      }}>Modifier le profil</button>
                   </div>
                   
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'x 32px' }}>
                     <Field label="Nom">{profile.name}</Field>
                     <Field label="Raison Sociale">{profile.legal_name}</Field>
                     <Field label="Email professionnel">{profile.email}</Field>
                     <Field label="Téléphone">{profile.phone}</Field>
                     <Field label="Activité principal">{profile.activity}</Field>
                     <Field label="Secteur d'activité">{profile.sector}</Field>
                     <Field label="Ville">{profile.city}</Field>
                     <Field label="Siège social">{profile.address}</Field>
                     <Field label="Année de création">{profile.creation_year}</Field>
                     <Field label="Effectif">{profile.employee_count}</Field>
                   </div>
                   
                   <div style={{ marginTop: 20 }}>
                     <Field label="Description détaillée">
                        <p style={{ margin: 0, lineHeight: 1.6, color: '#4b5563' }}>{profile.description}</p>
                     </Field>
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 24, border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Réseaux Sociaux</h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {profile.social_media?.linkedin && (
                        <a href={profile.social_media.linkedin} target="_blank" rel="noreferrer" style={socialLinkStyle}>
                          <span style={{ background: '#f0fdfa', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔗</span>
                          LinkedIn
                        </a>
                      )}
                      {profile.social_media?.facebook && (
                        <a href={profile.social_media.facebook} target="_blank" rel="noreferrer" style={socialLinkStyle}>
                          <span style={{ background: '#f0fdfa', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📘</span>
                          Facebook
                        </a>
                      )}
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noreferrer" style={socialLinkStyle}>
                          <span style={{ background: '#f0fdfa', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🌐</span>
                          Site Web
                        </a>
                      )}
                      {(!profile.social_media?.linkedin && !profile.social_media?.facebook && !profile.website) && (
                        <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, fontStyle: 'italic' }}>Aucun lien configuré</p>
                      )}
                    </div>
                  </div>

                  <div style={{ background: '#fff0f0', padding: '1.5rem', borderRadius: 24, border: '1px solid #fee2e2' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Zone de danger</h3>
                    <p style={{ fontSize: 12, color: '#b91c1c', marginBottom: 16 }}>La suppression de votre compte est irréversible.</p>
                    <button onClick={handleDeleteAccount} style={{ color: '#dc2626', background: '#fff', border: '1px solid #fecaca', padding: '10px', width: '100%', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Supprimer le compte</button>
                  </div>
                </div>
              </div>
             )}
          </div>
        </main>

      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 24, width: '100%', maxWidth: 500, margin: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Nouvelle Opportunité</h2>
             <form onSubmit={handleCreateOpportunity}>
              <div style={{ display: 'grid', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', padding: 4 }}>
                <input name="title" placeholder="Titre du poste" required style={inputStyle} />
                <textarea name="description" placeholder="Description" required style={{ ...inputStyle, minHeight: 100 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <select name="contract_type" style={inputStyle}>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Internship">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  <input name="location" placeholder="Lieu (ex: Tunis)" style={inputStyle} />
                </div>
                <input name="requirements" placeholder="Qualités requises (séparées par des virgules)" style={inputStyle} />
                <input name="benefits" placeholder="Avantages (séparés par des virgules)" style={inputStyle} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <input name="salary_min" type="number" placeholder="Salaire Min" style={inputStyle} />
                   <input name="salary_max" type="number" placeholder="Salaire Max" style={inputStyle} />
                </div>
                <input name="experience_level" placeholder="Niveau d'expérience (ex: Junior, 2-3 ans)" style={inputStyle} />
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: 12 }}>
                <button type="submit" style={{ flex: 1, background: '#0d9488', color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Publier</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: '#f3f4f6', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 24, width: '100%', maxWidth: 600, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Modifier le Profil</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', padding: '4px' }}>
                <input name="name" defaultValue={profile.name} placeholder="Nom de l'entreprise" style={inputStyle} />
                <input name="legal_name" defaultValue={profile.legal_name} placeholder="Nom légal" style={inputStyle} />
                <input name="activity" defaultValue={profile.activity} placeholder="Activité" style={inputStyle} />
                <input name="sector" defaultValue={profile.sector} placeholder="Secteur" style={inputStyle} />
                <input name="city" defaultValue={profile.city} placeholder="Ville" style={inputStyle} />
                <input name="address" defaultValue={profile.address} placeholder="Adresse" style={inputStyle} />
                <input name="phone" defaultValue={profile.phone} placeholder="Téléphone" style={inputStyle} />
                <input name="website" defaultValue={profile.website} placeholder="Site Web" style={inputStyle} />
                <input name="employee_count" type="number" defaultValue={profile.employee_count} placeholder="Nombre d'employés" style={inputStyle} />
                <input name="creation_year" type="number" defaultValue={profile.creation_year} placeholder="Année de création" style={inputStyle} />
                <textarea name="description" defaultValue={profile.description} placeholder="Description" style={{ ...inputStyle, gridColumn: 'span 2', minHeight: 80 }} />
                <input name="linkedin" defaultValue={profile.social_media?.linkedin} placeholder="Lien LinkedIn" style={inputStyle} />
                <input name="facebook" defaultValue={profile.social_media?.facebook} placeholder="Lien Facebook" style={inputStyle} />
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: 12 }}>
                <button type="submit" style={{ flex: 1, background: '#0d9488', color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Enregistrer</button>
                <button type="button" onClick={() => setShowProfileModal(false)} style={{ flex: 1, background: '#f3f4f6', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {editingOpportunity && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 24, width: '100%', maxWidth: 500, margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Modifier l'Offre</h2>
              <button onClick={() => setEditingOpportunity(null)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUpdateOpportunity}>
              <div style={{ display: 'grid', gap: '1rem', maxHeight: '60vh', overflowY: 'auto', padding: 4 }}>
                <input name="title" defaultValue={editingOpportunity.title} placeholder="Titre du poste" required style={inputStyle} />
                <textarea name="description" defaultValue={editingOpportunity.description} placeholder="Description" required style={{ ...inputStyle, minHeight: 100 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <select name="contract_type" defaultValue={editingOpportunity.contract_type} style={inputStyle}>
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Internship">Stage</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                  <input name="location" defaultValue={editingOpportunity.location} placeholder="Lieu (ex: Tunis)" style={inputStyle} />
                </div>
                <input 
                  name="requirements" 
                  defaultValue={editingOpportunity.requirements?.map(r => r.name).join(', ')} 
                  placeholder="Qualités requises (séparées par des virgules)" 
                  style={inputStyle} 
                />
                <input 
                  name="benefits" 
                  defaultValue={editingOpportunity.benefits?.map(b => b.title).join(', ')} 
                  placeholder="Avantages (séparés par des virgules)" 
                  style={inputStyle} 
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <input name="salary_min" type="number" defaultValue={editingOpportunity.salary_min} placeholder="Salaire Min" style={inputStyle} />
                   <input name="salary_max" type="number" defaultValue={editingOpportunity.salary_max} placeholder="Salaire Max" style={inputStyle} />
                </div>
                <input name="experience_level" defaultValue={editingOpportunity.experience_level} placeholder="Niveau d'expérience" style={inputStyle} />
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: 12 }}>
                <button type="submit" style={{ flex: 1, background: '#0d9488', color: '#fff', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Enregistrer les modifications</button>
                <button type="button" onClick={() => setEditingOpportunity(null)} style={{ flex: 1, background: '#f3f4f6', border: 'none', padding: '12px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: 12, border: '1px solid #eee', fontSize: 14, outline: 'none'
};


const socialLinkStyle = {
  display: 'flex', alignItems: 'center', gap: 12, color: '#334155', 
  textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '4px 0',
  transition: 'color 0.2s',
};
