import React, { useState } from 'react';

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  title: string;
  size?: number;
  showLegend?: boolean;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, size = 180, showLegend = true }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-gray-100 flex items-center justify-center" style={{ width: size, height: size }}>
          <span className="text-gray-400 text-sm">No data</span>
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
        <text x={radius} y={radius + 12} textAnchor="middle" style={{ fontSize: '12px', fill: '#6b7280', pointerEvents: 'none' }}>Total</text>

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
      {showLegend && (
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
      )}
    </div>
  );
};

export default DonutChart;
