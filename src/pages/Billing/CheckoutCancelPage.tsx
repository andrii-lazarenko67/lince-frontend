import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper } from '@mui/material';
import { CancelOutlined as CancelIcon } from '@mui/icons-material';
import { Button } from '../../components/common';
import { useAppNavigation } from '../../hooks';

const CheckoutCancelPage: React.FC = () => {
  const { t } = useTranslation();
  const { goTo } = useAppNavigation();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f1f5f9',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 5,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}
        >
          <CancelIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
        </Box>

        <Typography variant="h5" fontWeight={700} mb={1.5}>
          {t('billing.cancel.title')}
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          {t('billing.cancel.message')}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={() => goTo('/dashboard')}>
            {t('common.back')}
          </Button>
          <Button variant="primary" onClick={() => goTo('/billing')}>
            {t('billing.cancel.tryAgain')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CheckoutCancelPage;
