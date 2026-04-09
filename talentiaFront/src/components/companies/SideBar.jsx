import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

export default function Sidebar({ role = 'student', activeTab, setActiveTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const studentItems = [
    { label: "Dashboard", path: "/home", icon: "📊" },
    { label: "Entreprises", path: "/companies", icon: "🏢" },
    { label: "Opportunités", path: "/opportunities", icon: "💼" },
    { label: "Rapports PFE", path: "/reports", icon: "📄" },
    { label: "Mon Profil", path: "/profile", icon: "👤" },
  ];

  const companyItems = [
    { label: "Vos Offres", id: "opportunities", icon: "💼" },
    { label: "Profil Entreprise", id: "profile", icon: "🏢" },
    { label: "Talents", id: "talents", icon: "👥", path: "/company-dashboard/talents" },
  ];

  const items = role === 'student' ? studentItems : companyItems;

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
      height: '100vh',
      flexShrink: 0,
      zIndex: 100
    }}>
      {/* Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem', padding: '0 0.5rem' }}>
        <Logo size={32} />
        <span style={{ fontFamily: "'Clash Display', sans-serif", fontSize: 20, fontWeight: 700 }}>
          Talent<span style={{ color: '#0d9488' }}>IA</span>
        </span>
      </div>

      <div style={{ marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <h2 style={{ fontSize: 12, fontWeight: 700, margin: 0, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {role === 'student' ? 'Menu Étudiant' : 'Portail Entreprise'}
        </h2>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {items.map((item) => {
          const isActive = role === 'student' 
            ? location.pathname === item.path 
            : item.path 
              ? location.pathname === item.path
              : activeTab === item.id;

          const handleClick = () => {
            if (role === 'student') navigate(item.path);
            else if (item.path) navigate(item.path);
            else setActiveTab(item.id);
          };

          return (
            <NavItem 
              key={item.label}
              active={isActive} 
              onClick={handleClick}
              icon={item.icon}
            >
              {item.label}
            </NavItem>
          );
        })}
      </nav>

      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #f3f4f6' }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 1rem', 
            borderRadius: 12, border: 'none', background: 'transparent', color: '#6b7280',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            width: '100%', textAlign: 'left'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseOut={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 18 }}>🔖</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}

function NavItem({ active, children, onClick, icon }) {
  const [hovered, setHovered] = useState(false);
  const isActive = active;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: '11px 1rem',
        borderRadius: 12,
        border: 'none',
        background: isActive ? '#f0fdfa' : hovered ? '#f9fafb' : 'transparent',
        color: isActive ? '#0d9488' : hovered ? '#374151' : '#6b7280',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: isActive ? 700 : 500,
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Green left accent bar for active item */}
      {isActive && (
        <span style={{
          position: 'absolute',
          left: 0,
          top: '20%',
          height: '60%',
          width: 3,
          borderRadius: '0 3px 3px 0',
          background: '#0d9488',
        }} />
      )}
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      {children}
    </button>
  );
}

