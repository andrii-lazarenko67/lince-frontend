import React, { useRef, useEffect, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import HistoryIcon from '@mui/icons-material/History';
import StorageIcon from '@mui/icons-material/Storage';
import GppGoodIcon from '@mui/icons-material/GppGood';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const securityItems = [
  {
    icon: <LockIcon sx={{ fontSize: 22 }} />,
    title: 'SSL / HTTPS Everywhere',
    desc: 'All data transmitted between your browser and our servers is encrypted with SSL/TLS.',
    color: '#3b82f6',
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 22 }} />,
    title: 'Client Data Isolation',
    desc: 'In service provider mode, every record includes client_id to prevent cross-client data leakage.',
    color: '#10b981',
  },
  {
    icon: <ManageAccountsIcon sx={{ fontSize: 22 }} />,
    title: 'Role-Based Access Control',
    desc: 'Admin, Manager, and Technician roles each have specific permissions — users only see what they are authorized for.',
    color: '#8b5cf6',
  },
  {
    icon: <HistoryIcon sx={{ fontSize: 22 }} />,
    title: 'Full Audit Trail',
    desc: 'Every generated report stores the user, date, applied filters, and template version for complete auditability.',
    color: '#f59e0b',
  },
  {
    icon: <StorageIcon sx={{ fontSize: 22 }} />,
    title: 'Secure Media Storage',
    desc: 'All photos and documents are stored on Cloudinary with access controls, compression, and CDN delivery.',
    color: '#ef4444',
  },
  {
    icon: <GppGoodIcon sx={{ fontSize: 22 }} />,
    title: 'JWT Authentication',
    desc: 'Secure JSON Web Token authentication with session management and automatic expiration controls.',
    color: '#0d9488',
  },
];

const SecuritySection: React.FC = () => {
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

  const animCombos = [
    { dir: 'anim-fade-right', dur: 'anim-duration-fast' },
    { dir: 'anim-fade-up', dur: 'anim-duration-normal' },
    { dir: 'anim-fade-left', dur: 'anim-duration-light-slow' },
    { dir: 'anim-fade-right', dur: 'anim-duration-normal' },
    { dir: 'anim-fade-up', dur: 'anim-duration-fast' },
    { dir: 'anim-fade-left', dur: 'anim-duration-slow' },
  ];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Content */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <span className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-6">
              <ShieldIcon sx={{ fontSize: 13 }} />
              Security &amp; Compliance
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              Your Data is{' '}
              <span className="text-emerald-600">Safe with LINCE</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-5">
              Water treatment data is critical. LINCE is built with security as a
              foundational requirement — not an afterthought.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 border-l-2 border-emerald-200 pl-4">
              From SSL encryption to role-based access control and complete audit trails,
              every aspect of the platform is designed to protect your operational data
              and meet regulatory requirements.
            </p>

            {/* Trust stat badges */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { label: 'SSL/TLS', sub: 'Encrypted' },
                { label: 'RBAC', sub: 'Access Control' },
                { label: 'Audit', sub: 'Full Trail' },
              ].map((b) => (
                <div
                  key={b.label}
                  className="bg-emerald-50 border border-emerald-100 rounded p-3 text-center"
                >
                  <div className="text-emerald-800 font-bold text-sm">{b.label}</div>
                  <div className="text-emerald-600 text-xs mt-0.5">{b.sub}</div>
                </div>
              ))}
            </div>

            {/* Extra trust line */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
              Built for regulatory compliance in water treatment operations
            </div>
          </div>

          {/* Right: Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {securityItems.map((item, i) => (
              <div
                key={item.title}
                className={`group p-5 border border-gray-100 rounded hover:shadow-md transition-all duration-300 overflow-hidden relative
                  ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
              >
                {/* Colored top stripe on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}55)` }}
                />

                <div
                  className="w-10 h-10 rounded mb-3.5 flex items-center justify-center transition-transform group-hover:scale-110 duration-300"
                  style={{ color: item.color, background: `${item.color}12`, border: `1px solid ${item.color}22` }}
                >
                  {item.icon}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1.5">{item.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
