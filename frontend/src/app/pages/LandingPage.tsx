import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { Services } from '../components/Services';
import { AIChat } from '../components/AIChat';
import { Trainers } from '../components/Trainers';
import { Testimonials } from '../components/Testimonials';
import { ClosingCTA } from '../components/landing/ClosingCTA';
import { Footer } from '../components/Footer';
import { StickyCTABar } from '../components/landing/StickyCTABar';
import { PreviewBanner } from '../shared/components/PreviewBanner';
import { useInView } from '../shared/hooks/useInView';
import { useSiteContent } from '../shared/hooks/useSiteContent';

export function LandingPage() {
  // Track hero visibility for the sticky CTA bar
  const { ref: heroVisibilityRef, isRevealed: heroHasBeenSeen } = useInView<HTMLElement>({ threshold: 0.01 });
  const [heroVisible, setHeroVisible] = useState(true);

  // Fetch dynamic CMS content (renders defaults immediately, updates when data arrives)
  const { content, isPreview } = useSiteContent();

  return (
    <div className={`bg-[#0B0B0B] overscroll-y-contain${isPreview ? ' pt-10' : ''}`}>
      {isPreview && <PreviewBanner />}
      <Navigation />
      <Hero
        content={{ hero: content.hero, brand: content.brand, contact: content.contact }}
        heroRef={(node) => {
          heroVisibilityRef(node);
          // Track live visibility via IntersectionObserver for sticky bar
          if (node && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(
              ([entry]) => setHeroVisible(entry.isIntersecting),
              { threshold: 0.01 },
            );
            observer.observe(node);
            // Cleanup handled by component lifecycle (page unmount)
          }
        }}
      />
      <About content={content.about} />
      <Services content={content.services} />
      <AIChat content={content.ai_coach} />
      <Trainers content={content.trainers} />
      <Testimonials content={content.testimonials} />
      <ClosingCTA content={content.closing_cta} image={content.about.main_image || content.hero.background_image} />
      <Footer content={{ footer: content.footer, contact: content.contact, social: content.social, brand: content.brand }} />
      <StickyCTABar heroVisible={heroVisible} />
    </div>
  );
}
