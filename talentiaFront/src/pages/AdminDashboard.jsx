import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';

const API = 'http://127.0.0.1:8000/admin';

const COLORS = {
  blueMain: '#6391B9',    // Bleu ISSAT
  blueDark: '#2B547E',    // Bleu foncé
  bgDark: '#1e1e2e',      // Fond sombre
  grayText: '#6b7280',
  white: '#ffffff'
};

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API}/pending-companies`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    if (!window.confirm("Voulez-vous vraiment vérifier cette entreprise ? Cela lui enverra un email avec ses identifiants.")) return;
    try {
      const res = await fetch(`${API}/companies/${id}/verify`, { method: 'POST' });
      if (res.ok) {
        alert("Entreprise vérifiée !");
        fetchRequests();
      }
    } catch (err) {
      alert("Erreur lors de la vérification");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Refuser cette demande ?")) return;
    try {
      const res = await fetch(`${API}/companies/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      alert("Erreur");
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      
      {/* ─── HERO SECTION ─── */}
      <section style={{ background: COLORS.bgDark, padding: '6rem 2rem', marginTop: 80 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: COLORS.blueMain, marginBottom: 12 }}>
            Panel d'administration
          </div>
          <h1 style={{ 
            fontSize: 'clamp(32px,5vw,48px)', 
            fontWeight: 800, 
            color: '#fff',
            letterSpacing: '-.02em',
            margin: '0 0 1rem',
            fontFamily: 'sans-serif'
          }}>
            Validation des Entreprises
          </h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15, margin: 0, maxWidth: 600 }}>
            Vérifiez et approuvez les demandes d'inscription des entreprises partenaires de l'ISSAT
          </p>
        </div>
      </section>

      {/* ─── CONTENT SECTION ─── */}
      <section style={{ padding: '6rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {loading ? (
            <div style={{ 
              background: '#f8fafc', 
              borderRadius: 20, 
              border: '1px solid #eee', 
              padding: '4rem 2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <div style={{ color: COLORS.grayText, fontSize: 15, fontWeight: 600 }}>Chargement des demandes...</div>
            </div>
          ) : (
            <div style={{ 
              background: '#fff', 
              borderRadius: 20, 
              border: '1px solid #eee', 
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: `1px solid #e5e7eb` }}>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Entreprise</th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Email</th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Ville</th>
                  <th style={{ 
                    padding: '1.25rem 1.5rem', 
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#374151',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                      <div style={{ color: COLORS.grayText, fontWeight: 600, fontSize: 15 }}>
                        Aucune demande en attente
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
                        Toutes les demandes ont été traitées
                      </div>
                    </td>
                  </tr>
                ) : requests.map((req, idx) => (
                  <tr key={req.id} style={{ 
                    borderBottom: idx < requests.length - 1 ? `1px solid #e5e7eb` : 'none',
                    transition: 'background .15s'
                  }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 700, color: '#1a1a1a', fontSize: 14, marginBottom: 4 }}>
                        {req.name}
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.grayText }}>
                        {req.activity}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: 14, color: '#1a1a1a' }}>
                      {req.email}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', fontSize: 14, color: '#1a1a1a' }}>
                      {req.city}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleVerify(req.id)}
                          style={{ 
                            background: COLORS.blueMain, 
                            color: '#fff', 
                            border: 'none', 
                            padding: '7px 16px', 
                            borderRadius: 8, 
                            fontSize: 12, 
                            cursor: 'pointer', 
                            fontWeight: 700,
                            transition: 'all .2s',
                            boxShadow: `0 4px 12px rgba(99, 145, 185, 0.2)`
                          }}
                          onMouseEnter={(e) => e.target.style.boxShadow = `0 6px 16px rgba(99, 145, 185, 0.3)`}
                          onMouseLeave={(e) => e.target.style.boxShadow = `0 4px 12px rgba(99, 145, 185, 0.2)`}
                        >
                          ✓ Vérifier
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          style={{ 
                            background: '#fff', 
                            color: '#ef4444', 
                            border: `1.5px solid #fed7d7`, 
                            padding: '7px 16px', 
                            borderRadius: 8, 
                            fontSize: 12, 
                            cursor: 'pointer', 
                            fontWeight: 700,
                            transition: 'all .2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#fef2f2';
                            e.target.style.borderColor = '#fecaca';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#fff';
                            e.target.style.borderColor = '#fed7d7';
                          }}
                        >
                          ✕ Rejeter
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </section>

      {/* ─── FOOTER SECTION ─── */}
      <section style={{ background: COLORS.bgDark, padding: '4rem 2rem', borderTop: `1px solid ${COLORS.blueDark}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 14, margin: 0 }}>
            © 2024 ISSAT Sousse. Panel d'administration sécurisé.
          </p>
        </div>
      </section>
    </div>
  );
}