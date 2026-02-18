import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import TableChartIcon from '@mui/icons-material/TableChart';
import DrawIcon from '@mui/icons-material/Draw';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import BrandingWatermarkIcon from '@mui/icons-material/BrandingWatermark';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';

const blockIcons = [
  <BrandingWatermarkIcon sx={{ fontSize: 18, color: '#3b82f6' }} />,
  <TableChartIcon sx={{ fontSize: 18, color: '#10b981' }} />,
  <PhotoLibraryIcon sx={{ fontSize: 18, color: '#f59e0b' }} />,
  <DragIndicatorIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />,
  <DrawIcon sx={{ fontSize: 18, color: '#ef4444' }} />,
  <AttachFileIcon sx={{ fontSize: 18, color: '#0d9488' }} />,
];

const blockAnimDurs = ['fast', 'normal', 'light-slow', 'normal', 'fast', 'light-slow'];

const ReportsSection: React.FC = () => {
  const navigate = useNavigate();
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

  const blocks = t('landing.reports.blocks', { returnObjects: true }) as string[];
  const features = t('landing.reports.features', { returnObjects: true }) as string[];

  return (
    <section ref={sectionRef} id="reports" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <PictureAsPdfIcon sx={{ fontSize: 13 }} />
            {t('landing.reports.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.reports.title')}{' '}
            <span style={{ color: '#ef4444' }}>{t('landing.reports.titleHighlight')}</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t('landing.reports.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Report builder mockup */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <div className="bg-gray-50 border border-gray-200 rounded p-6">
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">{t('landing.reports.templateLabel')}</p>
                  <h4 className="text-gray-900 font-semibold">{t('landing.reports.templateTitle')}</h4>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">{t('landing.reports.serviceProviderBadge')}</span>
              </div>

              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">{t('landing.reports.blocksLabel')}</p>
              <div className="space-y-2 mb-5">
                {blocks.map((label, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2.5
                      anim-fade-right anim-duration-${blockAnimDurs[i]}
                      ${isVisible ? 'anim-visible' : ''}`}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16, color: '#d1d5db', cursor: 'grab' }} />
                    <span className="flex items-center gap-2 flex-1 text-sm text-gray-700">
                      {blockIcons[i]}
                      {label}
                    </span>
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-blue-500" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1 bg-gray-100 rounded px-3 py-2 text-gray-400 text-sm border border-gray-200">
                  {t('landing.reports.clientLabel')}
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-2 transition-colors">
                  <PictureAsPdfIcon sx={{ fontSize: 16 }} />
                  {t('landing.reports.generatePdf')}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className={`anim-fade-left anim-duration-light-slow ${isVisible ? 'anim-visible' : ''}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('landing.reports.featureTitle')}
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              {t('landing.reports.featureDescription')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckIcon sx={{ fontSize: 16, color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                  {f}
                </div>
              ))}
            </div>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/signup')}
              sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}
            >
              {t('landing.reports.cta')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportsSection;
