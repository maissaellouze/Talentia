import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- IMPORT DES PAGES ---
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CompaniesDashboard from './pages/CompaniesDashboard';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';
import CompanyApplicationsPage from './pages/opportunities/CompanyApplicationsPage';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import TalentsPage from './pages/companies/TalentsPage';
import Reports from './pages/Reports';
import StudentProfile from './pages/StudentProfile';
import StudentDemandesPage from './pages/Studentdemandespage';
import TeacherDemandesPage from './pages/Teacherdemandespage';

// --- IMPORT DES COMPOSANTS ---
import Modal from './components/modal/Modal';
import CompanyRegisterModal from './components/modal/CompanyRegisterModal';

export default function App() {
  const [modal, setModal] = useState(null);
  const [userRole, setUserRole] = useState(null);

  /**
   * Fonction pour extraire le rôle du token JWT stocké dans le localStorage
   */
  const getRoleFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      // Un JWT est composé de 3 parties séparées par des points. 
      // La 2ème partie (index 1) contient les données (payload).
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      console.log("Rôle détecté dans le token:", payload.role);
      return payload.role; // Devrait être 'student', 'teacher' ou 'company'
    } catch (e) {
      console.error("Erreur de décodage du token:", e);
      return null;
    }
  };

  /**
   * useEffect pour mettre à jour le rôle au chargement initial 
   * et à chaque fois qu'une modal est fermée (après un login réussi par exemple)
   */
  useEffect(() => {
    const role = getRoleFromToken();
    setUserRole(role);
  }, [modal]);

  return (
    <BrowserRouter>
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route
          path="/"
          element={
            <LandingPage
              onLogin={() => setModal('login')}
              onSignup={() => setModal('signup')}
              onCompany={() => setModal('company')}
            />
          }
        />

        {/* --- ROUTES PROTÉGÉES (Livrées avec la prop 'role') --- */}
        
        {/* Dashboard commun (Student & Teacher partagent souvent /home) */}
        <Route path="/home" element={<HomePage role={userRole} />} />
        
        {/* Entreprises & Opportunités */}
        <Route path="/companies" element={<CompaniesDashboard role={userRole} />} />
        <Route path="/opportunities" element={<OpportunitiesPage role={userRole} />} />
        <Route path="/opportunities/:id" element={<OpportunityDetailPage role={userRole} />} />

        {/* Espace ÉTUDIANT */}
        <Route path="/demandes" element={<StudentDemandesPage role={userRole} />} />
        <Route path="/profile" element={<StudentProfile role={userRole} />} />

        {/* Espace ENSEIGNANT (Teacher) */}
        <Route path="/teacher/demandes" element={<TeacherDemandesPage role={userRole} />} />

        {/* Espace ENTREPRISE (Company) */}
        <Route path="/company-dashboard" element={<CompanyDashboard role={userRole} />} />
        <Route path="/company-dashboard/talents" element={<TalentsPage role={userRole} />} />
        <Route path="/company-dashboard/opportunities/:id/applications" element={<CompanyApplicationsPage role={userRole} />} />

        {/* Autres / Admin */}
        <Route path="/reports" element={<Reports role={userRole} />} />
        <Route path="/admin" element={<AdminDashboard role={userRole} />} />

        {/* Redirection automatique vers l'accueil si la route n'existe pas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* --- GESTION DES MODALS (LOGIN / REGISTER) --- */}
      {modal === 'company' ? (
        <CompanyRegisterModal onClose={() => setModal(null)} />
      ) : (
        modal && (
          <Modal 
            mode={modal} 
            onClose={() => {
              setModal(null);
              // On rafraîchit immédiatement le rôle pour que la Sidebar se mette à jour sans F5
              setUserRole(getRoleFromToken());
            }} 
          />
        )
      )}
    </BrowserRouter>
  );
}