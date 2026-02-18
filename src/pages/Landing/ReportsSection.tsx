import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const reportBlocks = [
  { icon: <BrandingWatermarkIcon sx={{ fontSize: 18, color: '#3b82f6' }} />, label: 'Branding & Logo' },
  { icon: <TableChartIcon sx={{ fontSize: 18, color: '#10b981' }} />, label: 'Monitoring Tables' },
  { icon: <PhotoLibraryIcon sx={{ fontSize: 18, color: '#f59e0b' }} />, label: 'Inspection Photos' },
  { icon: <DragIndicatorIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />, label: 'Occurrences List' },
  { icon: <DrawIcon sx={{ fontSize: 18, color: '#ef4444' }} />, label: 'Digital Signature' },
  { icon: <AttachFileIcon sx={{ fontSize: 18, color: '#0d9488' }} />, label: 'PDF Attachments' },
];

const features = [
  'Drag-and-drop block ordering',
  'Save and reuse report templates',
  'Automatic photo compression',
  'Include charts and trend lines',
  'Multi-system and multi-period filters',
  'Audit trail with user and timestamp',
  'DOCX export option',
  'Download history and versioning',
];

const ReportsSection: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <section ref={sectionRef} id="reports" className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <PictureAsPdfIcon sx={{ fontSize: 13 }} />
            Build Your Own Report
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Professional Reports,{' '}
            <span style={{ color: '#ef4444' }}>Your Way</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Design custom report templates with the blocks you need. Generate branded PDFs
            with real operational data in seconds — not hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Report builder mockup */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <div className="bg-gray-50 border border-gray-200 rounded p-6">
              {/* Template header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-widest">Report Template</p>
                  <h4 className="text-gray-900 font-semibold">Monthly Pool Maintenance Report</h4>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded">Service Provider</span>
              </div>

              {/* Block list (mock drag-and-drop) */}
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">Report Blocks (drag to reorder)</p>
              <div className="space-y-2 mb-5">
                {reportBlocks.map((block, i) => (
                  <div
                    key={block.label}
                    className={`flex items-center gap-3 bg-white border border-gray-200 rounded px-3 py-2.5
                      anim-fade-right anim-duration-${['fast', 'normal', 'light-slow', 'normal', 'fast', 'light-slow'][i]}
                      ${isVisible ? 'anim-visible' : ''}`}
                  >
                    <DragIndicatorIcon sx={{ fontSize: 16, color: '#d1d5db', cursor: 'grab' }} />
                    <span className="flex items-center gap-2 flex-1 text-sm text-gray-700">
                      {block.icon}
                      {block.label}
                    </span>
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-blue-500" />
                  </div>
                ))}
              </div>

              {/* Generate button mockup */}
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-100 rounded px-3 py-2 text-gray-400 text-sm border border-gray-200">
                  Client: Condominium Paradise
                </div>
                <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded flex items-center gap-2 transition-colors">
                  <PictureAsPdfIcon sx={{ fontSize: 16 }} />
                  Generate PDF
                </button>
              </div>
            </div>
          </div>

          {/* Right: Features */}
          <div className={`anim-fade-left anim-duration-light-slow ${isVisible ? 'anim-visible' : ''}`}>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              From Template to PDF in One Click
            </h3>
            <p className="text-gray-500 mb-6 leading-relaxed">
              LINCE's report builder lets you create reusable templates for every report type —
              monthly visits, inspections, incident summaries, water analysis — then generate
              them instantly with real data from your systems.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
              {features.map((f) => (
                <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
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
              Try Report Builder
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportsSection;
