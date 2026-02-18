import React, { useRef, useEffect, useState } from 'react';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckIcon from '@mui/icons-material/Check';

const steps = [
  {
    number: '01',
    icon: <SettingsSuggestIcon sx={{ fontSize: 28 }} />,
    title: 'Configure Your Systems',
    description:
      'Set up your water systems, monitoring points, parameters with units and alert thresholds, and custom inspection checklists.',
    detail: ['Create system types and stages', 'Define monitoring parameters', 'Set alert thresholds', 'Build inspection checklists'],
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.3)',
  },
  {
    number: '02',
    icon: <EditNoteIcon sx={{ fontSize: 28 }} />,
    title: 'Field Technicians Log Data',
    description:
      'Technicians access LINCE from any device to submit daily readings, perform photo-based inspections, and report incidents — all in real time.',
    detail: ['Daily measurement logging', 'Photo inspections with checklists', 'Incident and occurrence reports', 'Chemical product dosage records'],
    color: '#10b981',
    glow: 'rgba(16,185,129,0.3)',
  },
  {
    number: '03',
    icon: <DashboardIcon sx={{ fontSize: 28 }} />,
    title: 'Managers Review & Control',
    description:
      'Managers get full visibility through dashboards, alerts, and detailed views. Review inspections, approve reports, and track compliance.',
    detail: ['Real-time dashboard overview', 'Automated out-of-range alerts', 'Inspection review and approval', 'Multi-system comparison'],
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    number: '04',
    icon: <AutoAwesomeIcon sx={{ fontSize: 28 }} />,
    title: 'AI Generates Insights',
    description:
      'Claude AI continuously analyzes your data to detect anomalies, identify trends, suggest corrective actions, and generate intelligent reports.',
    detail: ['Anomaly detection & alerts', 'Trend analysis across periods', 'Smart report generation', 'Operational recommendations'],
    color: '#d946ef',
    glow: 'rgba(217,70,239,0.3)',
  },
];

const HowItWorksSection: React.FC = () => {
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

  const animDurs = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-slow'];

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="py-24 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0a1628 0%, #0d1b2e 100%)' }}
    >
      {/* Background dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className={`text-center mb-16 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How LINCE Works
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            From initial setup to AI-powered insights — get your entire operation running on LINCE in days, not months.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          {/* Horizontal connector (desktop) */}
          <div
            className="hidden lg:block absolute top-[52px] left-[14%] right-[14%] h-px"
            style={{
              background: 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4), rgba(217,70,239,0.4))',
            }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative anim-fade-up ${animDurs[i]} ${isVisible ? 'anim-visible' : ''}`}
            >
              {/* Step indicator (icon + number) */}
              <div className="flex flex-col items-center mb-5">
                <div
                  className="w-[52px] h-[52px] rounded flex items-center justify-center relative z-10 mb-2"
                  style={{
                    color: step.color,
                    background: `${step.color}18`,
                    border: `1.5px solid ${step.color}50`,
                    boxShadow: `0 0 20px ${step.glow}`,
                  }}
                >
                  {step.icon}
                </div>
                <span
                  className="text-[11px] font-bold tracking-[0.15em]"
                  style={{ color: step.color }}
                >
                  STEP {step.number}
                </span>
              </div>

              {/* Card */}
              <div
                className="rounded p-5 border transition-all duration-300 hover:border-opacity-80"
                style={{
                  background: 'rgba(15,30,55,0.7)',
                  borderColor: `${step.color}25`,
                  borderTopColor: step.color,
                  borderTopWidth: '2px',
                }}
              >
                <h3 className="text-white font-semibold text-base mb-3 text-center">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 text-center">{step.description}</p>
                <ul className="space-y-2">
                  {step.detail.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-slate-300 text-xs">
                      <CheckIcon sx={{ fontSize: 13, flexShrink: 0 }} style={{ color: step.color }} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
