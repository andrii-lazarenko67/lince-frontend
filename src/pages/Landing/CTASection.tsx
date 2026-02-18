import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CTASection: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const features = t('landing.cta.features', { returnObjects: true }) as string[];

  return (
    <section
      ref={sectionRef}
      className="relative py-28 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 40%, #0c3460 70%, #0a4277 100%)' }}
    >
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(99,179,237,0.1) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-blue-500/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-blue-500/5 rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className={`anim-zoom-in anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-4 py-2 rounded text-sm font-medium mb-8">
            <AutoAwesomeIcon sx={{ fontSize: 14 }} />
            {t('landing.cta.topBadge')}
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
            {t('landing.cta.title')}{' '}
            <span className="gradient-text">{t('landing.cta.titleHighlight')}</span>
          </h2>

          <p className="text-slate-400 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            {t('landing.cta.description')}
          </p>
        </div>

        <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 anim-fade-up anim-duration-light-slow ${isVisible ? 'anim-visible' : ''}`}>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/signup')}
            sx={{
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb', boxShadow: '0 0 32px rgba(59,130,246,0.6)' },
              px: 4.5,
              py: 1.8,
              fontSize: '1.05rem',
              fontWeight: 700,
              boxShadow: '0 0 24px rgba(59,130,246,0.45), 0 4px 14px rgba(0,0,0,0.4)',
              transition: 'all 0.25s',
            }}
          >
            {t('landing.cta.startTrial')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
            sx={{
              borderColor: 'rgba(148,163,184,0.35)',
              color: '#cbd5e1',
              '&:hover': { borderColor: 'rgba(148,163,184,0.65)', bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' },
              px: 4.5,
              py: 1.8,
              fontSize: '1.05rem',
            }}
          >
            {t('landing.cta.logIn')}
          </Button>
        </div>

        <div className={`flex flex-wrap justify-center gap-6 anim-fade-up anim-duration-slow ${isVisible ? 'anim-visible' : ''}`}>
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-400 text-sm">
              <CheckCircleIcon sx={{ fontSize: 15, color: '#34d399' }} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CTASection;
