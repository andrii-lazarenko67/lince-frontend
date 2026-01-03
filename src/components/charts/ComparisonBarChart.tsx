import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface ComparisonBarData {
  label: string;
  values: { name: string; value: number; color: string }[];
}

interface ComparisonBarChartProps {
  data: ComparisonBarData[];
  title: string;
  height?: number;
  horizontal?: boolean;
}

const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  title,
  height = 300,
  horizontal = false
}) => {
  const { t } = useTranslation();
  const [hoveredBar, setHoveredBar] = useState<{ groupIndex: number; barIndex: number } | null>(null);
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

  const padding = horizontal
    ? { top: 20, right: 30, bottom: 30, left: 100 }
    : { top: 30, right: 20, bottom: 60, left: 50 };
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 100);
  const chartHeight = height - padding.top - padding.bottom;

  const allValues = data.flatMap(d => d.values.map(v => v.value));
  const maxValue = Math.max(...allValues, 1);
  const barsPerGroup = data[0]?.values.length || 1;
  const groupCount = data.length;

  // Get unique series for legend
  const series = data[0]?.values.map(v => ({ name: v.name, color: v.color })) || [];

  if (horizontal) {
    const groupHeight = chartHeight / groupCount;
    const barHeight = Math.min((groupHeight * 0.7) / barsPerGroup, 25);
    const groupPadding = (groupHeight - barHeight * barsPerGroup) / 2;

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

              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const x = padding.left + ratio * chartWidth;
                return (
                  <g key={i}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + chartHeight}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray={i === 0 ? "0" : "4,4"}
                    />
                    <text
                      x={x}
                      y={height - 10}
                      textAnchor="middle"
                      style={{ fontSize: '10px', fill: '#9ca3af' }}
                    >
                      {Math.round(ratio * maxValue)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {data.map((group, groupIndex) => (
                <g key={groupIndex}>
                  {group.values.map((bar, barIndex) => {
                    const y = padding.top + groupIndex * groupHeight + groupPadding + barIndex * barHeight;
                    const barWidth = (bar.value / maxValue) * chartWidth;
                    const isHovered = hoveredBar?.groupIndex === groupIndex && hoveredBar?.barIndex === barIndex;

                    return (
                      <g key={barIndex}>
                        <rect
                          x={padding.left}
                          y={y}
                          width={barWidth}
                          height={barHeight - 2}
                          fill={bar.color}
                          rx="2"
                          opacity={isHovered ? 1 : 0.85}
                          onMouseEnter={() => setHoveredBar({ groupIndex, barIndex })}
                          onMouseLeave={() => setHoveredBar(null)}
                          style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                        />
                        {isHovered && (
                          <g>
                            <rect
                              x={padding.left + barWidth + 5}
                              y={y + barHeight / 2 - 12}
                              width={50}
                              height={24}
                              rx="4"
                              fill="#1f2937"
                            />
                            <text
                              x={padding.left + barWidth + 30}
                              y={y + barHeight / 2 + 4}
                              textAnchor="middle"
                              style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold' }}
                            >
                              {bar.value}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Group label */}
                  <text
                    x={padding.left - 8}
                    y={padding.top + groupIndex * groupHeight + groupHeight / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    style={{ fontSize: '11px', fill: '#6b7280' }}
                  >
                    {group.label}
                  </text>
                </g>
              ))}
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
  }

  // Vertical bars
  const groupWidth = chartWidth / groupCount;
  const barWidth = Math.min((groupWidth * 0.7) / barsPerGroup, 40);
  const groupPadding = (groupWidth - barWidth * barsPerGroup) / 2;

  const yTicks = [0, maxValue * 0.5, maxValue];

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
              const y = padding.top + chartHeight - (tick / maxValue) * chartHeight;
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
                    style={{ fontSize: '10px', fill: '#9ca3af' }}
                  >
                    {tick.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {data.map((group, groupIndex) => (
              <g key={groupIndex}>
                {group.values.map((bar, barIndex) => {
                  const x = padding.left + groupIndex * groupWidth + groupPadding + barIndex * barWidth;
                  const barHeight = (bar.value / maxValue) * chartHeight;
                  const y = padding.top + chartHeight - barHeight;
                  const isHovered = hoveredBar?.groupIndex === groupIndex && hoveredBar?.barIndex === barIndex;

                  return (
                    <g key={barIndex}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth - 2}
                        height={barHeight}
                        fill={bar.color}
                        rx="2"
                        opacity={isHovered ? 1 : 0.85}
                        onMouseEnter={() => setHoveredBar({ groupIndex, barIndex })}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                      />
                      {isHovered && (
                        <g>
                          <rect
                            x={x + barWidth / 2 - 25}
                            y={y - 30}
                            width={50}
                            height={24}
                            rx="4"
                            fill="#1f2937"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={y - 14}
                            textAnchor="middle"
                            style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold' }}
                          >
                            {bar.value}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Group label */}
                <text
                  x={padding.left + groupIndex * groupWidth + groupWidth / 2}
                  y={height - 15}
                  textAnchor="middle"
                  style={{ fontSize: '11px', fill: '#6b7280' }}
                >
                  {group.label}
                </text>
              </g>
            ))}
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

export default ComparisonBarChart;
