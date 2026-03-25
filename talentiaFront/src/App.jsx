import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import CompaniesDashboard from './pages/CompaniesDashboard';
import OpportunitiesPage from './pages/opportunities/OpportunitiesPage';

// Components
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
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
      </Routes>

      {/* Global Modals for Login/Signup */}
      {modal === 'company' ? (
        <CompanyRegisterModal onClose={() => setModal(null)} />
      ) : modal && (
        <Modal mode={modal} onClose={() => setModal(null)} />
      )}
    </BrowserRouter>
  );
}