import React from 'react';
import { Chip } from '@mui/material';

interface BadgeProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'sm',
  children,
  className = ''
}) => {
  const getColor = (): any => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'default';
      case 'success':
        return 'success';
      case 'danger':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={children}
      color={getColor()}
      size={size === 'sm' ? 'small' : 'medium'}
      className={className}
      sx={{
        fontWeight: 600,
        ...(variant === 'primary' && {
          bgcolor: 'rgba(25, 118, 210, 0.08)',
          color: 'primary.dark',
          '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.12)' }
        }),
        ...(variant === 'secondary' && {
          bgcolor: 'rgba(0, 0, 0, 0.06)',
          color: 'text.primary',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.08)' }
        }),
        ...(variant === 'success' && {
          bgcolor: 'rgba(46, 125, 50, 0.08)',
          color: 'success.dark',
          '&:hover': { bgcolor: 'rgba(46, 125, 50, 0.12)' }
        }),
        ...(variant === 'danger' && {
          bgcolor: 'rgba(211, 47, 47, 0.08)',
          color: 'error.dark',
          '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.12)' }
        }),
        ...(variant === 'warning' && {
          bgcolor: 'rgba(237, 108, 2, 0.08)',
          color: 'warning.dark',
          '&:hover': { bgcolor: 'rgba(237, 108, 2, 0.12)' }
        }),
        ...(variant === 'info' && {
          bgcolor: 'rgba(2, 136, 209, 0.08)',
          color: 'info.dark',
          '&:hover': { bgcolor: 'rgba(2, 136, 209, 0.12)' }
        })
      }}
    />
  );
};

export default Badge;
