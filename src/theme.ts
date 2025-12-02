import { createTheme } from '@mui/material/styles';

// Create a custom Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Blue-500 - customize this to your preferred primary color
      light: '#60a5fa', // Blue-400
      dark: '#2563eb', // Blue-600
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#8b5cf6', // Purple-500
      light: '#a78bfa', // Purple-400
      dark: '#7c3aed', // Purple-600
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444', // Red-500
      light: '#f87171', // Red-400
      dark: '#dc2626', // Red-600
      contrastText: '#ffffff',
    },
    warning: {
      main: '#f59e0b', // Amber-500
      light: '#fbbf24', // Amber-400
      dark: '#d97706', // Amber-600
      contrastText: '#ffffff',
    },
    info: {
      main: '#3b82f6', // Blue-500
      light: '#60a5fa', // Blue-400
      dark: '#2563eb', // Blue-600
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981', // Green-500
      light: '#34d399', // Green-400
      dark: '#059669', // Green-600
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    text: {
      primary: '#111827', // Gray-900
      secondary: '#6b7280', // Gray-500
      disabled: '#9ca3af', // Gray-400
    },
    background: {
      default: '#f9fafb', // Gray-50
      paper: '#ffffff',
    },
    divider: '#e5e7eb', // Gray-200
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Disable uppercase transformation
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 2,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 5,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9ca3af',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
        },
      },
    },
  },
});

export default theme;
