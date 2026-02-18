import React, { useRef, useEffect, useState } from 'react';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import TuneIcon from '@mui/icons-material/Tune';
import GroupsIcon from '@mui/icons-material/Groups';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExtensionIcon from '@mui/icons-material/Extension';

const pillars = [
  {
    icon: <TuneIcon sx={{ fontSize: 26 }} />,
    title: 'Fully Configurable',
    desc: 'Create custom systems, monitoring points, parameters, and inspection checklists tailored to your exact operation.',
    color: '#3b82f6',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 26 }} />,
    title: 'Multi-Role Access',
    desc: 'Field technicians, managers, and administrators each have dedicated workflows and access levels.',
    color: '#10b981',
  },
  {
    icon: <AutoGraphIcon sx={{ fontSize: 26 }} />,
    title: 'AI-Driven Insights',
    desc: 'Claude AI analyzes your operational data to identify trends, anomalies, and provide actionable recommendations.',
    color: '#8b5cf6',
  },
  {
    icon: <VerifiedIcon sx={{ fontSize: 26 }} />,
    title: 'Audit-Ready Reports',
    desc: 'Generate professional PDF reports with photos, tables, charts, and digital signatures for compliance.',
    color: '#f59e0b',
  },
  {
    icon: <ExtensionIcon sx={{ fontSize: 26 }} />,
    title: 'Modular Architecture',
    desc: 'Use only the modules you need — from basic daily logs to full inspection, incidents, and product management.',
    color: '#ef4444',
  },
  {
    icon: <WaterDropIcon sx={{ fontSize: 26 }} />,
    title: 'Industry-Specific',
    desc: 'Built specifically for water treatment, ETE, ETA, pools, cooling towers, boilers, and related industries.',
    color: '#0ea5e9',
  },
];

const AboutSection: React.FC = () => {
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

  const animDir = ['anim-fade-right', 'anim-fade-up', 'anim-fade-left', 'anim-fade-right', 'anim-fade-up', 'anim-fade-left'];
  const animDur = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-normal', 'anim-duration-fast', 'anim-duration-slow'];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <WaterDropIcon sx={{ fontSize: 13 }} />
            About LINCE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5">
            The Platform Built for Water Management Professionals
          </h2>
          <p className="text-gray-500 text-lg max-w-3xl mx-auto leading-relaxed">
            LINCE (Monitoring &amp; Inspection Control Engine) is a comprehensive SaaS platform designed from the ground up
            for water treatment operations. It unifies data collection, inspections, incident management, and AI analytics
            into a single intuitive system that improves operational control and ensures regulatory compliance.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <div
              key={p.title}
              className={`group relative p-6 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 overflow-hidden
                ${animDir[i]} ${animDur[i]} ${isVisible ? 'anim-visible' : ''}`}
            >
              {/* Subtle color background on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded"
                style={{ background: p.color }}
              />

              {/* Icon */}
              <div
                className="w-12 h-12 rounded mb-5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{
                  color: p.color,
                  background: `${p.color}12`,
                  border: `1px solid ${p.color}20`,
                }}
              >
                {p.icon}
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
