import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages - Tous les imports pointent maintenant vers l'intérieur de ./src
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CompaniesDashboard from './pages/CompaniesDashboard';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';
import OpportunityDetailPage from './pages/opportunities/OpportunityDetailPage';
import CompanyApplicationsPage from './pages/opportunities/CompanyApplicationsPage';

import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Reports from './pages/Reports'; // Correction ici : "./" au lieu de "../"

// Components
import Modal from './components/modal/Modal';
import CompanyRegisterModal from './components/modal/CompanyRegisterModal';

export default function App() {
  const [modal, setModal] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1: Landing Page */}
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

        {/* Route 2: Student Home Page */}
        <Route path="/home" element={<HomePage />} />

        {/* Route 3: Companies Dashboard */}
        <Route path="/companies" element={<CompaniesDashboard />} />

        {/* Route Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Route Dashboard Entreprise (Privé) */}
        <Route path="/company-dashboard" element={<CompanyDashboard />} />

        {/* Route 4: AI Recommendations Page */}
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        {/* Route 5: Opportunity Detail (Student) */}
        <Route path="/opportunities/:id" element={<OpportunityDetailPage />} />

        {/* Route 6: Company Applications for an opportunity */}
        <Route path="/company-dashboard/opportunities/:id/applications" element={<CompanyApplicationsPage />} />

        {/* REPORT PFE */}
        <Route path="/reports" element={<Reports />} />
      </Routes>

      {/* Global Modals for Login/Signup */}
      {modal === 'company' ? (
        <CompanyRegisterModal onClose={() => setModal(null)} />
      ) : (
        modal && <Modal mode={modal} onClose={() => setModal(null)} />
      )}
    </BrowserRouter>
  );
}