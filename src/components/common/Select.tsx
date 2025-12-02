import React from 'react';
import { FormControl, InputLabel, Select as MuiSelect, MenuItem, FormHelperText } from '@mui/material';

interface Option {
  value: string | number;
  label: string;
}

interface SelectProps {
  name: string;
  value: string | number;
  onChange: (e: any) => void;
  onBlur?: (e: any) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  name,
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  required = false,
  className = ''
}) => {
  return (
    <FormControl fullWidth variant="outlined" size="small" error={!!error} className={className}>
      {label && (
        <InputLabel id={`${name}-label`}>
          {label}
          {required && ' *'}
        </InputLabel>
      )}
      <MuiSelect
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label}
        disabled={disabled}
        required={required}
        displayEmpty={!label}
      >
        {!label && <MenuItem value="">{placeholder}</MenuItem>}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
