import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const footerLinks = {
    [t('landing.footer.columns.product')]: [
      { label: t('landing.footer.links.product.features'), section: '#modules' },
      { label: t('landing.footer.links.product.howItWorks'), section: '#how-it-works' },
      { label: t('landing.footer.links.product.industries'), section: '#industries' },
      { label: t('landing.footer.links.product.aiIntegration'), section: '#ai' },
      { label: t('landing.footer.links.product.pricing'), section: '#pricing' },
    ],
    [t('landing.footer.columns.solutions')]: [
      { label: t('landing.footer.links.solutions.endCustomer'), section: '#profiles' },
      { label: t('landing.footer.links.solutions.serviceProvider'), section: '#service-provider' },
      { label: t('landing.footer.links.solutions.waterTreatment'), section: '#industries' },
      { label: t('landing.footer.links.solutions.swimmingPools'), section: '#industries' },
      { label: t('landing.footer.links.solutions.industrial'), section: '#industries' },
    ],
    [t('landing.footer.columns.modules')]: [
      { label: t('landing.footer.links.modules.dailyMonitoring'), section: '#modules' },
      { label: t('landing.footer.links.modules.inspections'), section: '#modules' },
      { label: t('landing.footer.links.modules.incidents'), section: '#modules' },
      { label: t('landing.footer.links.modules.reports'), section: '#reports' },
      { label: t('landing.footer.links.modules.documentLibrary'), section: '#modules' },
    ],
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
              {t('landing.footer.description')}
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
              {t('landing.footer.startFreeTrial')}
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
            © {new Date().getFullYear()} LINCE · {t('landing.footer.copyright')}
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
            >
              {t('landing.footer.logIn')}
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-slate-600 hover:text-slate-300 text-xs transition-colors"
            >
              {t('landing.footer.signUp')}
            </button>
            <div className="flex items-center gap-1">
              {['pt', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => i18n.changeLanguage(lng)}
                  className={`px-2 py-1 rounded text-xs font-bold uppercase transition-all ${
                    i18n.language === lng
                      ? 'bg-white/10 text-slate-300'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
