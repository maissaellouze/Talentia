import React from 'react';

export default function HomePage() {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Retour à la landing
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1>Dashboard TalentIA 🚀</h1>
      <p>Bienvenue dans votre espace personnel séparé.</p>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
}