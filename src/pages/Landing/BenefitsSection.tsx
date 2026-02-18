import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DevicesIcon from '@mui/icons-material/Devices';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TuneIcon from '@mui/icons-material/Tune';
import ImageIcon from '@mui/icons-material/Image';
import NotificationsIcon from '@mui/icons-material/Notifications';

const benefitMeta = [
  { icon: <DevicesIcon sx={{ fontSize: 26 }} />, color: '#3b82f6' },
  { icon: <TranslateIcon sx={{ fontSize: 26 }} />, color: '#10b981' },
  { icon: <CloudDoneIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6' },
  { icon: <SpeedIcon sx={{ fontSize: 26 }} />, color: '#f59e0b' },
  { icon: <SupportAgentIcon sx={{ fontSize: 26 }} />, color: '#ef4444' },
  { icon: <TuneIcon sx={{ fontSize: 26 }} />, color: '#0d9488' },
  { icon: <ImageIcon sx={{ fontSize: 26 }} />, color: '#d946ef' },
  { icon: <NotificationsIcon sx={{ fontSize: 26 }} />, color: '#f97316' },
];

const animCombos = [
  { dir: 'anim-fade-right', dur: 'anim-duration-fast' },
  { dir: 'anim-fade-up', dur: 'anim-duration-normal' },
  { dir: 'anim-fade-left', dur: 'anim-duration-light-slow' },
  { dir: 'anim-zoom-in', dur: 'anim-duration-fast' },
  { dir: 'anim-fade-right', dur: 'anim-duration-normal' },
  { dir: 'anim-fade-up', dur: 'anim-duration-light-slow' },
  { dir: 'anim-fade-left', dur: 'anim-duration-fast' },
  { dir: 'anim-zoom-in', dur: 'anim-duration-normal' },
];

const BenefitsSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const benefits = t('landing.benefits.items', { returnObjects: true }) as { title: string; desc: string; highlight?: string }[];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            {t('landing.benefits.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.benefits.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('landing.benefits.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div
              key={i}
              className={`group relative p-6 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 overflow-hidden
                ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${benefitMeta[i].color}, ${benefitMeta[i].color}55)` }}
              />
              {b.highlight && (
                <span
                  className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded"
                  style={{ color: benefitMeta[i].color, background: `${benefitMeta[i].color}12`, border: `1px solid ${benefitMeta[i].color}25` }}
                >
                  {b.highlight}
                </span>
              )}
              <div
                className="w-12 h-12 rounded mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{ color: benefitMeta[i].color, background: `${benefitMeta[i].color}12`, border: `1px solid ${benefitMeta[i].color}20` }}
              >
                {benefitMeta[i].icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{b.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
