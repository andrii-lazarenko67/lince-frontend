import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import { CheckCircleOutline as CheckIcon } from '@mui/icons-material';
import { Button } from '../../components/common';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { syncFromSession, fetchBillingStatus } from '../../store/slices/billingSlice';
import { BillingLayout } from '../../components/layout';

const CheckoutSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goTo } = useAppNavigation();
  const [searchParams] = useSearchParams();
  const billingStatus = useAppSelector((state) => state.billing.status);
  const loading = useAppSelector((state) => state.billing.loading);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // Sync from Stripe session first (handles local dev where webhooks don't reach),
      // then refresh billing status so the UI reflects the new subscription
      dispatch(syncFromSession(sessionId)).finally(() => {
        dispatch(fetchBillingStatus());
      });
    } else {
      dispatch(fetchBillingStatus());
    }
  }, [dispatch, searchParams]);

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
        {loading ? (
          <Box sx={{ py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              {t('billing.success.confirming')}
            </Typography>
          </Box>
        ) : (
          <>
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
          </>
        )}
      </Paper>
    </Box>
    </BillingLayout>
  );
};

export default CheckoutSuccessPage;
