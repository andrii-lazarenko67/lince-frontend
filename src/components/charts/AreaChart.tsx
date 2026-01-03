import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface AreaChartSeries {
  name: string;
  data: number[];
  color: string;
}

interface AreaChartProps {
  series: AreaChartSeries[];
  labels: string[];
  title: string;
  height?: number;
  stacked?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({
  series,
  labels,
  title,
  height = 250,
  stacked = false
}) => {
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);
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

  if (series.length === 0 || labels.length === 0) {
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

  // Calculate stacked values if needed
  const processedSeries = stacked
    ? series.map((s, sIndex) => ({
        ...s,
        data: s.data.map((value, pIndex) => {
          let sum = value;
          for (let i = 0; i < sIndex; i++) {
            sum += series[i].data[pIndex] || 0;
          }
          return sum;
        })
      }))
    : series;

  const allValues = processedSeries.flatMap(s => s.data);
  const maxValue = Math.max(...allValues, 1);
  const minValue = stacked ? 0 : Math.min(...allValues, 0);
  const valueRange = maxValue - minValue || 1;

  const getX = (index: number) => padding.left + (index / (labels.length - 1 || 1)) * chartWidth;
  const getY = (value: number) => padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

  // Create area paths (reverse order for stacked to render bottom series first)
  const renderOrder = stacked ? [...processedSeries].reverse() : processedSeries;

  const createAreaPath = (data: number[], baseData?: number[]) => {
    const points = data.map((value, i) => ({ x: getX(i), y: getY(value) }));
    const basePoints = baseData
      ? baseData.map((value, i) => ({ x: getX(i), y: getY(value) }))
      : data.map((_, i) => ({ x: getX(i), y: getY(minValue) }));

    let path = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(p => {
      path += ` L ${p.x} ${p.y}`;
    });

    // Close the area
    for (let i = basePoints.length - 1; i >= 0; i--) {
      path += ` L ${basePoints[i].x} ${basePoints[i].y}`;
    }
    path += ' Z';

    return path;
  };

  const createLinePath = (data: number[]) => {
    return data.map((value, i) => {
      const x = getX(i);
      const y = getY(value);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

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

            {/* Area fills */}
            {renderOrder.map((s, renderIndex) => {
              const actualIndex = stacked ? series.length - 1 - renderIndex : renderIndex;
              const baseSeriesData = stacked && actualIndex > 0
                ? processedSeries[actualIndex - 1].data
                : undefined;

              return (
                <path
                  key={`area-${actualIndex}`}
                  d={createAreaPath(processedSeries[actualIndex].data, baseSeriesData)}
                  fill={series[actualIndex].color}
                  opacity="0.3"
                />
              );
            })}

            {/* Lines */}
            {processedSeries.map((s, sIndex) => (
              <path
                key={`line-${sIndex}`}
                d={createLinePath(s.data)}
                fill="none"
                stroke={series[sIndex].color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Data points */}
            {processedSeries.map((s, sIndex) =>
              s.data.map((value, pIndex) => {
                const x = getX(pIndex);
                const y = getY(value);
                const isHovered = hoveredPoint?.seriesIndex === sIndex && hoveredPoint?.pointIndex === pIndex;
                const originalValue = series[sIndex].data[pIndex];

                return (
                  <g key={`point-${sIndex}-${pIndex}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="transparent"
                      onMouseEnter={() => setHoveredPoint({ seriesIndex: sIndex, pointIndex: pIndex })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 5 : 3}
                      fill="white"
                      stroke={series[sIndex].color}
                      strokeWidth="2"
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={x - 45}
                          y={y - 50}
                          width={90}
                          height={40}
                          rx="4"
                          fill="#1f2937"
                        />
                        <text
                          x={x}
                          y={y - 35}
                          textAnchor="middle"
                          style={{ fontSize: '10px', fill: 'white' }}
                        >
                          {series[sIndex].name}
                        </text>
                        <text
                          x={x}
                          y={y - 20}
                          textAnchor="middle"
                          style={{ fontSize: '11px', fill: series[sIndex].color, fontWeight: 'bold' }}
                        >
                          {originalValue}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })
            )}

            {/* X-axis labels */}
            {labels.length <= 12 ? labels.map((label, i) => (
              <text
                key={i}
                x={getX(i)}
                y={height - 15}
                textAnchor="middle"
                style={{ fontSize: '11px', fill: '#9ca3af' }}
              >
                {label}
              </text>
            )) : (
              <>
                <text x={getX(0)} y={height - 15} textAnchor="start" style={{ fontSize: '11px', fill: '#9ca3af' }}>
                  {labels[0]}
                </text>
                <text x={getX(labels.length - 1)} y={height - 15} textAnchor="end" style={{ fontSize: '11px', fill: '#9ca3af' }}>
                  {labels[labels.length - 1]}
                </text>
              </>
            )}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-3 pt-3 border-t border-gray-100">
            {series.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }}></div>
                <span className="text-xs text-gray-600">{s.name}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AreaChart;
