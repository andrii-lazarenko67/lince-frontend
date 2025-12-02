import React from 'react';
import { TextField } from '@mui/material';

interface DateInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  className?: string;
}

const DateInput: React.FC<DateInputProps> = ({
  name,
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  min,
  max,
  className = ''
}) => {
  return (
    <TextField
      type="date"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      label={label}
      error={!!error}
      helperText={error}
      disabled={disabled}
      required={required}
      fullWidth
      size="small"
      className={className}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        htmlInput: {
          min,
          max,
        }
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

export default DateInput;
