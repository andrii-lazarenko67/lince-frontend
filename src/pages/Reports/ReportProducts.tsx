import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import type { ReportData } from '../../types';

interface ReportProductsProps {
  report: ReportData;
}

// Donut Chart Component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, size = 180 }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-gray-100 flex items-center justify-center" style={{ width: size, height: size }}>
          <span className="text-gray-400 text-sm">{t('common.noData')}</span>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      </div>
    );
  }

  let currentAngle = -90;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const midAngle = currentAngle + angle / 2;
    const segment = { ...item, percentage, startAngle: currentAngle, endAngle: currentAngle + angle, midAngle };
    currentAngle += angle;
    return segment;
  });

  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    const x3 = radius + innerRadius * Math.cos(endRad);
    const y3 = radius + innerRadius * Math.sin(endRad);
    const x4 = radius + innerRadius * Math.cos(startRad);
    const y4 = radius + innerRadius * Math.sin(startRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const radius = size / 2;
  const innerRadius = radius * 0.6;

  const getTooltipPosition = (midAngle: number) => {
    const rad = (midAngle * Math.PI) / 180;
    const tooltipRadius = radius * 0.8;
    return {
      x: radius + tooltipRadius * Math.cos(rad),
      y: radius + tooltipRadius * Math.sin(rad)
    };
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size + 40} height={size + 40} viewBox={`-20 -20 ${size + 40} ${size + 40}`} className="overflow-visible">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <path
              key={index}
              d={createArcPath(segment.startAngle, segment.endAngle, radius - 2, innerRadius)}
              fill={segment.color}
              className="transition-all cursor-pointer"
              style={{
                opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          )
        ))}
        <text x={radius} y={radius - 8} textAnchor="middle" style={{ fontSize: '24px', fontWeight: 'bold', fill: '#374151', pointerEvents: 'none' }}>{total}</text>
        <text x={radius} y={radius + 12} textAnchor="middle" style={{ fontSize: '12px', fill: '#6b7280', pointerEvents: 'none' }}>{t('reports.statistics.total')}</text>

        {/* Detailed Tooltip */}
        {hoveredIndex !== null && segments[hoveredIndex] && (() => {
          const segment = segments[hoveredIndex];
          const pos = getTooltipPosition(segment.midAngle);
          const tooltipWidth = 100;
          const tooltipHeight = 58;
          let tooltipX = pos.x - tooltipWidth / 2;
          let tooltipY = pos.y - tooltipHeight - 8;
          if (tooltipX < -15) tooltipX = -15;
          if (tooltipX + tooltipWidth > size + 15) tooltipX = size - tooltipWidth + 15;
          if (tooltipY < -15) tooltipY = pos.y + 15;
          return (
            <g
              onMouseEnter={() => setHoveredIndex(hoveredIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} rx="6" fill="#1f2937" style={{ cursor: 'pointer' }} />
              <rect x={tooltipX + 8} y={tooltipY + 10} width={10} height={10} rx="2" fill={segment.color} style={{ pointerEvents: 'none' }} />
              <text x={tooltipX + 24} y={tooltipY + 18} textAnchor="start" style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold', pointerEvents: 'none' }}>{segment.label}</text>
              <text x={tooltipX + 8} y={tooltipY + 34} textAnchor="start" style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}>Count: <tspan fill="white" fontWeight="600">{segment.value}</tspan></text>
              <text x={tooltipX + 8} y={tooltipY + 48} textAnchor="start" style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}>Share: <tspan fill={segment.color} fontWeight="600">{segment.percentage.toFixed(1)}%</tspan></text>
            </g>
          );
        })()}
      </svg>
      <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <div key={index} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-xs text-gray-600">{segment.label}: {segment.value} ({segment.percentage.toFixed(0)}%)</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// Horizontal Bar Chart for Stock Levels
interface HorizontalBarChartProps {
  data: { label: string; current: number; min: number | null; unit: string }[];
  title: string;
}

