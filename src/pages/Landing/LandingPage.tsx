import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';

import LandingNav from './LandingNav';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import AboutSection from './AboutSection';
import ProfilesSection from './ProfilesSection';
import ModulesSection from './ModulesSection';
import HowItWorksSection from './HowItWorksSection';
import AISection from './AISection';
import ServiceProviderSection from './ServiceProviderSection';
import ReportsSection from './ReportsSection';
import MonitoringSection from './MonitoringSection';
import IndustriesSection from './IndustriesSection';
import BenefitsSection from './BenefitsSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import SecuritySection from './SecuritySection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import LandingFooter from './LandingFooter';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  return (
    <div className="overflow-x-hidden">
      {/* 1. Navigation */}
      <LandingNav />

      {/* 2. Hero */}
      <HeroSection />

      {/* 3. Stats / Numbers */}
      <StatsSection />

      {/* 4. About LINCE */}
      <AboutSection />

      {/* 5. Business Profiles */}
      <ProfilesSection />

      {/* 6. All Modules */}
      <ModulesSection />

      {/* 7. How It Works */}
      <HowItWorksSection />

      {/* 8. AI Integration */}
      <AISection />

      {/* 9. Service Provider Mode */}
      <ServiceProviderSection />

      {/* 10. Report Builder */}
      <ReportsSection />

      {/* 11. Monitoring & Analytics */}
      <MonitoringSection />

      {/* 12. Industries */}
      <IndustriesSection />

      {/* 13. Benefits */}
      <BenefitsSection />

      {/* 14. Pricing */}
      <PricingSection />

      {/* 15. Testimonials */}
      <TestimonialsSection />

      {/* 16. Security */}
      <SecuritySection />

      {/* 17. FAQ */}
      <FAQSection />

      {/* 18. Final CTA */}
      <CTASection />

      {/* 19. Footer */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
