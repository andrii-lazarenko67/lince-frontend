import React from 'react';

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
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 disabled:bg-yellow-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:bg-gray-100'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
