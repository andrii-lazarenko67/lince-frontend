import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface RadarChartData {
  label: string;
  value: number;
  maxValue?: number;
}

interface RadarChartProps {
  data: RadarChartData[];
  title: string;
  size?: number;
  color?: string;
  showLabels?: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({
  data,
  title,
  size = 250,
  color = '#3b82f6',
  showLabels = true
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

  if (data.length < 3) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center bg-gray-50 rounded-lg" style={{ height: size }}>
          <span className="text-gray-400">{t('common.charts.noData')}</span>
        </div>
      </div>
    );
  }

  const actualSize = Math.min(containerWidth || size, size);
  const centerX = actualSize / 2;
  const centerY = actualSize / 2;
  const radius = (actualSize - 80) / 2;
  const levels = 5;

  const angleStep = (2 * Math.PI) / data.length;
  const startAngle = -Math.PI / 2; // Start from top

  const getPoint = (index: number, value: number, maxVal: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / maxVal) * radius;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = startAngle + index * angleStep;
    const r = radius + 25;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // Find max value for scaling
  const globalMax = Math.max(...data.map(d => d.maxValue || d.value), 1);

  // Create grid lines
  const gridPaths = [];
  for (let level = 1; level <= levels; level++) {
    const levelRadius = (level / levels) * radius;
    const points = data.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: centerX + levelRadius * Math.cos(angle),
        y: centerY + levelRadius * Math.sin(angle)
      };
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    gridPaths.push(path);
  }

  // Create data polygon
  const dataPoints = data.map((d, i) => getPoint(i, d.value, d.maxValue || globalMax));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  // Create axis lines
  const axisLines = data.map((_, i) => {
    const angle = startAngle + i * angleStep;
    return {
      x2: centerX + radius * Math.cos(angle),
      y2: centerY + radius * Math.sin(angle)
    };
  });

  return (
    <div className="w-full" ref={containerRef}>
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      {containerWidth > 0 && (
        <div className="flex justify-center">
          <svg width={actualSize} height={actualSize} className="overflow-visible">
            {/* Grid circles */}
            {gridPaths.map((path, i) => (
              <path
                key={`grid-${i}`}
                d={path}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Axis lines */}
            {axisLines.map((line, i) => (
              <line
                key={`axis-${i}`}
                x1={centerX}
                y1={centerY}
                x2={line.x2}
                y2={line.y2}
                stroke="#d1d5db"
                strokeWidth="1"
              />
            ))}

            {/* Data area fill */}
            <path
              d={dataPath}
              fill={color}
              opacity="0.2"
            />

            {/* Data line */}
            <path
              d={dataPath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {dataPoints.map((point, i) => (
              <g key={`point-${i}`}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === i ? 6 : 4}
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
                {hoveredIndex === i && (
                  <g>
                    <rect
                      x={point.x - 35}
                      y={point.y - 35}
                      width={70}
                      height={25}
                      rx="4"
                      fill="#1f2937"
                    />
                    <text
                      x={point.x}
                      y={point.y - 18}
                      textAnchor="middle"
                      style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold' }}
                    >
                      {data[i].value}
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Labels */}
            {showLabels && data.map((d, i) => {
              const labelPoint = getLabelPoint(i);
              const angle = startAngle + i * angleStep;
              const isLeft = Math.cos(angle) < -0.1;
              const isRight = Math.cos(angle) > 0.1;

              return (
                <text
                  key={`label-${i}`}
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={isLeft ? 'end' : isRight ? 'start' : 'middle'}
                  dominantBaseline="middle"
                  style={{ fontSize: '11px', fill: '#6b7280' }}
                >
                  {d.label}
                </text>
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
};

export default RadarChart;
