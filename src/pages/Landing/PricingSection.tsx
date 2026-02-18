import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface Plan {
  name: string;
  badge?: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Starter',
    price: 'R$ 149',
    period: '/month',
    description: 'Perfect for small facilities and single-location operations.',
    features: [
      'Up to 3 systems',
      'Up to 5 users',
      'Daily logs & monitoring',
      'Photo inspections',
      'Basic reports (PDF)',
      'Email alerts',
      '5 GB media storage',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    badge: 'Most Popular',
    price: 'R$ 349',
    period: '/month',
    description: 'For growing operations and service providers with multiple clients.',
    features: [
      'Unlimited systems',
      'Up to 25 users',
      'Service provider mode',
      'Multi-client management',
      'Custom report templates',
      'AI assistant & insights',
      'Email + SMS alerts',
      '50 GB media storage',
      'Product inventory module',
      'Document library',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom requirements and dedicated support.',
    features: [
      'Everything in Professional',
      'Unlimited users',
      'Custom branding',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantee',
      'Unlimited storage',
      'API access',
      'On-site onboarding',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const animDirs = ['anim-fade-right', 'anim-fade-up', 'anim-fade-left'];
  const animDurs = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow'];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1b2e 0%, #081426 100%)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-blue-600/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            Simple, Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Choose the Right Plan
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            All plans include a 14-day free trial. No credit card required. Cancel anytime.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-end">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded border transition-all duration-300
                ${animDirs[i]} ${animDurs[i]} ${isVisible ? 'anim-visible' : ''}
                ${plan.highlighted
                  ? 'shadow-2xl shadow-blue-500/20 scale-[1.03] lg:-mt-4 lg:mb-0'
                  : 'hover:border-slate-600'
                }`}
              style={
                plan.highlighted
                  ? {
                      background: 'linear-gradient(160deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                      border: '1.5px solid rgba(99,165,250,0.4)',
                    }
                  : {
                      background: 'rgba(15,28,50,0.8)',
                      border: '1px solid rgba(51,65,85,0.8)',
                    }
              }
            >
              {/* Most Popular badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 text-xs font-bold px-4 py-1.5 rounded shadow-lg flex items-center gap-1.5">
                    <StarIcon sx={{ fontSize: 11 }} />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* Plan name & description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-bold text-xl text-white">{plan.name}</h3>
                    {plan.highlighted && (
                      <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                        <AutoAwesomeIcon sx={{ fontSize: 10 }} />
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-extrabold text-white leading-none">{plan.price}</span>
                    {plan.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? 'text-blue-100' : 'text-slate-400'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: plan.highlighted ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.15)',
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 11, color: plan.highlighted ? 'white' : '#10b981' }} />
                      </div>
                      <span className={plan.highlighted ? 'text-blue-50' : 'text-slate-300'}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? 'contained' : 'outlined'}
                  endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(plan.name === 'Enterprise' ? '/login' : '/signup')}
                  fullWidth
                  sx={
                    plan.highlighted
                      ? {
                          bgcolor: 'white',
                          color: '#1d4ed8',
                          fontWeight: 700,
                          py: 1.25,
                          '&:hover': { bgcolor: '#eff6ff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
                        }
                      : {
                          borderColor: 'rgba(71,85,105,0.8)',
                          color: '#cbd5e1',
                          fontWeight: 600,
                          py: 1.25,
                          '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(255,255,255,0.05)', color: '#fff' },
                        }
                  }
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className={`text-center text-slate-600 text-xs mt-10 anim-fade-up anim-duration-slow ${isVisible ? 'anim-visible' : ''}`}>
          Prices shown in Brazilian Reais (BRL). All plans include 14-day free trial. No credit card required to start.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
