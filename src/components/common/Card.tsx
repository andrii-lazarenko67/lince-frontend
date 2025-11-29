import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  headerActions,
  noPadding = false
}) => {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {(title || headerActions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  );
};

export default Card;
