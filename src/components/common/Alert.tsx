import React from 'react';
import { Alert as MuiAlert, AlertTitle } from '@mui/material';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className = ''
}) => {
  return (
    <MuiAlert
      severity={type}
      onClose={onClose}
      className={className}
      sx={{ mb: 2 }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message}
    </MuiAlert>
  );
};

export default Alert;
