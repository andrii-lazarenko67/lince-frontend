import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQItemComponent: React.FC<{ item: FAQItem; animClass: string; index: number }> = ({ item, animClass, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`group border rounded overflow-hidden transition-all duration-300 ${animClass}
        ${open ? 'border-blue-200 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
    >
      <button
        className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors
          ${open ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'}`}
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3 pr-4">
          <span className="text-blue-300 font-bold text-xs tabular-nums flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={`font-medium text-sm sm:text-base ${open ? 'text-blue-900' : 'text-gray-900'}`}>
            {item.question}
          </span>
        </div>
        <div
          className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 transition-colors
            ${open ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
        >
          {open
            ? <RemoveIcon sx={{ fontSize: 16 }} />
            : <AddIcon sx={{ fontSize: 16 }} />
          }
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 border-t border-blue-100 bg-blue-50/30">
          <p className="text-gray-600 text-sm leading-relaxed pt-4">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const faqs = t('landing.faq.items', { returnObjects: true }) as FAQItem[];

  const animClasses = [
    'anim-fade-up anim-duration-fast',
    'anim-fade-up anim-duration-normal',
    'anim-fade-up anim-duration-light-slow',
    'anim-fade-up anim-duration-fast',
    'anim-fade-up anim-duration-normal',
    'anim-fade-up anim-duration-light-slow',
    'anim-fade-up anim-duration-fast',
    'anim-fade-up anim-duration-normal',
    'anim-fade-up anim-duration-light-slow',
    'anim-fade-up anim-duration-fast',
  ].map((c) => `${c} ${isVisible ? 'anim-visible' : ''}`);

  return (
    <section ref={sectionRef} id="faq" className="bg-gray-50 py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <HelpOutlineIcon sx={{ fontSize: 13 }} />
            {t('landing.faq.badge')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('landing.faq.title')}
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            {t('landing.faq.description')}
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <FAQItemComponent key={i} item={faq} animClass={animClasses[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