const StockLevelChart: React.FC<HorizontalBarChartProps> = ({ data, title }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">{t('common.noData')}</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.current), 1);
  const totalStock = data.reduce((sum, item) => sum + item.current, 0);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="space-y-3">
        {data.slice(0, 10).map((item, index) => {
          const isLowStock = item.min !== null && item.current <= item.min;
          const percentage = totalStock > 0 ? (item.current / totalStock) * 100 : 0;
          return (
            <div
              key={index}
              className="space-y-1 relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between text-xs">
                <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.label} {isLowStock && '⚠️'}
                </span>
                <span className="text-gray-500">{item.current} {item.unit}</span>
              </div>
              <div className="relative h-4 bg-gray-100 rounded overflow-hidden cursor-pointer">
                <div
                  className={`h-full rounded transition-opacity ${isLowStock ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{
                    width: `${(item.current / maxValue) * 100}%`,
                    minWidth: item.current > 0 ? '4px' : '0',
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }}
                />
                {item.min !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500"
                    style={{ left: `${(item.min / maxValue) * 100}%` }}
                  />
                )}
              </div>

              {/* Detailed Tooltip */}
              {hoveredIndex === index && (
                <div
                  className="absolute z-10 bg-gray-800 rounded-md shadow-lg pointer-events-auto"
                  style={{
                    top: '-80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '130px',
                    padding: '8px'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: isLowStock ? '#ef4444' : '#3b82f6' }} />
                    <span className="text-white text-xs font-bold truncate">{item.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Stock: <span className="text-white font-semibold">{item.current} {item.unit}</span>
                  </div>
                  {item.min !== null && (
                    <div className="text-xs text-gray-400">
                      Min Alert: <span className="text-yellow-400 font-semibold">{item.min} {item.unit}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Share: <span className="font-semibold" style={{ color: isLowStock ? '#ef4444' : '#3b82f6' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-gray-600">{t('reports.statistics.normal')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-gray-600">{t('reports.statistics.lowStock')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-500" /><span className="text-xs text-gray-600">{t('products.minStockAlert')}</span></div>
      </div>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 200 }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">{t('common.noData')}</div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="flex items-end justify-around gap-2 relative" style={{ height }}>
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div
              key={index}
              className="flex flex-col items-center flex-1 max-w-[60px] relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className="text-xs font-medium text-gray-600 mb-1">{item.value}</span>
              <div
                className="w-full rounded-t transition-all cursor-pointer"
                style={{
                  height: `${(item.value / maxValue) * (height - 40)}px`,
                  backgroundColor: item.color || '#3b82f6',
                  minHeight: item.value > 0 ? '4px' : '0',
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{item.label}</span>

              {/* Detailed Tooltip */}
              {hoveredIndex === index && (
                <div
                  className="absolute z-10 bg-gray-800 rounded-md shadow-lg pointer-events-auto"
                  style={{
                    bottom: `${(item.value / maxValue) * (height - 40) + 50}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '100px',
                    padding: '8px'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color || '#3b82f6' }} />
                    <span className="text-white text-xs font-bold truncate">{item.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Count: <span className="text-white font-semibold">{item.value}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Share: <span className="font-semibold" style={{ color: item.color || '#3b82f6' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Improved Area Line Chart Component
interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  height?: number;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, height = 220, color = '#3b82f6' }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
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
          <span className="text-gray-400">{t('common.noData')}</span>
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
              const total = data.reduce((sum, d) => sum + d.value, 0);
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
      <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <span className="text-xs text-gray-500">Total</span>
          <p className="text-sm font-semibold" style={{ color }}>{data.reduce((sum, d) => sum + d.value, 0)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">Average</span>
          <p className="text-sm font-semibold text-gray-700">{(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}</p>
        </div>
        <div className="text-center">
          <span className="text-xs text-gray-500">Peak</span>
          <p className="text-sm font-semibold text-gray-700">{maxValue}</p>
        </div>
      </div>
    </div>
  );
};

const ReportProducts: React.FC<ReportProductsProps> = ({ report }) => {
  const { t } = useTranslation();

  // Calculate totals
  const totalProducts = report.products.length;
  const lowStockCount = report.products.filter(p =>
    p.minStockAlert !== null && Number(p.currentStock) <= Number(p.minStockAlert)
  ).length;

  const totalQtyIn = report.productUsages.filter(u => u.type === 'in').reduce((acc, u) => acc + Number(u.quantity), 0);
  const totalQtyOut = report.productUsages.filter(u => u.type === 'out').reduce((acc, u) => acc + Number(u.quantity), 0);

  const stockInCount = report.productUsages.filter(u => u.type === 'in').length;
  const stockOutCount = report.productUsages.filter(u => u.type === 'out').length;

  // Stock status donut
  const stockStatusData = [
    { label: t('reports.statistics.normal'), value: totalProducts - lowStockCount, color: '#22c55e' },
    { label: t('reports.statistics.lowStock'), value: lowStockCount, color: '#ef4444' }
  ];

  // Usage type donut
  const usageTypeData = [
    { label: t('reports.statistics.stockIn'), value: stockInCount, color: '#22c55e' },
    { label: t('reports.statistics.stockOut'), value: stockOutCount, color: '#8b5cf6' }
  ];

  // Stock levels horizontal bar
  const stockLevelData = report.products.map(p => ({
    label: p.name,
    current: Number(p.currentStock),
    min: p.minStockAlert !== null ? Number(p.minStockAlert) : null,
    unit: p.unit
  })).sort((a, b) => a.current - b.current);

  // Usage by product
  const productUsageMap = new Map<string, { in: number; out: number }>();
  report.productUsages.forEach(usage => {
    const productName = usage.product?.name || 'Unknown';
    const current = productUsageMap.get(productName) || { in: 0, out: 0 };
    if (usage.type === 'in') {
      current.in += Number(usage.quantity);
    } else {
      current.out += Number(usage.quantity);
    }
    productUsageMap.set(productName, current);
  });

  const usageByProductData = Array.from(productUsageMap.entries())
    .map(([label, data]) => ({
      label: label.length > 10 ? label.substring(0, 10) + '...' : label,
      value: data.out,
      color: '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Usage over time
  const usageTimeMap = new Map<string, { in: number; out: number }>();
  report.productUsages.forEach(usage => {
    const date = new Date(usage.date).toISOString().split('T')[0];
    const current = usageTimeMap.get(date) || { in: 0, out: 0 };
    if (usage.type === 'in') {
      current.in += Number(usage.quantity);
    } else {
      current.out += Number(usage.quantity);
    }
    usageTimeMap.set(date, current);
  });

  const stockInOverTimeData = Array.from(usageTimeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, data]) => ({ label: label.split('-').slice(1).join('/'), value: data.in }));

  const stockOutOverTimeData = Array.from(usageTimeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, data]) => ({ label: label.split('-').slice(1).join('/'), value: data.out }));

  // Usage by system
  const systemUsageMap = new Map<string, number>();
  report.productUsages.filter(u => u.type === 'out').forEach(usage => {
    const systemName = usage.system?.name || 'No System';
    systemUsageMap.set(systemName, (systemUsageMap.get(systemName) || 0) + Number(usage.quantity));
  });
  const usageBySystemData = Array.from(systemUsageMap.entries())
    .map(([label, value]) => ({
      label: label.length > 10 ? label.substring(0, 10) + '...' : label,
      value,
      color: '#3b82f6'
    }))
    .sort((a, b) => b.value - a.value);

  // Products by type
  const productTypeMap = new Map<string, number>();
  report.products.forEach(p => {
    productTypeMap.set(p.type, (productTypeMap.get(p.type) || 0) + 1);
  });
  const byTypeData = Array.from(productTypeMap.entries()).map(([label, value]) => ({
    label,
    value,
    color: '#3b82f6'
  }));

  return (
    <div className="space-y-6">
      <Card title={t('reports.statistics.products')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
            <p className="text-sm text-blue-700">{t('products.chart.totalProducts')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            <p className="text-sm text-red-700">{t('reports.statistics.lowStock')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{totalQtyIn}</p>
            <p className="text-sm text-green-700">{t('reports.statistics.totalQtyIn')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{totalQtyOut}</p>
            <p className="text-sm text-purple-700">{t('reports.statistics.totalQtyOut')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('reports.statistics.stockStatus')}>
          <div className="flex justify-center py-4">
            <DonutChart data={stockStatusData} title={t('products.stockDistribution')} size={200} />
          </div>
        </Card>

        <Card title={t('reports.statistics.usageTransactions')}>
          <div className="flex justify-center py-4">
            <DonutChart data={usageTypeData} title={t('reports.statistics.stockIn') + ' / ' + t('reports.statistics.stockOut')} size={200} />
          </div>
        </Card>
      </div>

      <Card title={t('products.chart.stockLevels')}>
        <StockLevelChart data={stockLevelData} title={t('products.chart.currentVsMinimum')} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('reports.products.product')}>
          <BarChart data={usageByProductData} title={t('reports.products.quantity')} height={220} />
        </Card>

        <Card title={t('common.location')}>
          <BarChart data={usageBySystemData} title={t('reports.products.quantity')} height={220} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('reports.statistics.stockIn')}>
          <LineChart data={stockInOverTimeData} title={t('reports.statistics.stockIn')} height={200} color="#22c55e" />
        </Card>

        <Card title={t('reports.statistics.stockOut')}>
          <LineChart data={stockOutOverTimeData} title={t('reports.statistics.stockOut')} height={200} color="#8b5cf6" />
        </Card>
      </div>

      <Card title={t('products.category')}>
        <BarChart data={byTypeData} title={t('products.categoryDistribution')} height={200} />
      </Card>
    </div>
  );
};

export default ReportProducts;
