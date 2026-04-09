import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/companies/SideBar';

export default function TalentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const companyId = localStorage.getItem('companyId') || 1;
  const navigate = useNavigate();
  
  // For company sidebar items that use setActiveTab, we navigate back to dashboard with a tab param
  const handleSidebarTab = (tabId) => {
    navigate(`/company-dashboard?tab=${tabId}`);
  };

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/company/students?company_id=${companyId}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [companyId]);

  const filteredStudents = students.filter(s => {
    const term = search.toLowerCase();
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const uni = (s.university || '').toLowerCase();
    const skills = (s.skills || []).join(' ').toLowerCase();
    return name.includes(term) || uni.includes(term) || skills.includes(term);
  });

  return (
    <>
      <style>{`
        .tp-search:focus { outline: none; border-color: #0d9488 !important; box-shadow: 0 0 0 3px rgba(13,148,136,.1) !important; }
        .tp-card { transition: all 0.2s ease; border: 1.5px solid #e5e5ec; }
        .tp-card:hover { border-color: #0d9488; transform: translateY(-3px); box-shadow: 0 8px 24px rgba(13,148,136,0.1); }
      `}</style>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
        <Sidebar role="company" activeTab="talents" setActiveTab={handleSidebarTab} />
        
        <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#0a0a12' }}>Annuaire des Talents</h1>
            <p style={{ color: '#6b7280', marginBottom: 24 }}>Recherchez et découvrez les étudiants inscrits sur TalentIA.</p>

            {/* Search Bar */}
            <div style={{
              background: '#fff', borderRadius: 14, border: '1.5px solid #e5e5ec',
              padding: '14px 18px', marginBottom: 32, position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: '#9ca3af', pointerEvents: 'none' }}>🔍</span>
              <input
                className="tp-search"
                type="text"
                placeholder="Rechercher par nom, école, ou compétence (ex: React)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontSize: 14, color: '#0a0a12', paddingLeft: 32,
                  fontFamily: 'inherit', background: 'transparent',
                }}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Chargement des talents...</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', background: '#fff', borderRadius: 16, border: '1.5px dashed #e5e5ec' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🕵️</div>
                Aucun talent trouvé.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {filteredStudents.map(student => (
                  <div key={student.id} className="tp-card" style={{ background: '#fff', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0fdfa', color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>
                        {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{student.first_name} {student.last_name}</div>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{student.university || 'Université non spécifiée'}</div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 16, flex: 1 }}>
                      {student.field_of_study && <div><strong>Filière:</strong> {student.field_of_study}</div>}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                      {student.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#374151' }}>
                          {skill}
                        </span>
                      ))}
                      {student.skills?.length > 3 && (
                        <span style={{ fontSize: 11, color: '#9ca3af', padding: '4px 0' }}>+{student.skills.length - 3} autres</span>
                      )}
                    </div>

                    <button 
                      onClick={() => setSelectedStudent(student)}
                      style={{ width: '100%', padding: '10px', background: '#f0fdfa', border: '1px solid #ccfbf1', color: '#0d9488', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Voir le Profil
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setSelectedStudent(null)}>
          <div style={{
            background: '#fff', borderRadius: 20, width: '90%', maxWidth: 600,
            maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: 'absolute', top: 16, right: 16, background: '#f3f4f6', border: 'none',
                width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold'
              }}
            >✕</button>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>{selectedStudent.field_of_study} · {selectedStudent.university}</div>
            
            <div style={{ background: '#f9fafb', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}><strong>Email:</strong> {selectedStudent.email}</div>
              {selectedStudent.linkedin && <div style={{ fontSize: 14, marginBottom: 8 }}><strong>LinkedIn:</strong> <a href={selectedStudent.linkedin} target="_blank" rel="noreferrer">{selectedStudent.linkedin}</a></div>}
              {selectedStudent.github && <div style={{ fontSize: 14 }}><strong>GitHub:</strong> <a href={selectedStudent.github} target="_blank" rel="noreferrer">{selectedStudent.github}</a></div>}
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Biographie</h3>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, marginBottom: 24 }}>{selectedStudent.bio || "Aucune biographie fournie."}</p>

            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Compétences Techniques</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {selectedStudent.skills?.map((s, i) => (
                <span key={i} style={{ background: '#e0e7ff', color: '#4f46e5', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {s}
                </span>
              ))}
              {(!selectedStudent.skills || selectedStudent.skills.length === 0) && <span style={{ color: '#9ca3af', fontSize: 14 }}>Non renseigné</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
