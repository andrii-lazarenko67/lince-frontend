import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface HeatmapCell {
  row: number;
  col: number;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  rowLabels: string[];
  colLabels: string[];
  title: string;
  height?: number;
  colorScale?: { min: string; mid: string; max: string };
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({
  data,
  rowLabels,
  colLabels,
  title,
  height = 300,
  colorScale = { min: '#dbeafe', mid: '#3b82f6', max: '#1e3a8a' }
}) => {
  const { t } = useTranslation();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
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

  if (data.length === 0 || rowLabels.length === 0 || colLabels.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height }}>
          <span className="text-gray-400">{t('common.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const padding = { top: 20, right: 60, bottom: 40, left: 80 };
  const chartWidth = Math.max(containerWidth - padding.left - padding.right, 100);
  const chartHeight = height - padding.top - padding.bottom;

  const cellWidth = chartWidth / colLabels.length;
  const cellHeight = chartHeight / rowLabels.length;

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach(d => {
    dataMap.set(`${d.row}-${d.col}`, d.value);
  });

  const values = data.map(d => d.value);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);

  // Interpolate color based on value
  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);

    // Parse colors
    const parseColor = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const minC = parseColor(colorScale.min);
    const midC = parseColor(colorScale.mid);
    const maxC = parseColor(colorScale.max);

    let r, g, b;
    if (ratio < 0.5) {
      const t = ratio * 2;
      r = Math.round(minC.r + (midC.r - minC.r) * t);
      g = Math.round(minC.g + (midC.g - minC.g) * t);
      b = Math.round(minC.b + (midC.b - minC.b) * t);
    } else {
      const t = (ratio - 0.5) * 2;
      r = Math.round(midC.r + (maxC.r - midC.r) * t);
      g = Math.round(midC.g + (maxC.g - midC.g) * t);
      b = Math.round(midC.b + (maxC.b - midC.b) * t);
    }

    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="w-full" ref={containerRef}>
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      {containerWidth > 0 && (
        <>
          <svg width={containerWidth} height={height} className="overflow-visible">
            {/* Cells */}
            {rowLabels.map((_, rowIndex) =>
              colLabels.map((_, colIndex) => {
                const value = dataMap.get(`${rowIndex}-${colIndex}`) ?? 0;
                const x = padding.left + colIndex * cellWidth;
                const y = padding.top + rowIndex * cellHeight;
                const isHovered = hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex;

                return (
                  <g key={`cell-${rowIndex}-${colIndex}`}>
                    <rect
                      x={x}
                      y={y}
                      width={cellWidth - 1}
                      height={cellHeight - 1}
                      fill={getColor(value)}
                      stroke={isHovered ? '#1f2937' : 'white'}
                      strokeWidth={isHovered ? 2 : 1}
                      rx="2"
                      onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Value text */}
                    {cellWidth > 30 && cellHeight > 20 && (
                      <text
                        x={x + cellWidth / 2}
                        y={y + cellHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: '10px',
                          fill: value > (maxValue - minValue) / 2 + minValue ? 'white' : '#374151',
                          pointerEvents: 'none'
                        }}
                      >
                        {value}
                      </text>
                    )}
                    {isHovered && cellWidth <= 30 && (
                      <g>
                        <rect
                          x={x + cellWidth / 2 - 25}
                          y={y - 25}
                          width={50}
                          height={20}
                          rx="4"
                          fill="#1f2937"
                        />
                        <text
                          x={x + cellWidth / 2}
                          y={y - 12}
                          textAnchor="middle"
                          style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold' }}
                        >
                          {value}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })
            )}

            {/* Row labels */}
            {rowLabels.map((label, i) => (
              <text
                key={`row-${i}`}
                x={padding.left - 8}
                y={padding.top + i * cellHeight + cellHeight / 2}
                textAnchor="end"
                dominantBaseline="middle"
                style={{ fontSize: '11px', fill: '#6b7280' }}
              >
                {label}
              </text>
            ))}

            {/* Column labels */}
            {colLabels.map((label, i) => (
              <text
                key={`col-${i}`}
                x={padding.left + i * cellWidth + cellWidth / 2}
                y={height - 10}
                textAnchor="middle"
                style={{ fontSize: '11px', fill: '#6b7280' }}
              >
                {label}
              </text>
            ))}

            {/* Color scale legend */}
            <defs>
              <linearGradient id="heatmapGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colorScale.min} />
                <stop offset="50%" stopColor={colorScale.mid} />
                <stop offset="100%" stopColor={colorScale.max} />
              </linearGradient>
            </defs>
            <rect
              x={containerWidth - padding.right + 10}
              y={padding.top}
              width={15}
              height={chartHeight}
              fill="url(#heatmapGradient)"
              rx="2"
              transform={`rotate(90, ${containerWidth - padding.right + 17.5}, ${padding.top + chartHeight / 2})`}
              style={{ transformOrigin: 'center' }}
            />
          </svg>

          {/* Legend */}
          <div className="flex justify-center items-center gap-4 mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-20 h-3 rounded" style={{
                background: `linear-gradient(to right, ${colorScale.min}, ${colorScale.mid}, ${colorScale.max})`
              }}></div>
              <span className="text-xs text-gray-500">{minValue} - {maxValue}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeatmapChart;
