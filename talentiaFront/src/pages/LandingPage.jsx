import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import { HowItWorks, Features, Testimonials, CTA } from '../components/sections/Sections';
import Footer from '../components/layout/Footer';

export default function LandingPage({ onLogin, onSignup, onCompany }) {
  return (
    <>
      <Navbar onLogin={onLogin} onSignup={onSignup} onCompany={onCompany} />
      <main>
        <Hero onSignup={onSignup} onCompany={onCompany} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA onSignup={onSignup} onCompany={onCompany} />
      </main>
      <Footer />
    </>
  );
}