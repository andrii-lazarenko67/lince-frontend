import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StackedBarSegment {
  label: string;
  value: number;
  color: string;
}

export interface StackedBarData {
  label: string;
  segments: StackedBarSegment[];
}

interface StackedBarChartProps {
  data: StackedBarData[];
  title: string;
  height?: number;
  legendItems?: { label: string; color: string }[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, title, height = 200, legendItems }) => {
  const { t } = useTranslation();
  const [hoveredBar, setHoveredBar] = useState<{ barIndex: number; segmentIndex: number } | null>(null);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">{t('common.charts.noData')}</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.segments.reduce((sum, s) => sum + s.value, 0)), 1);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="flex items-end justify-around gap-2 relative" style={{ height }}>
        {data.map((bar, barIndex) => {
          const total = bar.segments.reduce((sum, s) => sum + s.value, 0);
          const barHeight = (total / maxValue) * (height - 40);

          return (
            <div
              key={barIndex}
              className="flex flex-col items-center flex-1 max-w-[60px] relative"
            >
              <span className="text-xs font-medium text-gray-600 mb-1">{total}</span>
              <div
                className="w-full rounded-t overflow-hidden flex flex-col-reverse"
                style={{ height: `${barHeight}px`, minHeight: total > 0 ? '4px' : '0' }}
              >
                {bar.segments.map((segment, segmentIndex) => {
                  const segmentHeight = total > 0 ? (segment.value / total) * 100 : 0;
                  const isHovered = hoveredBar?.barIndex === barIndex && hoveredBar?.segmentIndex === segmentIndex;

                  return (
                    <div
                      key={segmentIndex}
                      className="w-full transition-opacity cursor-pointer"
                      style={{
                        height: `${segmentHeight}%`,
                        backgroundColor: segment.color,
                        opacity: hoveredBar === null || isHovered ? 1 : 0.6
                      }}
                      onMouseEnter={() => setHoveredBar({ barIndex, segmentIndex })}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}
              </div>
              <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{bar.label}</span>

              {hoveredBar?.barIndex === barIndex && (
                <div
                  className="absolute z-10 bg-gray-800 rounded-md shadow-lg pointer-events-auto"
                  style={{
                    bottom: `${barHeight + 50}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '120px',
                    padding: '8px'
                  }}
                  onMouseEnter={() => setHoveredBar(hoveredBar)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="text-white text-xs font-bold mb-2">{bar.label}</div>
                  {bar.segments.map((segment, idx) => {
                    const percent = total > 0 ? (segment.value / total) * 100 : 0;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: segment.color }} />
                        {segment.label}: <span style={{ color: segment.color }} className="font-semibold">{segment.value} ({percent.toFixed(0)}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {legendItems && legendItems.length > 0 && (
        <div className="flex justify-center gap-4 mt-4">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-600">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
