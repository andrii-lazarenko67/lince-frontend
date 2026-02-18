import React, { useRef, useEffect, useState } from 'react';
import WaterIcon from '@mui/icons-material/Water';
import HotTubIcon from '@mui/icons-material/HotTub';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import ScienceIcon from '@mui/icons-material/Science';
import FactoryIcon from '@mui/icons-material/Factory';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ApartmentIcon from '@mui/icons-material/Apartment';

const industries = [
  {
    icon: <WaterIcon sx={{ fontSize: 36 }} />,
    name: 'ETE / ETA Stations',
    description: 'Effluent Treatment and Water Treatment Plants with full parameter monitoring and regulatory compliance.',
    color: '#3b82f6',
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/50',
  },
  {
    icon: <HotTubIcon sx={{ fontSize: 36 }} />,
    name: 'Swimming Pools',
    description: 'Chlorine, pH, alkalinity, and turbidity control for pools in condominiums, hotels, clubs, and schools.',
    color: '#0ea5e9',
    bg: 'from-sky-500/10 to-sky-600/5',
    border: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/50',
  },
  {
    icon: <AcUnitIcon sx={{ fontSize: 36 }} />,
    name: 'Cooling Towers',
    description: 'Legionella control, microbiological treatment, and complete operational monitoring of cooling tower systems.',
    color: '#6366f1',
    bg: 'from-indigo-500/10 to-indigo-600/5',
    border: 'border-indigo-500/20',
    hoverBorder: 'hover:border-indigo-500/50',
  },
  {
    icon: <LocalFireDepartmentIcon sx={{ fontSize: 36 }} />,
    name: 'Boiler Systems',
    description: 'Steam boiler water treatment monitoring, corrosion inhibitor tracking, and performance analytics.',
    color: '#ef4444',
    bg: 'from-red-500/10 to-red-600/5',
    border: 'border-red-500/20',
    hoverBorder: 'hover:border-red-500/50',
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 36 }} />,
    name: 'Water Treatment',
    description: 'End-to-end water treatment process management with chemical dosing, analysis, and quality control.',
    color: '#10b981',
    bg: 'from-emerald-500/10 to-emerald-600/5',
    border: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    icon: <FactoryIcon sx={{ fontSize: 36 }} />,
    name: 'Industrial Plants',
    description: 'Process water monitoring for manufacturing, food processing, pharmaceutical, and other industrial facilities.',
    color: '#f59e0b',
    bg: 'from-amber-500/10 to-amber-600/5',
    border: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/50',
  },
  {
    icon: <AgricultureIcon sx={{ fontSize: 36 }} />,
    name: 'Agricultural Systems',
    description: 'Irrigation water quality monitoring, fertigation control, and treatment system management.',
    color: '#84cc16',
    bg: 'from-lime-500/10 to-lime-600/5',
    border: 'border-lime-500/20',
    hoverBorder: 'hover:border-lime-500/50',
  },
  {
    icon: <ApartmentIcon sx={{ fontSize: 36 }} />,
    name: 'Buildings & Condos',
    description: 'Building water system management — storage tanks, distribution, drinking water quality, and compliance.',
    color: '#8b5cf6',
    bg: 'from-violet-500/10 to-violet-600/5',
    border: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/50',
  },
];

const animCombos = [
  { dir: 'anim-fade-up', dur: 'anim-duration-fast' },
  { dir: 'anim-zoom-in', dur: 'anim-duration-normal' },
  { dir: 'anim-fade-down', dur: 'anim-duration-light-slow' },
  { dir: 'anim-fade-up', dur: 'anim-duration-fast' },
  { dir: 'anim-fade-left', dur: 'anim-duration-normal' },
  { dir: 'anim-zoom-in', dur: 'anim-duration-light-slow' },
  { dir: 'anim-flip-up', dur: 'anim-duration-normal' },
  { dir: 'anim-fade-right', dur: 'anim-duration-fast' },
];

const IndustriesSection: React.FC = () => {
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

  return (
    <section ref={sectionRef} id="industries" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            8 Industries Served
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Every Water System
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            LINCE is designed to handle the specific requirements of all water-related industries,
            with configurable parameters and workflows for each sector.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {industries.map((ind, i) => (
            <div
              key={ind.name}
              className={`bg-gradient-to-br ${ind.bg} border ${ind.border} ${ind.hoverBorder}
                rounded p-6 transition-all duration-300 hover:shadow-md group cursor-default
                ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
            >
              <div className="mb-4 transition-transform duration-300 group-hover:scale-110" style={{ color: ind.color }}>
                {ind.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{ind.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{ind.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
