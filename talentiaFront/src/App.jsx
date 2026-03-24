import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage    from './pages/HomePage';
import CompaniesDashboard from './pages/CompaniesDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import Modal       from './components/modal/Modal';
import CompanyRegisterModal from './components/modal/CompanyRegisterModal';
import OpportunitiesPage from './pages/OpportunitiesPage';

export default function App() {
  const [modal, setModal] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Route 1 : La Landing Page complète */}
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

        {/* Route 2 : La page Home complètement séparée */}
        <Route path="/home" element={<HomePage />} />

        {/* Route 3 : La page Dashboard Entreprises */}
        <Route path="/companies" element={<CompaniesDashboard />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />

        {/* Route Admin */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Route Dashboard Entreprise (Privé) */}
        <Route path="/company-dashboard" element={<CompanyDashboard />} />
      </Routes>

      {/* Le Modal reste global pour s'afficher par-dessus la Landing */}
      {modal === 'company' ? (
        <CompanyRegisterModal onClose={() => setModal(null)} />
      ) : modal && (
        <Modal mode={modal} onClose={() => setModal(null)} />
      )}
    </BrowserRouter>
  );
}