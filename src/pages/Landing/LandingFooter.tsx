import React from 'react';
import { useNavigate } from 'react-router-dom';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const footerLinks = {
  Product: [
    { label: 'Features', section: '#modules' },
    { label: 'How It Works', section: '#how-it-works' },
    { label: 'Industries', section: '#industries' },
    { label: 'AI Integration', section: '#ai' },
    { label: 'Pricing', section: '#pricing' },
  ],
  Solutions: [
    { label: 'End Customer', section: '#profiles' },
    { label: 'Service Provider', section: '#service-provider' },
    { label: 'Water Treatment', section: '#industries' },
    { label: 'Swimming Pools', section: '#industries' },
    { label: 'Industrial', section: '#industries' },
  ],
  Modules: [
    { label: 'Daily Monitoring', section: '#modules' },
    { label: 'Inspections', section: '#modules' },
    { label: 'Incidents', section: '#modules' },
    { label: 'Reports', section: '#reports' },
    { label: 'Document Library', section: '#modules' },
  ],
};

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center shadow-lg shadow-blue-500/30">
                <WaterDropIcon sx={{ fontSize: 19, color: 'white' }} />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">LINCE</span>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xs">
              The complete monitoring and inspection management platform for water systems.
              Built for professionals who need reliability, flexibility, and intelligence.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-7">
              <a
                href="mailto:contact@linceresultados.com"
                className="flex items-center gap-2.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
              >
                <EmailIcon sx={{ fontSize: 15 }} />
                <span>contact@linceresultados.com</span>
              </a>
              <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                <LanguageIcon sx={{ fontSize: 15 }} />
                <span>linceresultados.com</span>
              </div>
            </div>

            {/* CTA chip */}
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 px-4 py-2 rounded text-sm font-medium transition-all"
            >
              Start Free Trial
              <ArrowForwardIcon sx={{ fontSize: 14 }} />
            </button>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => scrollTo(link.section)}
                      className="text-slate-500 hover:text-slate-200 text-sm transition-colors text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} LINCE · All rights reserved · Water Systems Management Platform
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
            >
              Sign Up
            </button>
            <span className="text-slate-700 text-xs">PT · EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
