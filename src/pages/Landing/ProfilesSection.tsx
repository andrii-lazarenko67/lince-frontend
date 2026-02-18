import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const profiles = [
  {
    icon: <BusinessIcon sx={{ fontSize: 32 }} />,
    badge: 'End Customer',
    title: 'For Industries & Facilities',
    description:
      'Ideal for companies that manage their own water systems — factories, treatment plants, hotels, condominiums, and more.',
    features: [
      'Create and configure your own systems',
      'Set monitoring parameters and alerts',
      'Log daily records and measurements',
      'Conduct inspections with photos',
      'Track incidents and occurrences',
      'Manage chemical product inventory',
      'Generate compliance reports',
      'AI-powered operational insights',
    ],
    examples: ['ETE/ETA Stations', 'Swimming Pools', 'Cooling Towers', 'Boiler Systems'],
    ctaLabel: 'Start as End Customer',
    accent: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.12)',
    badgeBorder: 'rgba(59,130,246,0.25)',
    badgeText: '#93c5fd',
    cardBg: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
    cardBorder: 'rgba(59,130,246,0.15)',
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 32 }} />,
    badge: 'Service Provider',
    title: 'For Maintenance Companies',
    description:
      'Built for companies that provide water treatment services to multiple clients — pool companies, water treatment contractors, and consultants.',
    features: [
      'Multi-client portfolio management',
      'Dedicated workspace per client',
      'Strict data isolation between clients',
      'Per-client report generation',
      'Client-specific system configurations',
      'Centralized dashboard across all clients',
      'Role-based team access per client',
      'Professional branded PDF reports',
    ],
    examples: ['Pool Maintenance Companies', 'Water Treatment Services', 'ETE/ETA Contractors', 'Environmental Consultants'],
    ctaLabel: 'Start as Service Provider',
    accent: '#10b981',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeBorder: 'rgba(16,185,129,0.25)',
    badgeText: '#6ee7b7',
    cardBg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    cardBorder: 'rgba(16,185,129,0.15)',
  },
];

const ProfilesSection: React.FC = () => {
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

  return (
    <section ref={sectionRef} className="bg-gray-50 py-24" id="profiles">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            Two Business Profiles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            LINCE Adapts to Your Business Model
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you manage your own facility or serve multiple clients,
            LINCE has a mode designed specifically for you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profiles.map((profile, i) => (
            <div
              key={profile.badge}
              className={`rounded border p-8 hover:shadow-xl transition-all duration-300
                anim-${i === 0 ? 'fade-right' : 'fade-left'} anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}
              style={{ background: profile.cardBg, borderColor: profile.cardBorder }}
            >
              {/* Profile header */}
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ color: profile.accent, background: `${profile.accent}15`, border: `1.5px solid ${profile.accent}30` }}
                >
                  {profile.icon}
                </div>
                <div>
                  <span
                    className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded mb-1.5"
                    style={{ color: profile.accent, background: profile.badgeBg, border: `1px solid ${profile.badgeBorder}` }}
                  >
                    {profile.badge}
                  </span>
                  <h3 className="text-gray-900 font-bold text-xl">{profile.title}</h3>
                </div>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">{profile.description}</p>

              {/* Feature checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                {profile.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${profile.accent}15` }}
                    >
                      <CheckIcon sx={{ fontSize: 11 }} style={{ color: profile.accent }} />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Examples row */}
              <div className="mb-7">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2.5">Examples</p>
                <div className="flex flex-wrap gap-2">
                  {profile.examples.map((ex) => (
                    <span
                      key={ex}
                      className="bg-white border text-gray-600 text-xs px-2.5 py-1 rounded"
                      style={{ borderColor: `${profile.accent}25` }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
                onClick={() => navigate('/signup')}
                fullWidth
                sx={{
                  bgcolor: profile.accent,
                  '&:hover': { filter: 'brightness(0.92)', boxShadow: `0 4px 16px ${profile.accent}40` },
                  fontWeight: 600,
                  py: 1.25,
                }}
              >
                {profile.ctaLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfilesSection;
