import React from 'react';
import Sidebar from '../components/companies/SideBar';

export default function HomePage() {
  const userName = localStorage.getItem('userName') || 'Étudiant';

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex' }}>
      <Sidebar role="student" />
      
      <main style={{ flex: 1, padding: '3.5rem', overflowY: 'auto', height: '100vh' }}>
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#0a0a12', marginBottom: 8 }}>Tableau de Bord</h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>Bienvenue, {userName} ! Prêt à trouver votre prochain stage ?</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 24, border: '1px solid #f1f1f1' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Vos Candidatures</h3>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Vous n'avez pas encore postulé à des offres.</p>
          </div>
          
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 24, border: '1px solid #f1f1f1' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1rem' }}>Offres Recommandées</h3>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Complétez votre profil pour recevoir des recommandations IA.</p>
          </div>
        </div>
      </main>
    </div>
  );
}