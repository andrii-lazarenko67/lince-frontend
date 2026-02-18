import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import HandshakeIcon from '@mui/icons-material/Handshake';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const benefitIcons = [
  { icon: <PeopleIcon sx={{ fontSize: 20 }} />, color: '#10b981' },
  { icon: <LockIcon sx={{ fontSize: 20 }} />, color: '#3b82f6' },
  { icon: <SwapHorizIcon sx={{ fontSize: 20 }} />, color: '#f59e0b' },
  { icon: <FilterListIcon sx={{ fontSize: 20 }} />, color: '#8b5cf6' },
  { icon: <GroupWorkIcon sx={{ fontSize: 20 }} />, color: '#ef4444' },
  { icon: <HandshakeIcon sx={{ fontSize: 20 }} />, color: '#0d9488' },
];

const clients = [
  { name: 'Condominium Paradise', initial: 'C', active: true },
  { name: 'Hotel Marina Resort', initial: 'H', active: false },
  { name: 'Industrial Park ETA', initial: 'I', active: false },
  { name: 'School District Pool', initial: 'S', active: false },
];

const animDirs = ['anim-fade-up', 'anim-zoom-in', 'anim-fade-left', 'anim-fade-up', 'anim-zoom-in', 'anim-fade-down'];
const animDurs = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-fast', 'anim-duration-slow', 'anim-duration-normal'];

const ServiceProviderSection: React.FC = () => {
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

  const benefits = t('landing.serviceProvider.benefits', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section
      ref={sectionRef}
      id="service-provider"
      className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1b2e 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
          {/* Left: Content */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <span className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-6">
              <HandshakeIcon sx={{ fontSize: 13 }} />
              {t('landing.serviceProvider.badge')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-5 leading-tight">
              {t('landing.serviceProvider.title')}{' '}
              <span className="text-emerald-400">{t('landing.serviceProvider.titleHighlight')}</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-5">
              {t('landing.serviceProvider.description')}
            </p>
            <p className="text-slate-400 leading-relaxed mb-8 border-l-2 border-emerald-500/30 pl-4 text-sm">
              {t('landing.serviceProvider.hierarchyNote')}{' '}
              <strong className="text-slate-200">{t('landing.serviceProvider.hierarchy')}</strong>{' '}
              {t('landing.serviceProvider.hierarchyEnd')}
            </p>

            {/* Client switcher mockup */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded mb-8 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700/50">
                <p className="text-slate-500 text-[11px] uppercase tracking-widest font-medium">{t('landing.serviceProvider.contextLabel')}</p>
              </div>
              <div className="p-3 space-y-1">
                {clients.map((c) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded transition-colors cursor-pointer
                      ${c.active ? 'bg-emerald-500/15 border border-emerald-500/25' : 'hover:bg-slate-700/50'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center flex-shrink-0
                        ${c.active ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                    >
                      {c.initial}
                    </div>
                    <span className={`text-sm ${c.active ? 'text-white font-medium' : 'text-slate-400'}`}>
                      {c.name}
                    </span>
                    {c.active && (
                      <span className="ml-auto text-emerald-400 text-[11px] font-semibold">{t('landing.serviceProvider.activeLabel')}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: '#10b981',
                '&:hover': { bgcolor: '#059669', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' },
                fontWeight: 600,
                px: 3,
                py: 1.25,
              }}
            >
              {t('landing.serviceProvider.cta')}
            </Button>
          </div>

          {/* Right: Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {benefits.map((b, i) => (
              <div
                key={i}
                className={`group rounded border border-slate-700/60 p-5 transition-all duration-300
                  hover:border-emerald-500/30 hover:bg-slate-800/80
                  ${animDirs[i]} ${animDurs[i]} ${isVisible ? 'anim-visible' : ''}`}
                style={{ background: 'rgba(15,28,50,0.7)' }}
              >
                <div
                  className="w-10 h-10 rounded mb-3.5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                  style={{ color: benefitIcons[i].color, background: `${benefitIcons[i].color}15`, border: `1px solid ${benefitIcons[i].color}25` }}
                >
                  {benefitIcons[i].icon}
                </div>
                <h4 className="text-white font-semibold text-sm mb-2">{b.title}</h4>
                <p className="text-slate-400 text-xs leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceProviderSection;
