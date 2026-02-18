import React, { useRef, useEffect, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is LINCE and who is it for?',
    answer:
      'LINCE is a complete monitoring and inspection management platform for water systems. It is designed for two profiles: End Customers (companies that manage their own water systems like ETE/ETA stations, pools, cooling towers, boilers) and Service Providers (companies that provide water treatment services to multiple clients).',
  },
  {
    question: 'What is the difference between End Customer and Service Provider mode?',
    answer:
      'In End Customer mode, the platform is organized as: Systems → Stages → Records/Inspections/Occurrences. In Service Provider mode, the hierarchy changes to: Client → Systems → Stages → Data. This allows service providers to manage multiple separate client portfolios with strict data isolation. You choose your mode during onboarding.',
  },
  {
    question: 'Can technicians use LINCE in the field on mobile devices?',
    answer:
      'Yes. LINCE is a fully responsive web application that works on any device — desktop, tablet, and smartphone. Technicians can log daily measurements, conduct photo inspections, and report incidents directly from their mobile browser in the field.',
  },
  {
    question: 'How does the AI integration work?',
    answer:
      'LINCE integrates with Claude AI (by Anthropic) to provide intelligent analysis of your operational data. The AI can detect anomalies, identify trends, compare periods, generate smart reports, and answer questions about your data via an interactive chat assistant. AI features are optional and can be enabled with your own API key.',
  },
  {
    question: 'Can I build custom inspection checklists?',
    answer:
      'Yes. LINCE allows you to fully configure your inspection checklists — create custom items for each system or stage, mark them compliant/non-compliant, add comments, and attach photos. Checklist items are configured by managers and reused across inspections.',
  },
  {
    question: 'What types of reports can I generate?',
    answer:
      'LINCE features a "Build Your Own Report" system where you create reusable templates by selecting blocks (branding, monitoring tables, inspection results, incident summaries, photos, digital signatures, attachments). Reports are generated as professional PDFs with your branding and real operational data.',
  },
  {
    question: "Is my clients' data completely isolated in Service Provider mode?",
    answer:
      "Absolutely. Every record, inspection, occurrence, photo, and report in LINCE is tagged with a client_id at the database level. This means Client A's data is completely inaccessible when working in Client B's context. Service provider users can only see clients they have been granted access to.",
  },
  {
    question: 'Can I try LINCE before purchasing?',
    answer:
      'Yes. All plans include a 14-day free trial with full access to all features. No credit card is required to start. You can explore the entire platform, create systems, run inspections, and generate reports during your trial period.',
  },
  {
    question: 'What notifications does LINCE send?',
    answer:
      'LINCE supports email notifications (via SendGrid) and optional SMS for: out-of-range parameter values, inspection deadlines, incident status updates, low product stock alerts, and custom system notifications configured by administrators.',
  },
  {
    question: 'Can multiple technicians use the same account?',
    answer:
      'Yes. LINCE supports multiple users per organization with role-based access: Admin (full platform access), Manager (access to their systems and reports), and Technician (data entry and field operations). User management is available in all Professional and Enterprise plans.',
  },
];

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
        {/* Header */}
        <div className={`text-center mb-14 anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
          <span className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-5">
            <HelpOutlineIcon sx={{ fontSize: 13 }} />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Got Questions? We Have Answers.
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Everything you need to know about LINCE before getting started.
          </p>
        </div>

        <div className="space-y-2.5">
          {faqs.map((faq, i) => (
            <FAQItemComponent key={faq.question} item={faq} animClass={animClasses[i]} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
