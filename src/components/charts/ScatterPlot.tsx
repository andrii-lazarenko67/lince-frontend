import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface ScatterPlotPoint {
  x: number;
  y: number;
  label?: string;
  category?: string;
}

interface ScatterPlotProps {
  data: ScatterPlotPoint[];
  title: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  colorByCategory?: boolean;
  showTrendLine?: boolean;
}

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xLabel = 'X',
  yLabel = 'Y',
  height = 300,
  colorByCategory = true,
  showTrendLine = true
}) => {
  const { t } = useTranslation();
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
          <span className="text-gray-400">{t('common.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 100);
  const chartHeight = height - padding.top - padding.bottom;

  const xValues = data.map(d => d.x);
  const yValues = data.map(d => d.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

  // Add padding to ranges
  const xRange = maxX - minX || 1;
  const yRange = maxY - minY || 1;
  const xPadding = xRange * 0.1;
  const yPadding = yRange * 0.1;

  const plotMinX = minX - xPadding;
  const plotMaxX = maxX + xPadding;
  const plotMinY = minY - yPadding;
  const plotMaxY = maxY + yPadding;

  const getX = (x: number) => padding.left + ((x - plotMinX) / (plotMaxX - plotMinX)) * chartWidth;
  const getY = (y: number) => padding.top + chartHeight - ((y - plotMinY) / (plotMaxY - plotMinY)) * chartHeight;

  // Get unique categories
  const categories = [...new Set(data.map(d => d.category || 'default'))];
  const categoryColors: Record<string, string> = {};
  categories.forEach((cat, i) => {
    categoryColors[cat] = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
  });

  // Calculate trend line using linear regression
  const calculateTrendLine = () => {
    const n = data.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    data.forEach(d => {
      sumX += d.x;
      sumY += d.y;
      sumXY += d.x * d.y;
      sumX2 += d.x * d.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  const trendLine = showTrendLine ? calculateTrendLine() : null;

  const xTicks = [plotMinX, (plotMinX + plotMaxX) / 2, plotMaxX];
  const yTicks = [plotMinY, (plotMinY + plotMaxY) / 2, plotMaxY];

  return (
    <div className="w-full" ref={containerRef}>
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      {containerWidth > 0 && (
        <>
          <svg width={containerWidth} height={height} className="overflow-visible">
            {/* Background */}
            <rect
              x={padding.left}
              y={padding.top}
              width={chartWidth}
              height={chartHeight}
              fill="#fafafa"
              rx="4"
            />

            {/* X-axis grid lines */}
            {xTicks.map((tick, i) => {
              const x = getX(tick);
              return (
                <g key={`x-${i}`}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + chartHeight}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={x}
                    y={height - 25}
                    textAnchor="middle"
                    style={{ fontSize: '10px', fill: '#9ca3af' }}
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => {
              const y = getY(tick);
              return (
                <g key={`y-${i}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    style={{ fontSize: '10px', fill: '#9ca3af' }}
                  >
                    {tick.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Axis labels */}
            <text
              x={padding.left + chartWidth / 2}
              y={height - 5}
              textAnchor="middle"
              style={{ fontSize: '11px', fill: '#6b7280' }}
            >
              {xLabel}
            </text>
            <text
              x={15}
              y={padding.top + chartHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, 15, ${padding.top + chartHeight / 2})`}
              style={{ fontSize: '11px', fill: '#6b7280' }}
            >
              {yLabel}
            </text>

            {/* Trend line */}
            {trendLine && (
              <line
                x1={getX(plotMinX)}
                y1={getY(trendLine.slope * plotMinX + trendLine.intercept)}
                x2={getX(plotMaxX)}
                y2={getY(trendLine.slope * plotMaxX + trendLine.intercept)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="8,4"
                opacity="0.5"
              />
            )}

            {/* Data points */}
            {data.map((point, i) => {
              const x = getX(point.x);
              const y = getY(point.y);
              const color = colorByCategory ? categoryColors[point.category || 'default'] : '#3b82f6';
              const isHovered = hoveredIndex === i;

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 5}
                    fill={color}
                    opacity={isHovered ? 1 : 0.7}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  {isHovered && (
                    <g>
                      <rect
                        x={x - 50}
                        y={y - 55}
                        width={100}
                        height={45}
                        rx="4"
                        fill="#1f2937"
                      />
                      {point.label && (
                        <text
                          x={x}
                          y={y - 40}
                          textAnchor="middle"
                          style={{ fontSize: '10px', fill: 'white' }}
                        >
                          {point.label}
                        </text>
                      )}
                      <text
                        x={x}
                        y={y - 22}
                        textAnchor="middle"
                        style={{ fontSize: '10px', fill: '#9ca3af' }}
                      >
                        {xLabel}: {point.x.toFixed(2)}
                      </text>
                      <text
                        x={x}
                        y={y - 8}
                        textAnchor="middle"
                        style={{ fontSize: '10px', fill: '#9ca3af' }}
                      >
                        {yLabel}: {point.y.toFixed(2)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          {colorByCategory && categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[cat] }}></div>
                  <span className="text-xs text-gray-600">{cat}</span>
                </div>
              ))}
              {showTrendLine && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ borderTop: '2px dashed #ef4444' }}></div>
                  <span className="text-xs text-gray-600">{t('common.charts.trend')}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScatterPlot;
