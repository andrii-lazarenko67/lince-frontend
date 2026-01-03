import React from 'react';
import { useTranslation } from 'react-i18next';

export interface GaugeChartProps {
  value: number;
  max: number;
  title: string;
  size?: number;
  color?: string;
  thresholds?: {
    warning: number;
    danger: number;
  };
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  max,
  title,
  size = 180,
  color = '#3b82f6',
  thresholds
}) => {
  const { t: _t } = useTranslation();
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  // Determine color based on thresholds
  let gaugeColor = color;
  if (thresholds) {
    if (percentage < thresholds.danger) {
      gaugeColor = '#ef4444'; // red
    } else if (percentage < thresholds.warning) {
      gaugeColor = '#f59e0b'; // amber
    } else {
      gaugeColor = '#22c55e'; // green
    }
  }

  const radius = (size - 20) / 2;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half circle
  void circumference; // Used for reference

  const startAngle = 180;
  const endAngle = startAngle + (percentage / 100) * 180;

  // Create arc path
  const describeArc = (x: number, y: number, r: number, startDeg: number, endDeg: number) => {
    const start = polarToCartesian(x, y, r, endDeg);
    const end = polarToCartesian(x, y, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
    return {
      x: centerX + (r * Math.cos(angleInRadians)),
      y: centerY + (r * Math.sin(angleInRadians))
    };
  };

  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc */}
        <path
          d={describeArc(centerX, centerY, radius, 180, 360)}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        {percentage > 0 && (
          <path
            d={describeArc(centerX, centerY, radius, 180, endAngle)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          style={{ fontSize: '28px', fontWeight: 'bold', fill: '#374151' }}
        >
          {percentage.toFixed(0)}%
        </text>
        <text
          x={centerX}
          y={centerY + 12}
          textAnchor="middle"
          style={{ fontSize: '12px', fill: '#6b7280' }}
        >
          {value} / {max}
        </text>

        {/* Min/Max labels */}
        <text
          x={strokeWidth}
          y={centerY + 20}
          textAnchor="start"
          style={{ fontSize: '10px', fill: '#9ca3af' }}
        >
          0%
        </text>
        <text
          x={size - strokeWidth}
          y={centerY + 20}
          textAnchor="end"
          style={{ fontSize: '10px', fill: '#9ca3af' }}
        >
          100%
        </text>
      </svg>
      <p className="text-sm font-medium text-gray-700 mt-2">{title}</p>
    </div>
  );
};

export default GaugeChart;
