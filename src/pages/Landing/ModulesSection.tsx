import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BarChartIcon from '@mui/icons-material/BarChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScienceIcon from '@mui/icons-material/Science';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

const moduleIcons = [
  { icon: <BarChartIcon sx={{ fontSize: 26 }} />, color: '#3b82f6', hasTag: false, tagType: null },
  { icon: <AssignmentIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6', hasTag: false, tagType: null },
  { icon: <CameraAltIcon sx={{ fontSize: 26 }} />, color: '#0d9488', hasTag: false, tagType: null },
  { icon: <WarningAmberIcon sx={{ fontSize: 26 }} />, color: '#f59e0b', hasTag: false, tagType: null },
  { icon: <ScienceIcon sx={{ fontSize: 26 }} />, color: '#10b981', hasTag: false, tagType: null },
  { icon: <PictureAsPdfIcon sx={{ fontSize: 26 }} />, color: '#ef4444', hasTag: true, tagType: 'tagNew' },
  { icon: <LibraryBooksIcon sx={{ fontSize: 26 }} />, color: '#6366f1', hasTag: false, tagType: null },
  { icon: <AutoAwesomeIcon sx={{ fontSize: 26 }} />, color: '#d946ef', hasTag: true, tagType: 'tagAi' },
  { icon: <DeviceThermostatIcon sx={{ fontSize: 26 }} />, color: '#0ea5e9', hasTag: false, tagType: null },
  { icon: <NotificationsActiveIcon sx={{ fontSize: 26 }} />, color: '#f97316', hasTag: false, tagType: null },
];

const animCombos = [
  'anim-fade-up anim-duration-fast',
  'anim-fade-up anim-duration-normal',
  'anim-fade-up anim-duration-light-slow',
  'anim-zoom-in anim-duration-fast',
  'anim-fade-left anim-duration-normal',
  'anim-fade-right anim-duration-light-slow',
  'anim-fade-up anim-duration-fast',
  'anim-flip-up anim-duration-normal',
  'anim-zoom-in anim-duration-light-slow',
  'anim-fade-down anim-duration-fast',
];

const ModulesSection: React.FC = () => {
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

  const items = t('landing.modules.items', { returnObjects: true }) as { title: string; description: string }[];

  return (
    <section ref={sectionRef} id="modules" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            {t('landing.modules.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.modules.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('landing.modules.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map((mod, i) => (
            <div
              key={i}
              className={`group relative p-5 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden
                ${animCombos[i]} ${isVisible ? 'anim-visible' : ''}`}
              style={{ ['--mod-color' as any]: moduleIcons[i].color }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${moduleIcons[i].color}, ${moduleIcons[i].color}88)` }}
              />

              {moduleIcons[i].hasTag && moduleIcons[i].tagType && (
                <span
                  className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: moduleIcons[i].color }}
                >
                  {t(`landing.modules.${moduleIcons[i].tagType}`)}
                </span>
              )}

              <div
                className="w-11 h-11 rounded mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{
                  color: moduleIcons[i].color,
                  background: `${moduleIcons[i].color}15`,
                  border: `1px solid ${moduleIcons[i].color}25`,
                }}
              >
                {moduleIcons[i].icon}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 text-sm leading-snug">{mod.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed">{mod.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
