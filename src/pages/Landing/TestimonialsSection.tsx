import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const testimonialMeta = [
  { avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   accent: '#3b82f6' },
  { avatar: 'https://randomuser.me/api/portraits/women/44.jpg', accent: '#10b981' },
  { avatar: 'https://randomuser.me/api/portraits/men/55.jpg',   accent: '#8b5cf6' },
  { avatar: 'https://randomuser.me/api/portraits/women/67.jpg', accent: '#f59e0b' },
  { avatar: 'https://randomuser.me/api/portraits/men/23.jpg',   accent: '#ef4444' },
  { avatar: 'https://randomuser.me/api/portraits/women/12.jpg', accent: '#0d9488' },
  { avatar: 'https://randomuser.me/api/portraits/men/78.jpg',   accent: '#f97316' },
  { avatar: 'https://randomuser.me/api/portraits/women/88.jpg', accent: '#d946ef' },
];

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [paused, setPaused] = useState(false);

  const testimonials = t('landing.testimonials.items', { returnObjects: true }) as {
    quote: string; author: string; role: string; company: string; industry: string;
  }[];

  const N = testimonials.length;

  // Clamp to valid range
  const max = Math.max(0, N - visibleCount);

  // Intersection observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Responsive visible count
  useEffect(() => {
    const update = () => {
      setVisibleCount(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Clamp current index when visibleCount changes
  useEffect(() => {
    setCurrent(c => Math.min(c, Math.max(0, N - visibleCount)));
  }, [visibleCount, N]);

  // Auto-play
  useEffect(() => {
    if (paused || !isVisible) return;
    const id = setInterval(() => {
      setCurrent(c => (c >= max ? 0 : c + 1));
    }, 4000);
    return () => clearInterval(id);
  }, [paused, max, isVisible]);

  const next = useCallback(() => setCurrent(c => (c >= max ? 0 : c + 1)), [max]);
  const prev = useCallback(() => setCurrent(c => (c <= 0 ? max : c - 1)), [max]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <section ref={sectionRef} className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
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

        {/* Carousel wrapper */}
        <div className={`relative anim-fade-up anim-duration-light-slow ${isVisible ? 'anim-visible' : ''}`}>

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
              flex items-center justify-center text-gray-500
              hover:text-gray-900 hover:shadow-lg hover:border-gray-300
              transition-all duration-200"
          >
            <ChevronLeftIcon sx={{ fontSize: 22 }} />
          </button>

          {/* Overflow container */}
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Track — width = N/visibleCount × 100% of container */}
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                width: `${(N / visibleCount) * 100}%`,
                transform: `translateX(calc(-${current} * 100% / ${N}))`,
              }}
            >
              {testimonials.map((item, i) => {
                const meta = testimonialMeta[i % testimonialMeta.length];
                return (
                  <div
                    key={i}
                    style={{ width: `${100 / N}%` }}
                    className="px-2.5 box-border"
                  >
                    {/* Card */}
                    <div className="group relative bg-white border border-gray-100 rounded-lg p-6
                      hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">

                      {/* Colored left accent */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l
                          opacity-60 group-hover:opacity-100 transition-opacity"
                        style={{ background: `linear-gradient(to bottom, ${meta.accent}, ${meta.accent}44)` }}
                      />

                      {/* Quote icon */}
                      <div className="mb-3" style={{ color: `${meta.accent}35` }}>
                        <FormatQuoteIcon sx={{ fontSize: 38 }} />
                      </div>

                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <StarIcon key={j} sx={{ fontSize: 13, color: '#fbbf24' }} />
                        ))}
                      </div>

                      {/* Quote text */}
                      <p className="text-gray-600 text-sm leading-relaxed italic flex-1 mb-5">
                        "{item.quote}"
                      </p>

                      {/* Industry tag */}
                      <span
                        className="self-start text-[10px] font-semibold uppercase tracking-wider
                          px-2 py-0.5 rounded mb-4"
                        style={{
                          color: meta.accent,
                          background: `${meta.accent}12`,
                          border: `1px solid ${meta.accent}25`,
                        }}
                      >
                        {item.industry}
                      </span>

                      {/* Author row */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <img
                          src={meta.avatar}
                          alt={item.author}
                          className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                          style={{ border: `2px solid ${meta.accent}40` }}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{item.author}</p>
                          <p className="text-gray-400 text-xs truncate">{item.role} · {item.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next"
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-white border border-gray-200 shadow-md
              flex items-center justify-center text-gray-500
              hover:text-gray-900 hover:shadow-lg hover:border-gray-300
              transition-all duration-200"
          >
            <ChevronRightIcon sx={{ fontSize: 22 }} />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center items-center gap-1.5 mt-8">
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-gray-800'
                  : 'w-1.5 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
