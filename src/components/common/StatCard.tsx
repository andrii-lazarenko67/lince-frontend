import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-sm flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
