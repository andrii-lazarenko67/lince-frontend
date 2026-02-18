import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SpeedIcon from '@mui/icons-material/Speed';

const chartBars = [42, 67, 55, 80, 72, 90, 63, 78, 85, 70, 88, 95];
const linePoints = [30, 45, 38, 60, 52, 75, 68, 82, 71, 88, 79, 92];

const featureIcons = [
  <AnalyticsIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
  <NotificationsActiveIcon sx={{ fontSize: 28, color: '#f59e0b' }} />,
  <CompareArrowsIcon sx={{ fontSize: 28, color: '#10b981' }} />,
  <SpeedIcon sx={{ fontSize: 28, color: '#8b5cf6' }} />,
];

const MonitoringSection: React.FC = () => {
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

  const features = t('landing.monitoring.features', { returnObjects: true }) as { title: string; desc: string }[];
  const animDirs = ['anim-fade-up', 'anim-fade-left', 'anim-fade-up', 'anim-fade-left'];
  const animDurs = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-slow'];

  return (
    <section ref={sectionRef} className="bg-slate-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <AnalyticsIcon sx={{ fontSize: 13 }} />
            {t('landing.monitoring.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('landing.monitoring.title')}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t('landing.monitoring.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Chart mockup */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <div className="bg-slate-800 border border-slate-700 rounded p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-slate-400 text-xs">{t('landing.monitoring.chartTitle')}</p>
                  <p className="text-white font-semibold">{t('landing.monitoring.chartSubtitle')}</p>
                </div>
                <div className="flex gap-2">
                  {['1W', '1M', '3M', '1Y'].map((p, i) => (
                    <button
                      key={p}
                      className={`text-xs px-2 py-1 rounded ${i === 3 ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative mt-4 h-40">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${linePoints.map((v, i) => `${(i / (linePoints.length - 1)) * 360},${160 - (v / 100) * 150}`).join(' ')} 360,160 0,160`}
                    fill="url(#areaGrad)"
                  />
                  <polyline
                    points={linePoints.map((v, i) => `${(i / (linePoints.length - 1)) * 360},${160 - (v / 100) * 150}`).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 h-full px-1">
                  {chartBars.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm opacity-40 ${i === 11 ? 'bg-blue-400 opacity-70' : 'bg-blue-500/30'}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                  <p className="text-white font-bold">1.8</p>
                  <p className="text-slate-400 text-xs">{t('landing.monitoring.avgPpm')}</p>
                </div>
                <div className="text-center">
                  <p className="text-emerald-400 font-bold">{t('landing.monitoring.normal')}</p>
                  <p className="text-slate-400 text-xs">{t('landing.monitoring.status')}</p>
                </div>
                <div className="text-center">
                  <p className="text-amber-400 font-bold">2</p>
                  <p className="text-slate-400 text-xs">{t('landing.monitoring.alerts')}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded p-4 flex items-start gap-3">
              <NotificationsActiveIcon sx={{ fontSize: 20, color: '#f59e0b', flexShrink: 0 }} />
              <div>
                <p className="text-amber-300 font-semibold text-sm">{t('landing.monitoring.alertTitle')}</p>
                <p className="text-amber-400/70 text-xs">{t('landing.monitoring.alertDesc')}</p>
              </div>
            </div>
          </div>

          {/* Right: Feature list */}
          <div className="space-y-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-start gap-5 ${animDirs[i]} ${animDurs[i]} ${isVisible ? 'anim-visible' : ''}`}
              >
                <div className="w-14 h-14 bg-slate-800 border border-slate-700 rounded flex items-center justify-center flex-shrink-0">
                  {featureIcons[i]}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg mb-1">{f.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonitoringSection;
