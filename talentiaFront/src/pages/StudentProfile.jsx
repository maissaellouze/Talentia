import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';

// ─── COULEURS ISSAT ───────────────────────────────────────────────────────────
const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

const API = 'http://127.0.0.1:8000/student';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch data
  useEffect(() => {
    // Ideally from context/localStorage. Hardcoding 1 for dev.
    const studentId = localStorage.getItem('studentId') || 1;
    fetch(`${API}/me?student_id=${studentId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (listName, index, field, value) => {
    setProfile(prev => {
      const newList = [...(prev[listName] || [])];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listName]: newList };
    });
  };

  const addItem = (listName) => {
    setProfile(prev => ({
      ...prev,
      [listName]: [...(prev[listName] || []), { name: '', level: 'Débutant' }]
    }));
  };

  const removeItem = (listName, index) => {
    setProfile(prev => {
      const newList = [...(prev[listName] || [])];
      newList.splice(index, 1);
      return { ...prev, [listName]: newList };
    });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer votre compte définitivement ?")) return;
    const studentId = localStorage.getItem('studentId') || 1;
    try {
      await fetch(`${API}/me?student_id=${studentId}`, { method: 'DELETE' });
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    
    const studentId = localStorage.getItem('studentId') || 1;
    try {
      const res = await fetch(`${API}/me?student_id=${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      setMessage('Profil mis à jour avec succès !');
    } catch(err) {
      setMessage('Erreur: ' + err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>Chargement du profil...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0a0a12', marginBottom: 24, fontFamily: "'Clash Display', sans-serif" }}>
          Mon Profil
        </h1>
        
        {message && (
          <div style={{ 
            background: message.includes('Erreur') ? '#fee2e2' : '#f0fdf4', 
            color: message.includes('Erreur') ? '#ef4444' : '#16a34a', 
            padding: '12px 20px', borderRadius: 12, marginBottom: 24, fontWeight: 600, border: `1px solid ${message.includes('Erreur') ? '#fca5a5' : '#bbf7d0'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave} style={{ background: '#fff', padding: 32, borderRadius: 24, border: '1px solid #eee', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937' }}>Informations de base</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Prénom</label>
              <input style={inputStyle} name="first_name" value={profile?.first_name || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Nom</label>
              <input style={inputStyle} name="last_name" value={profile?.last_name || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} name="email" value={profile?.email || ''} onChange={handleChange} type="email" />
            </div>
            <div>
              <label style={labelStyle}>Téléphone</label>
              <input style={inputStyle} name="phone" value={profile?.phone || ''} onChange={handleChange} />
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937' }}>Scolarité</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Université / École</label>
              <input style={inputStyle} name="university" value={profile?.university || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Filière</label>
              <input style={inputStyle} name="field_of_study" value={profile?.field_of_study || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Niveau d'étude</label>
              <input style={inputStyle} name="degree_level" value={profile?.degree_level || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>Année de diplôme</label>
              <input style={inputStyle} name="graduation_year" type="number" value={profile?.graduation_year || ''} onChange={handleChange} />
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937' }}>Complémentaire</h2>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Biographie (Bio)</label>
            <textarea style={{ ...inputStyle, minHeight: 100 }} name="bio" value={profile?.bio || ''} onChange={handleChange} placeholder="Décrivez-vous brièvement..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            <div>
              <label style={labelStyle}>LinkedIn (URL)</label>
              <input style={inputStyle} name="linkedin" value={profile?.linkedin || ''} onChange={handleChange} />
            </div>
            <div>
              <label style={labelStyle}>GitHub (URL)</label>
              <input style={inputStyle} name="github" value={profile?.github || ''} onChange={handleChange} />
            </div>
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937', marginTop: 30 }}>Compétences Techniques</h2>
          {profile?.skills?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <input style={{...inputStyle, flex: 2}} placeholder="Ex: React, Python..." value={item.name} onChange={e => handleItemChange('skills', index, 'name', e.target.value)} />
              <select style={{...inputStyle, flex: 1}} value={item.level} onChange={e => handleItemChange('skills', index, 'level', e.target.value)}>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
              <button type="button" onClick={() => removeItem('skills', index)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem('skills')} style={{ color: COLORS.blueMain, background: 'rgba(99, 145, 185, 0.08)', border: `1px solid rgba(99, 145, 185, 0.2)`, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 32, transition: 'all .2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 145, 185, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(99, 145, 185, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 145, 185, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(99, 145, 185, 0.2)';
            }}>+ Ajouter une compétence</button>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: '#1f2937' }}>Langues</h2>
          {profile?.languages?.map((item, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <input style={{...inputStyle, flex: 2}} placeholder="Ex: Anglais, Français..." value={item.name} onChange={e => handleItemChange('languages', index, 'name', e.target.value)} />
              <select style={{...inputStyle, flex: 1}} value={item.level} onChange={e => handleItemChange('languages', index, 'level', e.target.value)}>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Courant">Courant</option>
                <option value="Bilingue">Bilingue</option>
              </select>
              <button type="button" onClick={() => removeItem('languages', index)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 16px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            </div>
          ))}
          <button type="button" onClick={() => addItem('languages')} style={{ color: COLORS.blueMain, background: 'rgba(99, 145, 185, 0.08)', border: `1px solid rgba(99, 145, 185, 0.2)`, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 32, transition: 'all .2s' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(99, 145, 185, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(99, 145, 185, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(99, 145, 185, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(99, 145, 185, 0.2)';
            }}>+ Ajouter une langue</button>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e5e7eb', paddingTop: 24 }}>
            <button type="submit" disabled={saving} style={{
              background: COLORS.blueMain, color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 12,
              fontWeight: 600, fontSize: 15, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
              boxShadow: saving ? 'none' : `0 4px 12px rgba(99, 145, 185, 0.2)`
            }}>
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>

        <div style={{ background: '#fff0f0', padding: '1.5rem', borderRadius: 24, border: '1px solid #fee2e2', marginTop: 32, boxShadow: '0 2px 8px rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>Zone de danger</h3>
          <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 16 }}>La suppression de votre compte est irréversible. Toutes vos données seront effacées.</p>
          <button onClick={handleDeleteAccount} style={{ color: '#dc2626', background: '#fff', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Supprimer mon compte</button>
        </div>
      </div>
    </MainLayout>
  );
}

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#4b5563', marginBottom: 6 };
const inputStyle = { 
  width: '100%', 
  padding: '12px', 
  border: '1px solid #e5e7eb', 
  borderRadius: 10, 
  fontSize: 14, 
  outline: 'none', 
  background: '#f9fafb', 
  color: '#111827', 
  boxSizing: 'border-box',
  transition: 'all 0.2s'
};