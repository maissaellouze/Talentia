import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Sidebar from '../components/companies/SideBar';

const API = 'http://127.0.0.1:8000/company';

export default function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('opportunities');
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
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex' }}>
      <Sidebar role="company" activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <main style={{ flex: 1, padding: '3.5rem', overflowY: 'auto', height: '100vh' }}>
          {activeTab === 'opportunities' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>Vos Opportunités</h2>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  style={{ background: '#0a0a12', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 9, cursor: 'pointer', fontWeight: 600 }}
                >
                  + Nouvelle Offre
                </button>
              </div>

              {loading ? <p>Chargement...</p> : opportunities.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px dashed #ccc' }}>
                   <p style={{ color: '#6b7280' }}>Aucune offre publiée pour le moment.</p>
                   <button onClick={() => setShowCreateModal(true)} style={{ color: '#0d9488', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Publier la première →</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {opportunities.map(opp => (
                    <div key={opp.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, margin: '0 0 5px 0' }}>{opp.title}</h3>
                        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{opp.location} • {opp.contract_type}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <button
                          onClick={() => navigate(`/company-dashboard/opportunities/${opp.id}/applications`)}
                          style={{
                            background: '#f0fdfa', color: '#0d9488', border: '1.5px solid #ccfbf1',
                            padding: '7px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                            fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                            transition: 'all 0.18s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#0d9488'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.color = '#0d9488'; }}
                        >
                          👥 {opp.applications_count || 0} candidature{opp.applications_count !== 1 ? 's' : ''}
                        </button>
                        <button onClick={() => setEditingOpportunity(opp)} style={{ background: '#f3f4f6', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                        <button onClick={() => handleDeleteOpportunity(opp.id)} style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: 12, cursor: 'pointer' }}>Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && profile && (
            <div style={{ maxWidth: 600 }}>
               <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: '2rem' }}>Profil de l'entreprise</h2>
               <div style={{ background: '#fff', padding: '2rem', borderRadius: 20, border: '1px solid #eee' }}>
                   <Field label="Nom">{profile.name}</Field>
                   <Field label="Email">{profile.email}</Field>
                   <Field label="Réseaux Sociaux">
                      <div style={{ display: 'flex', gap: 10 }}>
                        {profile.social_media?.linkedin && <a href={profile.social_media.linkedin} target="_blank" rel="noreferrer" style={{ color: '#0d9488' }}>LinkedIn</a>}
                        {profile.social_media?.facebook && <a href={profile.social_media.facebook} target="_blank" rel="noreferrer" style={{ color: '#0d9488' }}>Facebook</a>}
                        {!profile.social_media?.linkedin && !profile.social_media?.facebook && '--'}
                      </div>
                   </Field>
                   <Field label="Activité">{profile.activity}</Field>
                   <Field label="Secteur">{profile.sector}</Field>
                   <Field label="Ville">{profile.city}</Field>
                   <Field label="Description">{profile.description}</Field>
                   <button onClick={() => setShowProfileModal(true)} style={{ 
                    marginTop: '1rem', background: '#0a0a12', color: '#fff', border: 'none', padding: '8px 16px', 
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' 
                  }}>Modifier les informations</button>
               </div>
            </div>
           )}
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


function NavItem({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', padding: '12px 1rem', borderRadius: 14, border: 'none',
      background: active ? '#f0fdfa' : 'transparent',
      color: active ? '#0d9488' : '#6b7280',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      fontWeight: active ? 700 : 500, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center'
    }}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4, fontWeight: 600 }}>{label}</label>
      <div style={{ fontSize: 15, fontWeight: 500 }}>{children || '--'}</div>
    </div>
  );
}
