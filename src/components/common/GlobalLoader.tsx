import React from 'react';
import { useTranslation } from 'react-i18next';
import { Backdrop, CircularProgress, Paper, Typography, Box } from '@mui/material';
import { useAppSelector } from '../../hooks';

const GlobalLoader: React.FC = () => {
  const { t } = useTranslation();
  const { loading } = useAppSelector((state) => state.ui);

  if (!loading) return null;

  return (
    <Backdrop
      open={loading}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: 'rgba(0, 0, 0, 0.1)' }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <CircularProgress size={48} />
        <Box mt={2}>
          <Typography variant="body1" color="text.secondary">
            {t('common.loading')}
          </Typography>
        </Box>
      </Paper>
    </Backdrop>
  );
};

export default GlobalLoader;
