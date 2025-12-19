import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface StockLevelData {
  label: string;
  current: number;
  min: number | null;
  unit: string;
}

interface StockLevelChartProps {
  data: StockLevelData[];
  title: string;
  maxItems?: number;
}

const StockLevelChart: React.FC<StockLevelChartProps> = ({ data, title, maxItems = 10 }) => {
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

  const maxValue = Math.max(...data.map(d => d.current), 1);
  const totalStock = data.reduce((sum, item) => sum + item.current, 0);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="space-y-3">
        {data.slice(0, maxItems).map((item, index) => {
          const isLowStock = item.min !== null && item.current <= item.min;
          const percentage = totalStock > 0 ? (item.current / totalStock) * 100 : 0;
          return (
            <div
              key={index}
              className="space-y-1 relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex justify-between text-xs">
                <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                  {item.label} {isLowStock && '⚠️'}
                </span>
                <span className="text-gray-500">{item.current} {item.unit}</span>
              </div>
              <div className="relative h-4 bg-gray-100 rounded overflow-hidden cursor-pointer">
                <div
                  className={`h-full rounded transition-opacity ${isLowStock ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{
                    width: `${(item.current / maxValue) * 100}%`,
                    minWidth: item.current > 0 ? '4px' : '0',
                    opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.6
                  }}
                />
                {item.min !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-yellow-500"
                    style={{ left: `${(item.min / maxValue) * 100}%` }}
                  />
                )}
              </div>

              {hoveredIndex === index && (
                <div
                  className="absolute z-10 bg-gray-800 rounded-md shadow-lg pointer-events-auto"
                  style={{
                    top: '-80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    minWidth: '130px',
                    padding: '8px'
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: isLowStock ? '#ef4444' : '#3b82f6' }} />
                    <span className="text-white text-xs font-bold truncate">{item.label}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {t('common.charts.stock')}: <span className="text-white font-semibold">{item.current} {item.unit}</span>
                  </div>
                  {item.min !== null && (
                    <div className="text-xs text-gray-400">
                      {t('common.charts.minAlert')}: <span className="text-yellow-400 font-semibold">{item.min} {item.unit}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {t('common.charts.share')}: <span className="font-semibold" style={{ color: isLowStock ? '#ef4444' : '#3b82f6' }}>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-gray-600">{t('common.charts.normal')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-gray-600">{t('common.charts.lowStock')}</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-500" /><span className="text-xs text-gray-600">{t('common.charts.minAlert')}</span></div>
      </div>
    </div>
  );
};

export default StockLevelChart;
