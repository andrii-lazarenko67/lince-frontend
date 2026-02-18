import React, { useRef, useEffect, useState } from 'react';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';

const testimonials = [
  {
    quote:
      'LINCE completely transformed how we manage our pool maintenance clients. We went from paper checklists and WhatsApp photos to a professional platform in days. Our clients love the branded PDF reports.',
    author: 'Carlos M.',
    role: 'Owner',
    company: 'AquaTech Pool Services',
    industry: 'Swimming Pool Maintenance',
    rating: 5,
    initials: 'CM',
    accent: '#3b82f6',
  },
  {
    quote:
      'As an ETA station manager, keeping up with regulatory requirements was always stressful. LINCE gives me real-time visibility across all monitoring points and automatically alerts me when parameters go out of range.',
    author: 'Fernanda R.',
    role: 'Operations Manager',
    company: 'Sistema Água Pura',
    industry: 'Water Treatment Station',
    rating: 5,
    initials: 'FR',
    accent: '#10b981',
  },
  {
    quote:
      'The AI insights feature is remarkable. It identified a correlation between chlorine consumption and temperature fluctuations our team never noticed. We reduced chemical costs by 15% in the first month.',
    author: 'Roberto S.',
    role: 'Technical Director',
    company: 'HidroControl',
    industry: 'Industrial Water Treatment',
    rating: 5,
    initials: 'RS',
    accent: '#8b5cf6',
  },
  {
    quote:
      "Being a service provider with 20+ clients, data organization was our biggest challenge. LINCE's multi-client mode is exactly what we needed — each client completely isolated, instant context switching.",
    author: 'Mariana T.',
    role: 'CEO',
    company: 'TratAmbi Environmental Services',
    industry: 'Environmental Services',
    rating: 5,
    initials: 'MT',
    accent: '#f59e0b',
  },
];

const TestimonialsSection: React.FC = () => {
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
    { dir: 'anim-fade-up', dur: 'anim-duration-fast' },
    { dir: 'anim-fade-up', dur: 'anim-duration-normal' },
    { dir: 'anim-fade-up', dur: 'anim-duration-light-slow' },
    { dir: 'anim-fade-up', dur: 'anim-duration-slow' },
  ];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} sx={{ fontSize: 12, color: '#f59e0b' }} />
            ))}
            Customer Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Water Professionals
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            See what our customers say about how LINCE has improved their operations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={t.author}
              className={`group relative bg-white border border-gray-100 rounded p-7 hover:shadow-xl
                transition-all duration-300 overflow-hidden
                ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
            >
              {/* Colored left border accent */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l opacity-70 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to bottom, ${t.accent}, ${t.accent}44)` }}
              />

              {/* Quote icon */}
              <div className="mb-5" style={{ color: `${t.accent}40` }}>
                <FormatQuoteIcon sx={{ fontSize: 44 }} />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <StarIcon key={j} sx={{ fontSize: 15, color: '#fbbf24' }} />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-gray-600 leading-relaxed mb-7 text-[0.93rem] italic">"{t.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div
                  className="w-10 h-10 rounded text-white font-bold text-sm flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent}bb)` }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.author}</p>
                  <p className="text-gray-400 text-xs">{t.role} · {t.company}</p>
                </div>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0"
                  style={{ color: t.accent, background: `${t.accent}12`, border: `1px solid ${t.accent}25` }}
                >
                  {t.industry}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
