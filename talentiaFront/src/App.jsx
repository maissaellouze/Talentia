import React, { useState } from 'react';
import Navbar  from './components/layout/Navbar';
import Footer  from './components/layout/Footer';
import Hero    from './components/sections/Hero';
import { HowItWorks, Features, Testimonials, CTA } from './components/sections/Sections';
import Modal   from './components/modal/Modal';

export default function App() {
  const [modal, setModal] = useState(null); // null | 'login' | 'signup'

  return (
    <div>
      <Navbar
        onLogin={()  => setModal('login')}
        onSignup={() => setModal('signup')}
      />

      <main>
        <Hero     onSignup={() => setModal('signup')} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA onSignup={() => setModal('signup')} />
      </main>

      <Footer />

      {modal && (
        <Modal mode={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
