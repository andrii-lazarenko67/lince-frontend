import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface TrendLineData {
  label: string;
  value: number;
}

interface TrendLineChartProps {
  data: TrendLineData[];
  title: string;
  height?: number;
  color?: string;
  showTrendLine?: boolean;
  showMovingAverage?: boolean;
  movingAveragePeriod?: number;
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  title,
  height = 250,
  color = '#3b82f6',
  showTrendLine = true,
  showMovingAverage = true,
  movingAveragePeriod = 3
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

  const padding = { top: 30, right: 20, bottom: 50, left: 50 };
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 100);
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Calculate trend line using linear regression
  const calculateTrendLine = () => {
    const n = data.length;
    if (n < 2) return null;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    data.forEach((d, i) => {
      sumX += i;
      sumY += d.value;
      sumXY += i * d.value;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Calculate moving average
  const calculateMovingAverage = () => {
    if (data.length < movingAveragePeriod) return [];

    const ma: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < movingAveragePeriod - 1) {
        ma.push(NaN);
      } else {
        let sum = 0;
        for (let j = 0; j < movingAveragePeriod; j++) {
          sum += data[i - j].value;
        }
        ma.push(sum / movingAveragePeriod);
      }
    }
    return ma;
  };

  const trendLine = showTrendLine ? calculateTrendLine() : null;
  const movingAverage = showMovingAverage ? calculateMovingAverage() : [];

  const getX = (index: number) => padding.left + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Create main line path
  const linePath = data.map((d, i) => {
    const x = getX(i);
    const y = getY(d.value);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Create trend line path
  let trendLinePath = '';
  if (trendLine) {
    const startY = trendLine.intercept;
    const endY = trendLine.slope * (data.length - 1) + trendLine.intercept;
    trendLinePath = `M ${getX(0)} ${getY(startY)} L ${getX(data.length - 1)} ${getY(endY)}`;
  }

  // Create moving average path
  let maPath = '';
  if (movingAverage.length > 0) {
    let started = false;
    movingAverage.forEach((val, i) => {
      if (!isNaN(val)) {
        const x = getX(i);
        const y = getY(val);
        if (!started) {
          maPath += `M ${x} ${y}`;
          started = true;
        } else {
          maPath += ` L ${x} ${y}`;
        }
      }
    });
  }

  const yTicks = [minValue, minValue + valueRange * 0.5, maxValue];

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

            {/* Y-axis grid lines */}
            {yTicks.map((tick, i) => {
              const y = getY(tick);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray={i === 0 ? "0" : "4,4"}
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    style={{ fontSize: '11px', fill: '#9ca3af' }}
                  >
                    {tick.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Moving average line */}
            {showMovingAverage && maPath && (
              <path
                d={maPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="6,3"
                opacity="0.8"
              />
            )}

            {/* Trend line */}
            {showTrendLine && trendLinePath && (
              <path
                d={trendLinePath}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="8,4"
                opacity="0.6"
              />
            )}

            {/* Main data line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((d, i) => {
              const x = getX(i);
              const y = getY(d.value);
              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="transparent"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={hoveredIndex === i ? 6 : 4}
                    fill="white"
                    stroke={color}
                    strokeWidth="2.5"
                  />
                  {hoveredIndex === i && (
                    <g>
                      <rect
                        x={x - 40}
                        y={y - 45}
                        width={80}
                        height={35}
                        rx="4"
                        fill="#1f2937"
                      />
                      <text
                        x={x}
                        y={y - 30}
                        textAnchor="middle"
                        style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold' }}
                      >
                        {d.label}
                      </text>
                      <text
                        x={x}
                        y={y - 16}
                        textAnchor="middle"
                        style={{ fontSize: '11px', fill: color }}
                      >
                        {d.value}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {data.length <= 12 ? data.map((d, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 15}
                textAnchor="middle"
                style={{ fontSize: '11px', fill: '#9ca3af' }}
              >
                {d.label}
              </text>
            )) : (
              <>
                <text x={getX(0)} y={height - 15} textAnchor="start" style={{ fontSize: '11px', fill: '#9ca3af' }}>
                  {data[0]?.label}
                </text>
                <text x={getX(data.length - 1)} y={height - 15} textAnchor="end" style={{ fontSize: '11px', fill: '#9ca3af' }}>
                  {data[data.length - 1]?.label}
                </text>
              </>
            )}
          </svg>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{t('common.charts.value')}</span>
            </div>
            {showTrendLine && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500" style={{ borderTop: '2px dashed #ef4444' }}></div>
                <span className="text-xs text-gray-600">{t('common.charts.trend')}</span>
              </div>
            )}
            {showMovingAverage && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }}></div>
                <span className="text-xs text-gray-600">{t('common.charts.movingAverage')}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TrendLineChart;
