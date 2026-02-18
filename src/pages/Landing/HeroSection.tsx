import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WaterIcon from '@mui/icons-material/Water';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const badges = [
  { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'No credit card required' },
  { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Free 14-day trial' },
  { icon: <CheckCircleIcon sx={{ fontSize: 14 }} />, label: 'Full access to all modules' },
];

const mockStats = [
  { label: 'Systems Online', value: '3', icon: <WaterIcon sx={{ fontSize: 18, color: '#34d399' }} />, accent: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.25)' },
  { label: "Today's Records", value: '28', icon: <AnalyticsIcon sx={{ fontSize: 18, color: '#60a5fa' }} />, accent: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
  { label: 'Active Alerts', value: '2', icon: <HealthAndSafetyIcon sx={{ fontSize: 18, color: '#fbbf24' }} />, accent: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
  { label: 'AI Insights', value: '5', icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: '#a78bfa' }} />, accent: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
];

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = heroRef.current;
      if (!el) return;
      el.querySelectorAll<HTMLElement>('[data-hero-anim]').forEach((item) => {
        item.classList.add('anim-visible');
      });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="landing-hero-bg min-h-screen flex items-center relative overflow-hidden pt-16">
      {/* Background layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial glow blobs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-700/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-teal-700/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-900/25 rounded-full blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(99,179,237,0.12) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Subtle diagonal lines */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Text */}
          <div ref={heroRef}>
            {/* Badge */}
            <div
              data-hero-anim
              className="anim-fade-up anim-duration-fast inline-flex items-center gap-2 mb-7"
            >
              <span className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-3.5 py-1.5 rounded text-sm font-medium">
                <AutoAwesomeIcon sx={{ fontSize: 13 }} />
                AI-Powered Water Systems Platform
              </span>
            </div>

            {/* Headline */}
            <div data-hero-anim className="anim-fade-up anim-duration-normal">
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-extrabold text-white leading-[1.08] mb-6 tracking-tight">
                Complete{' '}
                <span className="relative inline-block">
                  <span className="gradient-text">Monitoring</span>
                </span>
                <br />
                &amp;{' '}
                <span className="gradient-text">Inspection</span>
                <br />
                <span className="text-slate-300 font-bold text-3xl sm:text-4xl lg:text-[2.5rem]">Platform for Water Systems</span>
              </h1>
            </div>

            <p
              data-hero-anim
              className="anim-fade-up anim-duration-light-slow text-slate-400 text-lg leading-relaxed mb-9 max-w-lg"
            >
              LINCE empowers water treatment companies to manage systems, log field data,
              conduct inspections, track incidents, and generate AI-powered reports — all
              in one place.
            </p>

            {/* CTAs */}
            <div
              data-hero-anim
              className="anim-fade-up anim-duration-slow flex flex-col sm:flex-row gap-3 mb-9"
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/signup')}
                sx={{
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb', boxShadow: '0 0 28px rgba(59,130,246,0.55)' },
                  px: 3.5,
                  py: 1.6,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 0 20px rgba(59,130,246,0.4), 0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s',
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<PlayCircleOutlineIcon />}
                onClick={() => navigate('/login')}
                sx={{
                  borderColor: 'rgba(148,163,184,0.3)',
                  color: '#cbd5e1',
                  '&:hover': { borderColor: 'rgba(148,163,184,0.6)', bgcolor: 'rgba(255,255,255,0.06)', color: '#fff' },
                  px: 3.5,
                  py: 1.6,
                  fontSize: '1rem',
                }}
              >
                View Demo
              </Button>
            </div>

            {/* Trust badges */}
            <div
              data-hero-anim
              className="anim-fade-up anim-duration-very-slow flex flex-wrap gap-5"
            >
              {badges.map((b, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <span className="text-emerald-400">{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mock Dashboard */}
          <div className="mt-4 lg:mt-0 px-6 sm:px-10 lg:px-0">
            <div className="relative pt-5 pb-5">
              {/* Glow ring behind card */}
              <div className="absolute inset-0 bg-blue-500/10 rounded blur-2xl scale-105 pointer-events-none" />

              {/* Card */}
              <div className="relative bg-slate-800/70 backdrop-blur-sm border border-slate-700/70 rounded p-6 shadow-2xl">
                {/* Card header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-slate-500 text-[11px] uppercase tracking-widest font-medium">Manager Dashboard</p>
                    <h3 className="text-white font-semibold text-base mt-0.5">ETA Station — Unit A</h3>
                  </div>
                  <span className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                    Live
                  </span>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2.5 mb-5">
                  {mockStats.map((s, i) => (
                    <div
                      key={i}
                      className="rounded p-3 flex items-center gap-3"
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      {s.icon}
                      <div>
                        <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                        <p className="text-slate-400 text-[11px] mt-0.5">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="mb-5 bg-slate-900/50 rounded p-3">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-slate-400 text-xs font-medium">Chlorine Level (ppm) — Last 7 days</span>
                    <span className="text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-0.5 rounded">Normal</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-14">
                    {[65, 72, 68, 80, 74, 70, 78].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          background: i === 6
                            ? 'linear-gradient(to top, #3b82f6, #60a5fa)'
                            : 'rgba(59,130,246,0.3)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i} className="flex-1 text-center text-slate-600 text-[10px]">{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="space-y-2.5">
                  <p className="text-slate-500 text-[11px] uppercase tracking-widest font-medium">Recent Activity</p>
                  {[
                    { label: 'Inspection completed', time: '2h ago', color: '#60a5fa' },
                    { label: 'pH alert resolved', time: '4h ago', color: '#34d399' },
                    { label: 'New daily log added', time: '6h ago', color: '#a78bfa' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                      <span className="text-slate-300 flex-1 text-xs">{item.label}</span>
                      <span className="text-slate-500 text-[11px]">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating chips */}
              <div className="absolute -top-3.5 -right-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg shadow-purple-500/30 flex items-center gap-1.5">
                <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                AI Insights Active
              </div>
              <div className="absolute -bottom-3.5 -left-3.5 bg-slate-800 border border-slate-600/80 text-white text-xs px-3 py-1.5 rounded shadow-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-slate-300">3 Systems Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom trusted-by strip */}
        <div className="mt-20 pt-10 border-t border-slate-800/60">
          <p className="text-center text-slate-500 text-xs uppercase tracking-widest font-medium mb-6">
            Trusted by water management professionals across industries
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {['ETE Stations', 'ETA Facilities', 'Swimming Pools', 'Cooling Towers', 'Boiler Systems', 'Wastewater Plants'].map((name) => (
              <span key={name} className="text-slate-500 hover:text-slate-300 transition-colors font-medium text-sm">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
