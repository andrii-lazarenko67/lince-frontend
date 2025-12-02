import React from 'react';
import { FormControlLabel, Checkbox as MuiCheckbox } from '@mui/material';

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
  if (label) {
    return (
      <FormControlLabel
        control={
          <MuiCheckbox
            id={name}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            size="small"
          />
        }
        label={label}
        className={className}
      />
    );
  }

  return (
    <MuiCheckbox
      id={name}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      size="small"
      className={className}
    />
  );
};

export default Checkbox;
