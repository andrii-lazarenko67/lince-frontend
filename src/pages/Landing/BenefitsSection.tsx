import React, { useRef, useEffect, useState } from 'react';
import DevicesIcon from '@mui/icons-material/Devices';
import TranslateIcon from '@mui/icons-material/Translate';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import TuneIcon from '@mui/icons-material/Tune';
import ImageIcon from '@mui/icons-material/Image';
import NotificationsIcon from '@mui/icons-material/Notifications';

const benefits = [
  {
    icon: <DevicesIcon sx={{ fontSize: 26 }} />,
    title: 'Works on Any Device',
    desc: 'Fully responsive web app — desktop, tablet, and mobile. Technicians in the field, managers in the office.',
    color: '#3b82f6',
    highlight: null,
  },
  {
    icon: <TranslateIcon sx={{ fontSize: 26 }} />,
    title: 'Multi-Language',
    desc: 'Complete Portuguese and English interface. Switch languages at any time from the navigation bar.',
    color: '#10b981',
    highlight: 'PT / EN',
  },
  {
    icon: <CloudDoneIcon sx={{ fontSize: 26 }} />,
    title: 'Cloud-Based & Secure',
    desc: 'Enterprise-grade infrastructure with automatic backups, SSL encryption, and 99.9% uptime SLA.',
    color: '#8b5cf6',
    highlight: '99.9%',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 26 }} />,
    title: 'Fast Performance',
    desc: 'Optimized with lazy loading, pagination, and image compression — even with large historical datasets.',
    color: '#f59e0b',
    highlight: null,
  },
  {
    icon: <SupportAgentIcon sx={{ fontSize: 26 }} />,
    title: 'Onboarding Support',
    desc: 'Interactive guided tours help every team member understand the system from day one.',
    color: '#ef4444',
    highlight: null,
  },
  {
    icon: <TuneIcon sx={{ fontSize: 26 }} />,
    title: 'Highly Configurable',
    desc: 'Everything is configurable — system types, parameter units, checklists, report templates, thresholds.',
    color: '#0d9488',
    highlight: null,
  },
  {
    icon: <ImageIcon sx={{ fontSize: 26 }} />,
    title: 'Photo Documentation',
    desc: 'Attach photos to inspections, incidents, systems, and documents. Stored securely on Cloudinary.',
    color: '#d946ef',
    highlight: null,
  },
  {
    icon: <NotificationsIcon sx={{ fontSize: 26 }} />,
    title: 'Smart Alerts',
    desc: 'Email and SMS notifications for out-of-range values, inspection deadlines, incidents, and updates.',
    color: '#f97316',
    highlight: null,
  },
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
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            Why Choose LINCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Built for Real-World Operations
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Every feature in LINCE was designed based on real needs from water treatment professionals,
            not theoretical use cases.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              className={`group relative p-6 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 overflow-hidden
                ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
            >
              {/* Top hover accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${b.color}, ${b.color}55)` }}
              />

              {/* Highlight badge */}
              {b.highlight && (
                <span
                  className="absolute top-4 right-4 text-xs font-bold px-2 py-0.5 rounded"
                  style={{ color: b.color, background: `${b.color}12`, border: `1px solid ${b.color}25` }}
                >
                  {b.highlight}
                </span>
              )}

              {/* Icon */}
              <div
                className="w-12 h-12 rounded mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{ color: b.color, background: `${b.color}12`, border: `1px solid ${b.color}20` }}
              >
                {b.icon}
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
