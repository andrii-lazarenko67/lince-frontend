import React from 'react';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LanguageSwitcher from '../LanguageSwitcher';

const features = [
  {
    icon: <AnalyticsIcon sx={{ fontSize: 18, color: '#60a5fa' }} />,
    text: 'Real-time monitoring across all your water systems',
  },
  {
    icon: <CameraAltIcon sx={{ fontSize: 18, color: '#34d399' }} />,
    text: 'Photo-based inspections with custom checklists',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: '#a78bfa' }} />,
    text: 'AI-powered insights and intelligent report generation',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 18, color: '#fbbf24' }} />,
    text: 'Multi-client service provider mode with full data isolation',
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Panel title shown on the left branding column */
  panelTitle?: string;
  panelSubtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  panelTitle = 'Complete Water Systems Management',
  panelSubtitle = 'Monitor, inspect, and manage your water treatment operations with AI-powered intelligence.',
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (desktop only) ─────────────────────── */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0d1b2e 0%, #0f2744 45%, #0a4277 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,1) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,1) 1px,transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 w-fit hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 bg-blue-500 rounded flex items-center justify-center shadow-lg shadow-blue-500/30">
              <WaterDropIcon sx={{ fontSize: 20, color: 'white' }} />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">LINCE</span>
          </button>

          {/* Main copy */}
          <div className="mt-14 flex-1">
            <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-400 px-3 py-1 rounded text-xs font-medium mb-5">
              <AutoAwesomeIcon sx={{ fontSize: 12 }} />
              Trusted by water professionals
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              {panelTitle}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              {panelSubtitle}
            </p>

            {/* Feature list */}
            <ul className="space-y-4">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800/70 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <span className="text-slate-300 text-sm leading-relaxed">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial quote */}
          <div className="mt-10 bg-slate-800/50 border border-slate-700 rounded p-5">
            <p className="text-slate-300 text-sm italic leading-relaxed mb-3">
              "LINCE transformed how we manage our 20+ pool clients. The multi-client mode and
              PDF reports save us hours every week."
            </p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                C
              </div>
              <div>
                <p className="text-white text-xs font-semibold">Carlos M.</p>
                <p className="text-slate-500 text-xs">AquaTech Pool Services</p>
              </div>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-xs">★</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { value: '500+', label: 'Companies' },
              { value: '15k+', label: 'Inspections' },
              { value: '99.9%', label: 'Uptime' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/40 border border-slate-700/60 rounded p-3 text-center">
                <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                <p className="text-slate-500 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 sm:px-10 h-14 bg-white border-b border-gray-200 flex-shrink-0">
          {/* Logo — visible only on mobile (desktop shows left panel) */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex lg:hidden items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <WaterDropIcon sx={{ fontSize: 14, color: 'white' }} />
            </div>
            <span className="font-bold text-gray-900">LINCE</span>
          </button>
          {/* Back to home — visible on desktop where logo is on left panel */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden lg:flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} />
            Back to Home
          </button>

          <LanguageSwitcher />
        </header>

        {/* Form area */}
        <main className="flex-1 flex items-start sm:items-center justify-center px-5 py-10 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-10 py-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} LINCE · All rights reserved</span>
            <div className="flex items-center gap-4">
              {[
                { label: 'Home', path: '/' },
                { label: 'Sign Up', path: '/signup' },
                { label: 'Log In', path: '/login' },
              ].map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => navigate(l.path)}
                  className="hover:text-gray-700 transition-colors"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout;
