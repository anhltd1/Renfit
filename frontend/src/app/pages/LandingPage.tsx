import React from 'react';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { AIChat } from '../components/AIChat';
import { Booking } from '../components/Booking';
import { Trainers } from '../components/Trainers';
import { Testimonials } from '../components/Testimonials';
import { Pricing } from '../components/Pricing';
import { Footer } from '../components/Footer';

export function LandingPage() {
  return (
    <div className="scroll-smooth">
      <Navigation />
      <Hero />
      <section id="about">
        <About />
      </section>
      <section id="services">
        <Services />
      </section>
      <AIChat />
      <section id="trainers">
        <Trainers />
      </section>
      <Booking />
      <Footer />
    </div>
  );
}
