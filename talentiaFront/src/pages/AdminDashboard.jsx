import React, { useEffect, useState } from 'react';
import Navbar from '../components/layout/Navbar';

const API = 'http://127.0.0.1:8000/admin';

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
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
     
      <div style={{ maxWidth: 1000, margin: '100px auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: '2rem' }}>Validation des Entreprises</h1>
        
        {loading ? <p>Chargement...</p> : (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #eee', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f8f8', borderBottom: '1px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '1rem' }}>Entreprise</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Ville</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Aucune demande en attente.</td></tr>
                ) : requests.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>{req.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{req.activity}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: 14 }}>{req.email}</td>
                    <td style={{ padding: '1rem', fontSize: 14 }}>{req.city}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          onClick={() => handleVerify(req.id)}
                          style={{ background: '#0d9488', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                        >
                          Vérifier
                        </button>
                        <button 
                          onClick={() => handleReject(req.id)}
                          style={{ background: '#fff', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                        >
                          Rejeter
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
    </div>
  );
}
