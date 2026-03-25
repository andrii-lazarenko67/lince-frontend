import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Alert } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { Button } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchBillingStatus, createCheckoutSession, clearCheckoutUrl } from '../../store/slices/billingSlice';

const SubscriptionBlockedPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, checkoutUrl, loading, error } = useAppSelector((state) => state.billing);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchBillingStatus());
  }, [dispatch]);

  // Redirect to Stripe checkout as soon as we have the URL
  useEffect(() => {
    if (checkoutUrl) {
      dispatch(clearCheckoutUrl());
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl, dispatch]);

  const getBlockReason = (): 'trialExpired' | 'cancelled' | 'expired' => {
    if (!status) return 'expired';
    if (status.status === 'trialing' || status.status === 'expired') return 'trialExpired';
    if (status.status === 'cancelled') return 'cancelled';
    return 'expired';
  };

  const reason = getBlockReason();

  // Only the account owner can manage the subscription (checkout/portal)
  // Staff members see a "contact admin" message instead of subscribe buttons
  const isOwner = status?.isOwner ?? false;

  const handleSubscribe = (plan: 'starter' | 'pro') => {
    dispatch(createCheckoutSession(plan));
  };

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
          maxWidth: 560,
          width: '100%',
          p: 5,
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}
        >
          <LockIcon sx={{ fontSize: 36, color: '#ef4444' }} />
        </Box>

        <Typography variant="h5" fontWeight={700} mb={1.5}>
          {t(`billing.blocked.${reason}.title`)}
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={4}>
          {t(`billing.blocked.${reason}.message`)}
        </Typography>

        {/* Staff user cannot subscribe — show contact admin message */}
        {!isOwner ? (
          <Alert severity="info" sx={{ textAlign: 'left', borderRadius: 1 }}>
            {t('billing.blocked.contactAdmin')}
          </Alert>
        ) : (
          /* Owner: show plan options */
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Starter */}
            <Box
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 3,
                flex: '1 1 180px',
                maxWidth: 210,
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#3b82f6', boxShadow: '0 0 0 2px rgba(59,130,246,0.15)' }
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t('billing.plans.starter')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={2}>
                R$ 149
                <Typography component="span" variant="caption" color="text.secondary">/mês</Typography>
              </Typography>
              <Button
                variant="outline"
                fullWidth
                disabled={loading}
                onClick={() => handleSubscribe('starter')}
              >
                {loading ? '...' : t('billing.actions.subscribe')}
              </Button>
            </Box>

            {/* Pro */}
            <Box
              sx={{
                border: '2px solid #3b82f6',
                borderRadius: 2,
                p: 3,
                flex: '1 1 180px',
                maxWidth: 210,
                position: 'relative',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 0 0 2px rgba(59,130,246,0.3)' }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bgcolor: '#3b82f6',
                  color: '#fff',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                RECOMENDADO
              </Box>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t('billing.plans.pro')}
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={2}>
                R$ 349
                <Typography component="span" variant="caption" color="text.secondary">/mês</Typography>
              </Typography>
              <Button
                variant="primary"
                fullWidth
                disabled={loading}
                onClick={() => handleSubscribe('pro')}
              >
                {loading ? '...' : t('billing.actions.subscribe')}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default SubscriptionBlockedPage;
