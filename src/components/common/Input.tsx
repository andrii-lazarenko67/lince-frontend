import React from 'react';

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'datetime-local' | 'tel' | 'url';
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  className?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step,
  className = '',
  autoComplete
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
