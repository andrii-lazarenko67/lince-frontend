import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedIcon from '@mui/icons-material/Verified';

const statsBase = [
  { value: 500, suffix: '+', labelKey: 'companies', descKey: 'companiesDesc', icon: <BusinessIcon sx={{ fontSize: 26 }} />, color: '#3b82f6', glow: 'rgba(59,130,246,0.3)' },
  { value: 15000, suffix: '+', labelKey: 'inspections', descKey: 'inspectionsDesc', icon: <AssignmentTurnedInIcon sx={{ fontSize: 26 }} />, color: '#10b981', glow: 'rgba(16,185,129,0.3)' },
  { value: 80000, suffix: '+', labelKey: 'records', descKey: 'recordsDesc', icon: <StorageIcon sx={{ fontSize: 26 }} />, color: '#8b5cf6', glow: 'rgba(139,92,246,0.3)' },
  { value: 99.9, suffix: '%', labelKey: 'uptime', descKey: 'uptimeDesc', icon: <VerifiedIcon sx={{ fontSize: 26 }} />, color: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
];

const useCounter = (target: number, isVisible: boolean, duration = 1800) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(parseFloat(current.toFixed(1)));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
};

interface StatCardProps {
  stat: typeof statsBase[0];
  label: string;
  description: string;
  isVisible: boolean;
  delay: string;
}

const StatCard: React.FC<StatCardProps> = ({ stat, label, description, isVisible, delay }) => {
  const count = useCounter(stat.value, isVisible);
  return (
    <div className={`relative text-center group anim-fade-up ${delay} ${isVisible ? 'anim-visible' : ''}`}>
      <div
        className="w-14 h-14 rounded mx-auto mb-5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
        style={{
          color: stat.color,
          background: `radial-gradient(circle, ${stat.glow} 0%, rgba(0,0,0,0) 70%)`,
          boxShadow: `0 0 20px ${stat.glow}`,
          border: `1px solid ${stat.color}33`,
        }}
      >
        {stat.icon}
      </div>
      <div className="text-5xl font-extrabold text-white mb-2 leading-none tabular-nums">
        {stat.value < 100 ? count.toFixed(1) : Math.round(count).toLocaleString()}
        <span style={{ color: stat.color }}>{stat.suffix}</span>
      </div>
      <div className="text-base font-semibold text-slate-200 mb-1.5">{label}</div>
      <div className="text-slate-500 text-sm leading-relaxed max-w-[180px] mx-auto">{description}</div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delays = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-slow'];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0d1b2e 0%, #0a1628 100%)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 divide-y-0">
          {statsBase.map((stat, i) => (
            <StatCard
              key={stat.labelKey}
              stat={stat}
              label={t(`landing.stats.${stat.labelKey}`)}
              description={t(`landing.stats.${stat.descKey}`)}
              isVisible={isVisible}
              delay={delays[i]}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
