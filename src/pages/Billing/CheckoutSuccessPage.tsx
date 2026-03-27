import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper } from '@mui/material';
import { CheckCircleOutline as CheckIcon } from '@mui/icons-material';
import { Button } from '../../components/common';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchBillingStatus } from '../../store/slices/billingSlice';
import { BillingLayout } from '../../components/layout';

const CheckoutSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goTo } = useAppNavigation();
  const billingStatus = useAppSelector((state) => state.billing.status);

  // Refresh billing status so the app reflects the new subscription immediately
  useEffect(() => {
    dispatch(fetchBillingStatus());
  }, [dispatch]);

  const planName = billingStatus?.planName || t('billing.plans.starter');

  return (
    <BillingLayout>
    <Box sx={{ width: '100%', maxWidth: 480 }}>
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
            bgcolor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}
        >
          <CheckIcon sx={{ fontSize: 40, color: '#10b981' }} />
        </Box>

        <Typography variant="h5" fontWeight={700} mb={1.5}>
          {t('billing.success.title')}
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          {t('billing.success.message', { plan: planName })}
        </Typography>

        <Button variant="primary" fullWidth onClick={() => goTo('/dashboard')}>
          {t('billing.success.goToDashboard')}
        </Button>
      </Paper>
    </Box>
    </BillingLayout>
  );
};

export default CheckoutSuccessPage;
