import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import { HowItWorks, Features, Testimonials, CTA } from '../components/sections/Sections';
import Footer from '../components/layout/Footer';

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <>
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <main>
        <Hero onSignup={onSignup} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <CTA onSignup={onSignup} />
      </main>
      <Footer />
    </>
  );
}