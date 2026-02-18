import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import SummarizeIcon from '@mui/icons-material/Summarize';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TimelineIcon from '@mui/icons-material/Timeline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const aiFeatures = [
  {
    icon: <TrendingUpIcon sx={{ fontSize: 20 }} />,
    title: 'Trend Analysis',
    desc: 'Detect patterns across days, weeks, and months to predict equipment behavior and prevent failures.',
    color: '#a78bfa',
  },
  {
    icon: <SearchIcon sx={{ fontSize: 20 }} />,
    title: 'Anomaly Detection',
    desc: 'AI flags values outside expected ranges automatically, even across multiple systems simultaneously.',
    color: '#60a5fa',
  },
  {
    icon: <SummarizeIcon sx={{ fontSize: 20 }} />,
    title: 'Intelligent Reports',
    desc: 'Generate detailed reports with AI-written summaries, observations, and operational recommendations.',
    color: '#34d399',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 20 }} />,
    title: 'Smart Suggestions',
    desc: 'Context-aware suggestions based on current data — dosage adjustments, maintenance alerts, process improvements.',
    color: '#fbbf24',
  },
  {
    icon: <TimelineIcon sx={{ fontSize: 20 }} />,
    title: 'Cross-Period Comparison',
    desc: 'Compare parameters across periods, systems, and monitoring points to understand operational variations.',
    color: '#f87171',
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />,
    title: 'AI Chat Assistant',
    desc: 'Ask questions about your data in natural language and get instant, context-aware answers.',
    color: '#d946ef',
  },
];

const AISection: React.FC = () => {
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

  const animDirs = ['anim-fade-up', 'anim-zoom-in', 'anim-fade-left', 'anim-fade-up', 'anim-zoom-in', 'anim-fade-left'];
  const animDurs = ['anim-duration-fast', 'anim-duration-normal', 'anim-duration-light-slow', 'anim-duration-normal', 'anim-duration-fast', 'anim-duration-slow'];

  return (
    <section ref={sectionRef} id="ai" className="bg-white py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: Content */}
          <div className={`anim-fade-right anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}>
            <span className="inline-flex items-center gap-2 bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-600 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider mb-6">
              <AutoAwesomeIcon sx={{ fontSize: 13 }} />
              Claude AI Integration
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-tight">
              AI That Understands Your{' '}
              <span style={{ color: '#d946ef' }}>Water Systems</span>
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-5">
              LINCE integrates with Claude AI (Anthropic) to provide intelligent analysis of your operational data.
              The AI understands the context of water treatment and provides meaningful, actionable insights
              — not just generic statistics.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 border-l-2 border-fuchsia-200 pl-4">
              AI features are fully optional and work seamlessly alongside the core platform. Add AI capabilities
              any time as your needs grow — with your own API key.
            </p>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/signup')}
              sx={{
                bgcolor: '#d946ef',
                '&:hover': { bgcolor: '#c026d3', boxShadow: '0 0 20px rgba(217,70,239,0.4)' },
                fontWeight: 600,
                px: 3,
                py: 1.25,
              }}
            >
              Try AI Features Free
            </Button>
          </div>

          {/* Right: Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {aiFeatures.map((f, i) => (
              <div
                key={f.title}
                className={`group p-5 border border-gray-100 rounded hover:shadow-md transition-all duration-300 overflow-hidden relative
                  ${animDirs[i]} ${animDurs[i]} ${isVisible ? 'anim-visible' : ''}`}
              >
                {/* Top accent on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${f.color}, ${f.color}55)` }}
                />

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                    style={{ color: f.color, background: `${f.color}15`, border: `1px solid ${f.color}25` }}
                  >
                    {f.icon}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm">{f.title}</h4>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat mockup */}
        <div
          className={`mt-16 rounded overflow-hidden border border-slate-700/60 shadow-2xl
            anim-fade-up anim-duration-normal ${isVisible ? 'anim-visible' : ''}`}
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/50">
            <div className="w-9 h-9 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
              <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">LINCE AI Assistant</p>
              <p className="text-slate-400 text-xs">Powered by Claude · Context-aware for your water systems</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Active
            </span>
          </div>

          {/* Chat messages */}
          <div className="px-6 py-6 space-y-5">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white text-sm px-4 py-2.5 rounded max-w-sm shadow-lg">
                What were the chlorine levels last week and are they within the normal range?
              </div>
            </div>

            {/* AI response */}
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-600 to-purple-600 rounded flex-shrink-0 flex items-center justify-center">
                <AutoAwesomeIcon sx={{ fontSize: 14, color: 'white' }} />
              </div>
              <div
                className="text-slate-200 text-sm px-5 py-4 rounded leading-relaxed border border-slate-700/50"
                style={{ background: 'rgba(30,27,75,0.6)' }}
              >
                Based on your ETA Unit A records from last week, chlorine levels averaged{' '}
                <strong className="text-white">1.8 ppm</strong> (range: 1.4–2.3 ppm).
                All readings were within the configured normal range of{' '}
                <strong className="text-white">1.0–3.0 ppm</strong>.{' '}
                However, I noticed a slight downward trend on Thursday and Friday —{' '}
                <span className="text-amber-300">I recommend checking the chlorinator dosage settings</span>{' '}
                to ensure levels stay above 1.5 ppm during peak hours.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
