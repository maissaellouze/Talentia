import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <aside style={{ 
      width: 280, 
      background: '#fff', 
      borderRight: '1px solid #f1f1f1', 
      padding: '2.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem', padding: '0 0.5rem' }}>
        <Logo size={32} />
        <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Talent<span style={{ color: '#0d9488' }}>IA</span>
        </span>
      </div>

      <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Étudiant</h2>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <NavItem active={location.pathname === '/home'} onClick={() => navigate('/home')}>
          <span style={{ marginRight: 10 }}>🏠</span> Dashboard
        </NavItem>
        <NavItem active={location.pathname === '/companies'} onClick={() => navigate('/companies')}>
          <span style={{ marginRight: 10 }}>🏢</span> Entreprises
        </NavItem>
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 1rem', 
            borderRadius: 12, border: 'none', background: 'transparent', color: '#6b7280',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

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
