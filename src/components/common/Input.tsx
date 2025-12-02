import React from 'react';
import { TextField } from '@mui/material';

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
  type,
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
    <TextField
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      label={label}
      error={!!error}
      helperText={error}
      disabled={disabled}
      required={required}
      fullWidth
      variant="outlined"
      size="small"
      className={className}
      autoComplete={autoComplete}
      inputProps={{
        min,
        max,
        step
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
          }
        }
      }}
    />
  );
};

export default Input;
