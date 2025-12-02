import React from 'react';
import { TextField } from '@mui/material';

interface TextAreaProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  rows = 4,
  className = ''
}) => {
  return (
    <TextField
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
      multiline
      rows={rows}
      fullWidth
      variant="outlined"
      size="small"
      className={className}
      sx={{ mb: 2 }}
    />
  );
};

export default TextArea;
