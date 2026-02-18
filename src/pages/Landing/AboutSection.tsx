import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TuneIcon from '@mui/icons-material/Tune';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExtensionIcon from '@mui/icons-material/Extension';

const pillarIcons = [
  { icon: <TuneIcon sx={{ fontSize: 26 }} />, color: '#3b82f6' },
  { icon: <GroupsIcon sx={{ fontSize: 26 }} />, color: '#10b981' },
  { icon: <AutoGraphIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6' },
  { icon: <VerifiedIcon sx={{ fontSize: 26 }} />, color: '#f59e0b' },
  { icon: <ExtensionIcon sx={{ fontSize: 26 }} />, color: '#ef4444' },
  { icon: <WaterDropIcon sx={{ fontSize: 26 }} />, color: '#0ea5e9' },
];

const animDir = ['anim-fade-right', 'anim-fade-up', 'anim-fade-left', 'anim-fade-right', 'anim-fade-up', 'anim-fade-left'];
const animDur = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-normal', 'anim-duration-fast', 'anim-duration-slow'];

const AboutSection: React.FC = () => {
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

  const pillars = t('landing.about.pillars', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <WaterDropIcon sx={{ fontSize: 13 }} />
            {t('landing.about.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
            {t('landing.about.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed">
            {t('landing.about.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <div
              key={i}
              className={`group relative p-6 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 overflow-hidden
                ${animDir[i]} ${animDur[i]} ${isVisible ? 'anim-visible' : ''}`}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded"
                style={{ background: pillarIcons[i].color }}
              />
              <div
                className="w-12 h-12 rounded mb-5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{
                  color: pillarIcons[i].color,
                  background: `${pillarIcons[i].color}12`,
                  border: `1px solid ${pillarIcons[i].color}20`,
                }}
              >
                {pillarIcons[i].icon}
              </div>
              <h3 className="text-gray-900 font-semibold text-base mb-2">{p.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
