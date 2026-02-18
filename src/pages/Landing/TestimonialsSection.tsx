import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';

const testimonialMeta = [
  { initials: 'CM', accent: '#3b82f6', rating: 5 },
  { initials: 'FR', accent: '#10b981', rating: 5 },
  { initials: 'RS', accent: '#8b5cf6', rating: 5 },
  { initials: 'MT', accent: '#f59e0b', rating: 5 },
];

const animCombos = [
  { dir: 'anim-fade-up', dur: 'anim-duration-fast' },
  { dir: 'anim-fade-up', dur: 'anim-duration-normal' },
  { dir: 'anim-fade-up', dur: 'anim-duration-light-slow' },
  { dir: 'anim-fade-up', dur: 'anim-duration-slow' },
];

const TestimonialsSection: React.FC = () => {
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

  const testimonials = t('landing.testimonials.items', { returnObjects: true }) as {
    quote: string; author: string; role: string; company: string; industry: string;
  }[];

  return (
    <section ref={sectionRef} className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} sx={{ fontSize: 12, color: '#f59e0b' }} />
            ))}
            {t('landing.testimonials.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            {t('landing.testimonials.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {testimonials.map((item, i) => {
            const meta = testimonialMeta[i];
            return (
              <div
                key={i}
                className={`group relative bg-white border border-gray-100 rounded p-7 hover:shadow-xl
                  transition-all duration-300 overflow-hidden
                  ${animCombos[i].dir} ${animCombos[i].dur} ${isVisible ? 'anim-visible' : ''}`}
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(to bottom, ${meta.accent}, ${meta.accent}44)` }}
                />
                <div className="mb-5" style={{ color: `${meta.accent}40` }}>
                  <FormatQuoteIcon sx={{ fontSize: 44 }} />
                </div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: meta.rating }).map((_, j) => (
                    <StarIcon key={j} sx={{ fontSize: 15, color: '#fbbf24' }} />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-7 text-[0.93rem] italic">"{item.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div
                    className="w-10 h-10 rounded text-white font-bold text-sm flex items-center justify-center flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}bb)` }}
                  >
                    {meta.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.author}</p>
                    <p className="text-gray-400 text-xs">{item.role} · {item.company}</p>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded flex-shrink-0"
                    style={{ color: meta.accent, background: `${meta.accent}12`, border: `1px solid ${meta.accent}25` }}
                  >
                    {item.industry}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
