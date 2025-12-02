import React from 'react';
import { Button as MuiButton } from '@mui/material';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  onClick,
  children,
  className = ''
}) => {
  // Map custom variants to MUI variants and colors
  const getMuiVariant = () => {
    if (variant === 'outline') return 'outlined';
    return 'contained';
  };

  const getMuiColor = (): any => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'error';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'outline':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getMuiSize = () => {
    switch (size) {
      case 'sm':
        return 'small';
      case 'lg':
        return 'large';
      default:
        return 'medium';
    }
  };

  return (
    <MuiButton
      type={type}
      variant={getMuiVariant()}
      color={getMuiColor()}
      size={getMuiSize()}
      disabled={disabled}
      fullWidth={fullWidth}
      onClick={onClick}
      className={className}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
