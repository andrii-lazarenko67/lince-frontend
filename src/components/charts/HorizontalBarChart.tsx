import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface HorizontalBarData {
  label: string;
  pass: number;
  fail: number;
  na: number;
}

interface HorizontalBarChartProps {
  data: HorizontalBarData[];
  title: string;
  maxItems?: number;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, title, maxItems = 10 }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">{t('common.noData')}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="space-y-3">
        {data.slice(0, maxItems).map((item, index) => {
          const total = item.pass + item.fail + item.na;
          const passPercent = total > 0 ? (item.pass / total) * 100 : 0;
          const failPercent = total > 0 ? (item.fail / total) * 100 : 0;
          const naPercent = total > 0 ? (item.na / total) * 100 : 0;
          return (
            <div
              key={index}
              className="space-y-1 relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700 truncate" style={{ maxWidth: '60%' }}>{item.label}</span>
                <span className="text-gray-500">{total} {t('charts.horizontalBar.items')}</span>
              </div>
              <div className="flex h-4 bg-gray-100 rounded overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-green-500 transition-opacity"
                  style={{
                    width: `${passPercent}%`,
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }}
                />
                <div
                  className="h-full bg-red-500 transition-opacity"
                  style={{
                    width: `${failPercent}%`,
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }}
                />
                <div
                  className="h-full bg-gray-400 transition-opacity"
                  style={{
                    width: `${naPercent}%`,
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }}
                />
              </div>

              {hoveredIndex === index && (
                <div
                  className="absolute z-10 bg-gray-800 rounded-md shadow-lg pointer-events-auto"
                  style={{
                    top: '-90px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '140px',
                    padding: '8px'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="text-white text-xs font-bold mb-2 truncate">{item.label}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded bg-green-500" />
                    {t('charts.horizontalBar.pass')}: <span className="text-green-400 font-semibold">{item.pass} ({passPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded bg-red-500" />
                    {t('charts.horizontalBar.fail')}: <span className="text-red-400 font-semibold">{item.fail} ({failPercent.toFixed(0)}%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-2.5 h-2.5 rounded bg-gray-400" />
                    {t('charts.horizontalBar.na')}: <span className="text-gray-300 font-semibold">{item.na} ({naPercent.toFixed(0)}%)</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-xs text-gray-600">{t('charts.horizontalBar.pass')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-gray-600">{t('charts.horizontalBar.fail')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400" /><span className="text-xs text-gray-600">{t('charts.horizontalBar.na')}</span></div>
      </div>
    </div>
  );
};

export default HorizontalBarChart;
