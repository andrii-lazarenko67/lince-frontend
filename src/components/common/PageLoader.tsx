import React from 'react';
import { Box, CircularProgress } from '@mui/material';

/**
 * Simple page loader for React.lazy Suspense fallback.
 * Unlike GlobalLoader, this doesn't depend on Redux state.
 */
const PageLoader: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        width: '100%',
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
};

export default PageLoader;
