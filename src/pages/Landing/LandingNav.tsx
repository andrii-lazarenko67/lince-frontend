import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const navLinkKeys = [
  { labelKey: 'features', href: '#modules' },
  { labelKey: 'howItWorks', href: '#how-it-works' },
  { labelKey: 'industries', href: '#industries' },
  { labelKey: 'ai', href: '#ai' },
  { labelKey: 'pricing', href: '#pricing' },
  { labelKey: 'faq', href: '#faq' },
];

const LandingNav: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight active section in nav
  useEffect(() => {
    const sectionIds = navLinkKeys.map((l) => l.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md ${
        scrolled
          ? 'bg-blue-900/70 border-b border-slate-700/60 shadow-xl shadow-black/30'
          : 'bg-blue-900/10 border-b border-slate-800/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            className="flex items-center gap-2.5 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <img src="/logo.png" alt="LINCE" className="h-16 w-auto bg-white" />
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinkKeys.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <button
                  key={link.labelKey}
                  onClick={() => scrollTo(link.href)}
                  className={`relative px-3.5 py-2 text-sm font-semibold transition-all duration-200 rounded ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-slate-200 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {t(`landing.nav.${link.labelKey}`)}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Desktop CTA + Language Switcher */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center gap-1 mr-1">
              {['pt', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => i18n.changeLanguage(lng)}
                  className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all ${
                    i18n.language === lng
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            <Button
              variant="text"
              onClick={() => navigate('/login')}
              sx={{ color: '#e2e8f0', fontWeight: 600, '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.07)' } }}
            >
              {t('landing.nav.logIn')}
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: '#3b82f6',
                fontWeight: 600,
                px: 2,
                boxShadow: '0 0 20px rgba(59,130,246,0.35)',
                '&:hover': { bgcolor: '#2563eb', boxShadow: '0 0 24px rgba(59,130,246,0.5)' },
              }}
            >
              {t('landing.nav.getStarted')}
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <IconButton
            onClick={() => setMenuOpen((o) => !o)}
            sx={{ color: 'white', display: { md: 'none' } }}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-slate-700/60">
          <div className="px-4 py-4 space-y-1">
            {navLinkKeys.map((link) => {
              const isActive = activeSection === link.href.slice(1);
              return (
                <button
                  key={link.labelKey}
                  onClick={() => scrollTo(link.href)}
                  className={`block w-full text-left px-3 py-2.5 rounded text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-slate-200 hover:text-white hover:bg-white/8'
                  }`}
                >
                  {t(`landing.nav.${link.labelKey}`)}
                </button>
              );
            })}
            <div className="pt-3 flex flex-col gap-2 border-t border-slate-800 mt-2">
              {/* Mobile language switcher */}
              <div className="flex gap-2 px-1 pb-1">
                {['pt', 'en'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => i18n.changeLanguage(lng)}
                    className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${
                      i18n.language === lng
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>
              <Button fullWidth variant="outlined" onClick={() => navigate('/login')}
                sx={{ borderColor: '#334155', color: '#94a3b8', '&:hover': { borderColor: '#475569', color: '#fff' } }}>
                {t('landing.nav.logIn')}
              </Button>
              <Button fullWidth variant="contained" onClick={() => navigate('/signup')}
                sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 600 }}>
                {t('landing.nav.getStarted')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
