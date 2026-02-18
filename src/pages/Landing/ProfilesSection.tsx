import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const profileMeta = [
  {
    icon: <BusinessIcon sx={{ fontSize: 32 }} />,
    key: 'endCustomer',
    accent: '#3b82f6',
    badgeBg: 'rgba(59,130,246,0.12)',
    badgeBorder: 'rgba(59,130,246,0.25)',
    cardBg: 'linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%)',
    cardBorder: 'rgba(59,130,246,0.15)',
  },
  {
    icon: <HandshakeIcon sx={{ fontSize: 32 }} />,
    key: 'serviceProvider',
    accent: '#10b981',
    badgeBg: 'rgba(16,185,129,0.12)',
    badgeBorder: 'rgba(16,185,129,0.25)',
    cardBg: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
    cardBorder: 'rgba(16,185,129,0.15)',
  },
];

const ProfilesSection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            {t('landing.profiles.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.profiles.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('landing.profiles.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profileMeta.map((pm, i) => {
            const features = t(`landing.profiles.${pm.key}.features`, { returnObjects: true }) as string[];
            const examples = t(`landing.profiles.${pm.key}.examples`, { returnObjects: true }) as string[];
            return (
              <div
                key={pm.key}
                className={`rounded border p-8 hover:shadow-xl transition-all duration-300
                  anim-${i === 0 ? 'fade-right' : 'fade-left'} anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}
                style={{ background: pm.cardBg, borderColor: pm.cardBorder }}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{ color: pm.accent, background: `${pm.accent}15`, border: `1.5px solid ${pm.accent}30` }}
                  >
                    {pm.icon}
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded mb-1.5"
                      style={{ color: pm.accent, background: pm.badgeBg, border: `1px solid ${pm.badgeBorder}` }}
                    >
                      {t(`landing.profiles.${pm.key}.badge`)}
                    </span>
                    <h3 className="text-gray-900 font-bold text-xl">{t(`landing.profiles.${pm.key}.title`)}</h3>
                  </div>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">{t(`landing.profiles.${pm.key}.description`)}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
                  {features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${pm.accent}15` }}
                      >
                        <CheckIcon sx={{ fontSize: 11 }} style={{ color: pm.accent }} />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-7">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2.5">Examples</p>
                  <div className="flex flex-wrap gap-2">
                    {examples.map((ex, j) => (
                      <span
                        key={j}
                        className="bg-white border text-gray-600 text-xs px-2.5 py-1 rounded"
                        style={{ borderColor: `${pm.accent}25` }}
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
                    bgcolor: pm.accent,
                    '&:hover': { filter: 'brightness(0.92)', boxShadow: `0 4px 16px ${pm.accent}40` },
                    fontWeight: 600,
                    py: 1.25,
                  }}
                >
                  {t(`landing.profiles.${pm.key}.cta`)}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ProfilesSection;
