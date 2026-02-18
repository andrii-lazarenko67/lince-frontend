import React, { useRef, useEffect, useState } from 'react';
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

interface Module {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  tag?: string;
}

const modules: Module[] = [
  {
    icon: <BarChartIcon sx={{ fontSize: 26 }} />,
    title: 'Systems & Monitoring',
    description: 'Create systems, monitoring points, and parameters. Track real-time data and set threshold alerts.',
    color: '#3b82f6',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 26 }} />,
    title: 'Daily Logs',
    description: 'Technicians log daily measurements organized by system, stage, and parameter for easy analysis.',
    color: '#8b5cf6',
  },
  {
    icon: <CameraAltIcon sx={{ fontSize: 26 }} />,
    title: 'Inspections',
    description: 'Structured inspections with custom checklists. Attach photos, mark non-conformities, track status.',
    color: '#0d9488',
  },
  {
    icon: <WarningAmberIcon sx={{ fontSize: 26 }} />,
    title: 'Incidents & Occurrences',
    description: 'Report and track operational incidents with priority levels from open to resolved.',
    color: '#f59e0b',
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 26 }} />,
    title: 'Chemical Products',
    description: 'Manage inventory, dosage records, and consumption tracking with low stock alerts.',
    color: '#10b981',
  },
  {
    icon: <PictureAsPdfIcon sx={{ fontSize: 26 }} />,
    title: 'Build Your Own Report',
    description: 'Drag-and-drop builder with custom blocks — analyses, photos, conclusions, digital signatures.',
    color: '#ef4444',
    tag: 'New',
  },
  {
    icon: <LibraryBooksIcon sx={{ fontSize: 26 }} />,
    title: 'Document Library',
    description: 'Centralized repository for technical docs, lab reports, ARTs, certificates, and references.',
    color: '#6366f1',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 26 }} />,
    title: 'AI Assistant',
    description: 'Claude AI analyzes data to generate insights, detect anomalies, suggest actions, and produce reports.',
    color: '#d946ef',
    tag: 'AI',
  },
  {
    icon: <DeviceThermostatIcon sx={{ fontSize: 26 }} />,
    title: 'Dashboards & Charts',
    description: 'Interactive dashboards with line, bar, area, gauge, heatmap charts. Visualize data at a glance.',
    color: '#0ea5e9',
  },
  {
    icon: <NotificationsActiveIcon sx={{ fontSize: 26 }} />,
    title: 'Smart Notifications',
    description: 'Automated alerts via email or SMS for out-of-range values, inspection deadlines, and more.',
    color: '#f97316',
  },
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
    <section ref={sectionRef} id="modules" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            10 Integrated Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need, In One Platform
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            From daily field data collection to AI-powered reports — LINCE covers every aspect of
            water system monitoring and management.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {modules.map((mod, i) => (
            <div
              key={mod.title}
              className={`group relative p-5 border border-gray-100 rounded bg-white
                hover:shadow-lg transition-all duration-300 cursor-default overflow-hidden
                ${animCombos[i]} ${isVisible ? 'anim-visible' : ''}`}
              style={{
                ['--mod-color' as any]: mod.color,
              }}
            >
              {/* Colored top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, ${mod.color}, ${mod.color}88)` }}
              />

              {/* Tag */}
              {mod.tag && (
                <span
                  className="absolute top-3 right-3 text-white text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: mod.color }}
                >
                  {mod.tag}
                </span>
              )}

              {/* Icon container */}
              <div
                className="w-11 h-11 rounded mb-4 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                style={{
                  color: mod.color,
                  background: `${mod.color}15`,
                  border: `1px solid ${mod.color}25`,
                }}
              >
                {mod.icon}
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
