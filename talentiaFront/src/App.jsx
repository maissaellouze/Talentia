import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HomePage    from './pages/HomePage';
import Modal       from './components/modal/Modal';

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
            />
          } 
        />

        {/* Route 2 : La page Home complètement séparée */}
        <Route path="/home" element={<HomePage />} />
      </Routes>

      {/* Le Modal reste global pour s'afficher par-dessus la Landing */}
      {modal && (
        <Modal mode={modal} onClose={() => setModal(null)} />
      )}
    </BrowserRouter>
  );
}