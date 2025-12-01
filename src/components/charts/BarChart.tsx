import React, { useState } from 'react';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title: string;
  height?: number;
  defaultColor?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 200, defaultColor = '#3b82f6' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
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
          const barColor = item.color || defaultColor;
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
                  backgroundColor: barColor,
                  minHeight: item.value > 0 ? '4px' : '0',
                  opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                }}
              />
              <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{item.label}</span>

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
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: barColor }} />
                    <span className="text-white text-xs font-bold truncate">{item.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Count: <span className="text-white font-semibold">{item.value}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Share: <span className="font-semibold" style={{ color: barColor }}>{percentage.toFixed(1)}%</span>
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

export default BarChart;
