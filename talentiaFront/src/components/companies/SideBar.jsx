import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';

// Palette cohérente avec le design ISSAT Talent
const COLORS = {
  blueMain: '#6391B9',      // Bleu ISSAT
  blueDark: '#2B547E',      // Bleu foncé
  bgLight: '#f8fafc',       // Gris très léger
  grayText: '#6b7280',      // Gris texte
  white: '#ffffff',         // Blanc
  activeBg: 'rgba(99, 145, 185, 0.08)', // Bleu très léger pour l'état actif
  borderColor: '#eef2f6',   // Bordure subtile
};

export default function Sidebar({ role: roleProp, activeTab, setActiveTab }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem('role') || roleProp || 'student';

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const studentItems = [
    { label: "Dashboard", path: "/home", icon: "📊" },
    { label: "Entreprises", path: "/companies", icon: "🏢" },
    { label: "Opportunités", path: "/opportunities", icon: "💼" },
    { label: "Mes Demandes", path: "/demandes", icon: "✉️" },
    { label: "Rapports PFE", path: "/reports", icon: "📄" },
    { label: "Mon Profil", path: "/profile", icon: "👤" },
  ];

  const teacherItems = [
    { label: "Dashboard", path: "/home", icon: "📊" },
    { label: "Demandes Reçues", path: "/teacher/demandes", icon: "✉️" },
    { label: "Entreprises", path: "/companies", icon: "🏢" },
    { label: "Opportunités", path: "/opportunities", icon: "💼" },
    { label: "Rapports PFE", path: "/reports", icon: "📄" },
    { label: "Mon Profil", path: "/profile", icon: "👤" },
  ];

  const companyItems = [
    { label: "Vos Offres", id: "opportunities", icon: "💼" },
    { label: "Talents", id: "talents", icon: "👥", path: "/company-dashboard/talents" },
    { label: "Profil Entreprise", id: "profile", icon: "🏢" },
  ];

  const items = role === 'student' ? studentItems : role === 'teacher' ? teacherItems : companyItems;

  const getMenuTitle = () => {
    if (role === 'student') return 'Espace Étudiant';
    if (role === 'teacher') return 'Espace Enseignant';
    return 'Espace Recruteur';
  };

  return (
    <aside style={{ 
      width: 280, 
      background: COLORS.white, 
      borderRight: `1px solid ${COLORS.borderColor}`,
      padding: '2.5rem 1.25rem', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'sticky', 
      top: 0, 
      height: '100vh', 
      flexShrink: 0, 
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
    }}>
      {/* ─── Branding ISSAT ─── */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        marginBottom: '3.5rem', 
        padding: '0 0.75rem',
        transition: 'all 0.3s ease'
      }}>
        <Logo size={36} />
        <span style={{ 
          fontFamily: 'sans-serif', 
          fontSize: 22, 
          fontWeight: 800, 
          letterSpacing: '-0.03em', 
          color: '#1a1a1a' 
        }}>
          ISSAT<span style={{ color: COLORS.blueMain, transition: 'color 0.3s ease' }}>Talent</span>
        </span>
      </div>

      {/* ─── Menu Title ─── */}
      <div style={{ marginBottom: '1.5rem', padding: '0 0.75rem' }}>
        <h2 style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: COLORS.grayText, 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          margin: 0
        }}>
          {getMenuTitle()}
        </h2>
      </div>
      
      {/* ─── Navigation Items ─── */}
      <nav style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 8, 
        flex: 1,
        marginBottom: '1rem'
      }}>
        {items.map((item) => {
          const isActive = item.path ? location.pathname === item.path : activeTab === item.id;
          const handleClick = () => {
            if (item.path) navigate(item.path);
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

      {/* ─── Logout Section ─── */}
      <div style={{ 
        paddingTop: '1.5rem', 
        borderTop: `1px solid ${COLORS.borderColor}`,
        marginTop: 'auto'
      }}>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            padding: '12px 0.75rem', 
            borderRadius: 12, 
            border: 'none', 
            background: 'transparent', 
            color: '#ef4444', 
            fontSize: 14, 
            fontWeight: 700, 
            cursor: 'pointer', 
            transition: 'all 0.2s ease',
            width: '100%', 
            textAlign: 'left'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#fff1f2';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span> Déconnexion
        </button>
      </div>

      {/* ─── Styles Globaux ─── */}
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 145, 185, 0.3);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 145, 185, 0.5);
        }
      `}</style>
    </aside>
  );
}

function NavItem({ active, children, onClick, icon }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', 
        textAlign: 'left', 
        padding: '12px 1rem', 
        borderRadius: 12, 
        border: 'none',
        background: active 
          ? COLORS.activeBg 
          : hovered 
            ? 'rgba(99, 145, 185, 0.04)' 
            : 'transparent',
        color: active ? COLORS.blueDark : hovered ? '#1e293b' : COLORS.grayText,
        transition: 'all 0.2s ease',
        fontWeight: active ? 700 : 500, 
        fontSize: 14, 
        cursor: 'pointer',
        display: 'flex', 
        alignItems: 'center', 
        gap: 12, 
        width: '100%',
        boxShadow: active ? 'inset 0 2px 4px rgba(99, 145, 185, 0.05)' : 'none'
      }}
    >
      {/* ─── Indicateur de sélection ─── */}
      {active && (
        <span style={{
          position: 'absolute', 
          left: 0, 
          top: '25%', 
          height: '50%', 
          width: 4,
          borderRadius: '0 4px 4px 0', 
          background: COLORS.blueMain,
          boxShadow: `0 2px 8px rgba(99, 145, 185, 0.3)`,
          animation: 'slideInLeft 0.3s ease'
        }} />
      )}
      
      {/* ─── Icon ─── */}
      <span style={{ 
        fontSize: 18, 
        flexShrink: 0, 
        filter: active ? 'none' : 'grayscale(100%)',
        opacity: active ? 1 : 0.7,
        transition: 'all 0.2s ease',
        transform: hovered ? 'scale(1.1)' : 'scale(1)'
      }}>
        {icon}
      </span>
      
      {/* ─── Label ─── */}
      {children}

      {/* ─── Animations ─── */}
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-4px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </button>
  );
}