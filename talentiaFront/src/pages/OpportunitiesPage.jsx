import React, { useState, useEffect } from 'react';
import Sidebar from '../components/companies/SideBar';
import Button from '../components/ui/Button';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/company/opportunities/all')
      .then(res => res.json())
      .then(data => {
        setOpportunities(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = opportunities.filter(o => 
    o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafb' }}>
      <Sidebar role="student" />
      
      <main style={{ flex: 1, padding: '3rem' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0a0a12', marginBottom: 12 }}>
            Opportunités de Stage
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
            Explorez les dernières offres publiées par nos entreprises partenaires.
          </p>
        </header>

        <div style={{ marginBottom: '2.5rem' }}>
          <input 
            type="text" 
            placeholder="Rechercher un poste, une techno..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', maxWidth: 500, padding: '14px 24px', borderRadius: 16,
              border: '1px solid #e5e5ec', fontSize: 15, outline: 'none',
              background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          />
        </div>

        {loading ? (
          <p>Chargement des offres...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
            {filtered.map(opp => (
              <div key={opp.id} style={{
                background: '#fff', padding: '2rem', borderRadius: 24,
                border: '1px solid #f1f1f1', position: 'relative'
              }}>
                <div style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
                  {opp.type || 'Stage'}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>{opp.title}</h3>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, marginBottom: 20 }}>
                  {opp.description.length > 150 ? opp.description.slice(0, 150) + '...' : opp.description}
                </p>
                
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                  {opp.skills?.slice(0, 3).map(s => (
                    <span key={s} style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#64748b' }}>
                      {s}
                    </span>
                  ))}
                </div>

                <Button variant="primary" onClick={() => window.open(`/company/${opp.company_id}`, '_blank')}>
                  Voir l'offre
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
