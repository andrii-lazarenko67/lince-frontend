import React from 'react';

interface CheckboxProps {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  checked,
  onChange,
  label,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {label && (
        <label
          htmlFor={name}
          className={`ml-2 block text-sm text-gray-700 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
