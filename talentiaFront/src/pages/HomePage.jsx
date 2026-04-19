import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

// ─── COULEURS ISSAT ───────────────────────────────────────────────────────────
const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

export default function HomePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('name') || localStorage.getItem('userName') || 'Étudiant';
  const studentId = localStorage.getItem('studentId');
  
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch applications
        const appRes = await fetch(`http://127.0.0.1:8000/student/my-applications?student_id=${studentId}`);
        if (appRes.ok) {
          const appData = await appRes.json();
          setApplications(appData.slice(0, 3)); // Show top 3
        }

        // Fetch recommendations
        const recRes = await fetch(`http://127.0.0.1:8000/opportunities/?student_id=${studentId}`);
        if (recRes.ok) {
          const recData = await recRes.json();
          const normalized = Array.isArray(recData) ? recData.map(d => ({
            ...d,
            internship: d.opportunity || d.internship,
            score: d.match_score !== undefined ? d.match_score : (d.score || 0)
          })) : [];
          setRecommendations(normalized.slice(0, 3));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const STATUS_MAP = {
    pending: { label: 'En attente', color: '#ca8a04', bg: '#fefce8' },
    accepted: { label: 'Accepté', color: '#16a34a', bg: '#f0fdf4' },
    rejected: { label: 'Refusé', color: '#ef4444', bg: '#fef2f2' }
  };

  return (
    <MainLayout>
      <div style={{ padding: '2rem 3.5rem', maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: '3rem', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>👋</span>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0a0a12', margin: 0 }}>Bonjour, {userName}</h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Ravi de vous revoir ! Voici un aperçu de vos activités.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
          
          {/* Section 1: Recent Applications */}
          <section style={{ animation: 'fadeIn 0.8s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1f2937' }}>Vos Candidatures</h3>
              <button 
                onClick={() => navigate('/opportunities')}
                style={{ background: 'none', border: 'none', color: COLORS.blueMain, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={(e) => e.target.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
              >
                Voir tout →
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                [1, 2].map(i => <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />)
              ) : applications.length > 0 ? (
                applications.map(app => {
                  const s = STATUS_MAP[app.status] || STATUS_MAP.pending;
                  return (
                    <div key={app.id} style={{ 
                      background: '#fff', padding: '1.25rem', borderRadius: 20, border: '1px solid #eee',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,.04)',
                      hover: { boxShadow: `0 4px 12px rgba(99, 145, 185, 0.1)` }
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 4px 12px rgba(99, 145, 185, 0.1)`}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'}
                    onClick={() => navigate(`/opportunities/${app.opportunity_id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 145, 185, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💼</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{app.opportunity_title}</div>
                          <div style={{ fontSize: 13, color: '#6b7280' }}>{app.company_name}</div>
                        </div>
                      </div>
                      <span style={{ 
                        padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700,
                        background: s.bg, color: s.color
                      }}>{s.label}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
                  <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Aucune candidature active</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>Postulez à des offres pour booster votre carrière.</div>
                </div>
              )}
            </div>
          </section>

          {/* Section 2: Recommended Opportunities */}
          <section style={{ animation: 'fadeIn 1s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: '#1f2937' }}>Recommandations IA</h3>
              <button 
                onClick={() => navigate('/opportunities')}
                style={{ background: 'none', border: 'none', color: COLORS.blueMain, fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={(e) => e.target.style.transform = 'translateX(4px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
              >
                Explorer →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {loading ? (
                [1, 2].map(i => <div key={i} style={{ height: 80, background: '#f3f4f6', borderRadius: 16, animation: 'pulse 1.5s infinite' }} />)
              ) : recommendations.length > 0 ? (
                recommendations.map(item => {
                  const score = Math.round(item.score * 100);
                  return (
                    <div key={item.internship?.id} style={{ 
                      background: '#fff', padding: '1.25rem', borderRadius: 20, border: '1px solid #eee',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.2s', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,.04)'
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = `0 4px 12px rgba(99, 145, 185, 0.1)`}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'}
                    onClick={() => navigate(`/opportunities/${item.internship?.id}`)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99, 145, 185, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✨</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{item.internship?.title}</div>
                          <div style={{ fontSize: 13, color: '#6b7280' }}>{item.internship?.company_name} · {item.internship?.location}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.blueMain }}>{score}%</div>
                        <div style={{ fontSize: 10, color: COLORS.grayText, fontWeight: 700, textTransform: 'uppercase' }}>Match</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '3rem 2rem', textAlign: 'center', background: '#fff', borderRadius: 24, border: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                  <div style={{ fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>Pas encore de recommandations</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>Complétez votre profil pour que l'IA vous aide.</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </MainLayout>
  );
}