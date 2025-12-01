import React, { useState, useRef, useEffect } from 'react';

export interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title: string;
  height?: number;
  color?: string;
  showStats?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, height = 220, color = '#3b82f6', showStats = true }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height }}>
          <span className="text-gray-400">No data</span>
        </div>
      </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 35, left: 45 };
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 100);
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const yTicks = [0, Math.round(maxValue * 0.5), maxValue];

  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, ...item };
  });

  const createSmoothPath = (pts: typeof points) => {
    if (pts.length < 2) return `M ${pts[0]?.x || 0} ${pts[0]?.y || 0}`;
    if (pts.length === 2) return `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  const gradientId = `gradient-${color.replace('#', '')}-${Math.random().toString(36).substring(2, 11)}`;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="w-full" ref={containerRef}>
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      {containerWidth > 0 && (
        <div className="relative">
          <svg width={containerWidth} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.25" />
                <stop offset="100%" stopColor={color} stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} fill="#fafafa" rx="4" />
            {yTicks.map((tick, i) => {
              const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray={i === 0 ? "0" : "4,4"} />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" style={{ fontSize: '11px', fill: '#9ca3af' }}>{tick}</text>
                </g>
              );
            })}
            <path d={areaPath} fill={`url(#${gradientId})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => {
              const percentage = total > 0 ? (p.value / total) * 100 : 0;
              const tooltipWidth = 110;
              const tooltipHeight = 58;
              let tooltipX = p.x - tooltipWidth / 2;
              let tooltipY = p.y - tooltipHeight - 12;
              if (tooltipX < padding.left) tooltipX = padding.left;
              if (tooltipX + tooltipWidth > padding.left + chartWidth) tooltipX = padding.left + chartWidth - tooltipWidth;
              if (tooltipY < padding.top) tooltipY = p.y + 15;
              return (
                <g key={i}>
                  {hoveredIndex === i && (
                    <line x1={p.x} y1={padding.top} x2={p.x} y2={padding.top + chartHeight} stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
                  )}
                  <circle cx={p.x} cy={p.y} r="15" fill="transparent" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} style={{ cursor: 'pointer' }} />
                  <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 4} fill="white" stroke={color} strokeWidth="2.5" />
                  {hoveredIndex === i && (
                    <g
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="6" fill="#1f2937" style={{ cursor: 'pointer' }} />
                      <rect x={tooltipX + 8} y={tooltipY + 10} width={10} height={10} rx="2" fill={color} style={{ pointerEvents: 'none' }} />
                      <text x={tooltipX + 24} y={tooltipY + 18} textAnchor="start" style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold', pointerEvents: 'none' }}>{p.label}</text>
                      <text x={tooltipX + 8} y={tooltipY + 34} textAnchor="start" style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}>Value: <tspan fill="white" fontWeight="600">{p.value}</tspan></text>
                      <text x={tooltipX + 8} y={tooltipY + 48} textAnchor="start" style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}>Share: <tspan fill={color} fontWeight="600">{percentage.toFixed(1)}%</tspan></text>
                    </g>
                  )}
                </g>
              );
            })}
            {data.length <= 12 ? points.map((p, i) => (
              <text key={i} x={p.x} y={height - 10} textAnchor="middle" style={{ fontSize: '11px', fill: hoveredIndex === i ? '#374151' : '#9ca3af', fontWeight: hoveredIndex === i ? 600 : 400 }}>{data[i].label}</text>
            )) : (
              <>
                <text x={points[0].x} y={height - 10} textAnchor="start" style={{ fontSize: '11px', fill: '#9ca3af' }}>{data[0]?.label}</text>
                <text x={points[points.length - 1].x} y={height - 10} textAnchor="end" style={{ fontSize: '11px', fill: '#9ca3af' }}>{data[data.length - 1]?.label}</text>
              </>
            )}
          </svg>
        </div>
      )}
      {showStats && (
        <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
          <div className="text-center">
            <span className="text-xs text-gray-500">Total</span>
            <p className="text-sm font-semibold" style={{ color }}>{total}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Average</span>
            <p className="text-sm font-semibold text-gray-700">{(total / data.length).toFixed(1)}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-gray-500">Peak</span>
            <p className="text-sm font-semibold text-gray-700">{maxValue}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineChart;
