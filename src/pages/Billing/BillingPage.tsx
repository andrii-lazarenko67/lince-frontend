import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Chip,
  Divider,
  CircularProgress,
  Alert as MuiAlert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { Card, Button } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchBillingStatus,
  fetchInvoices,
  createCheckoutSession,
  createPortalSession,
  clearCheckoutUrl,
  clearPortalUrl,
  clearBillingError
} from '../../store/slices/billingSlice';
import type { SubscriptionStatus } from '../../types';

const statusColors: Record<SubscriptionStatus, 'success' | 'warning' | 'error' | 'default'> = {
  active: 'success',
  trialing: 'warning',
  past_due: 'error',
  cancelled: 'error',
  expired: 'error',
  none: 'default'
};

const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { status, invoices, checkoutUrl, portalUrl, loading, error } = useAppSelector(
    (state) => state.billing
  );

  useEffect(() => {
    dispatch(clearBillingError());
    dispatch(fetchBillingStatus());
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Redirect to Stripe URLs as soon as they arrive
  useEffect(() => {
    if (checkoutUrl) {
      dispatch(clearCheckoutUrl());
      window.location.href = checkoutUrl;
    }
  }, [checkoutUrl, dispatch]);

  useEffect(() => {
    if (portalUrl) {
      dispatch(clearPortalUrl());
      window.location.href = portalUrl;
    }
  }, [portalUrl, dispatch]);

  const handleSubscribe = (plan: 'starter' | 'pro') => {
    dispatch(createCheckoutSession(plan));
  };

  const handleManageSubscription = () => {
    dispatch(createPortalSession());
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const trialDaysLeft = () => {
    if (!status?.trialEndsAt) return 0;
    const diff = new Date(status.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading && !status) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const canSubscribe = status?.isOwner && !status?.hasActiveSubscription;
  const canManage = status?.isOwner && status?.hasStripeCustomer;
  const isTrialing = status?.isTrialing;
  const daysLeft = trialDaysLeft();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Typography variant="h5" fontWeight={700}>
          {t('billing.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {t('billing.currentPlan')}
        </Typography>
      </div>

      {error && (
        <MuiAlert severity="error" sx={{ borderRadius: 1 }}>
          {error}
        </MuiAlert>
      )}

      {/* Current Plan Card */}
      <Card title={t('billing.currentPlan')}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CreditCardIcon sx={{ color: '#3b82f6' }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {status?.planName || t('billing.plans.none')}
              </Typography>
              {status && (
                <Chip
                  label={t(`billing.status.${status.status}`)}
                  color={statusColors[status.status] || 'default'}
                  size="small"
                  sx={{ mt: 0.5, fontWeight: 600, fontSize: 11 }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {canManage && (
              <Button
                variant="outline"
                disabled={loading}
                onClick={handleManageSubscription}
              >
                {loading ? '...' : t('billing.actions.manageSubscription')}
              </Button>
            )}
          </Box>
        </Box>

        {/* Trial info */}
        {isTrialing && status?.trialEndsAt && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ p: 2, bgcolor: 'rgba(245, 158, 11, 0.06)', borderRadius: 1, border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <Typography variant="body2" fontWeight={600} color="warning.main" mb={0.5}>
                {t('billing.trial.badge')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {daysLeft > 1
                  ? t('billing.trial.endsIn', { days: daysLeft })
                  : daysLeft === 1
                  ? t('billing.trial.endsTomorrow')
                  : t('billing.trial.endsToday')}
              </Typography>
            </Box>
          </>
        )}

        {/* Period end for active subscriptions */}
        {status?.currentPeriodEnd && (status.status === 'active' || status.status === 'past_due') && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" color="text.secondary">
              {t('billing.periodEnd')}:{' '}
              <strong>{formatDate(status.currentPeriodEnd)}</strong>
            </Typography>
          </>
        )}
      </Card>

      {/* Subscribe to a Plan section (shown when no active subscription) */}
      {canSubscribe && (
        <Card title={t('billing.actions.subscribe')}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Starter */}
            <Box
              sx={{
                flex: '1 1 220px',
                border: '1px solid #e2e8f0',
                borderRadius: 2,
                p: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t('billing.plans.starter')}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main" mb={1}>
                R$ 149
                <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                  /mês
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Ideal para empresas em crescimento.
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
                flex: '1 1 220px',
                border: '2px solid #3b82f6',
                borderRadius: 2,
                p: 3,
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -12,
                  left: 24,
                  bgcolor: '#3b82f6',
                  color: '#fff',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                RECOMENDADO
              </Box>
              <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                {t('billing.plans.pro')}
              </Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main" mb={1}>
                R$ 349
                <Typography component="span" variant="body2" color="text.secondary" ml={0.5}>
                  /mês
                </Typography>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Para operações avançadas com mais recursos.
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
        </Card>
      )}

      {/* Invoice History */}
      <Card
        title={t('billing.invoices.title')}
        headerActions={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </Box>
        }
      >
        {invoices.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('billing.invoices.empty')}
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.date')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.plan')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.period')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.amount')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.invoices.columns.pdf')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} hover>
                    <TableCell>{formatDate(inv.createdAt)}</TableCell>
                    <TableCell>{t(`billing.plans.${inv.plan}`)}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                      {formatDate(inv.periodStart)} – {formatDate(inv.periodEnd)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatCurrency(inv.amount, inv.currency)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`billing.invoices.status.${inv.status}`)}
                        color={inv.status === 'paid' ? 'success' : inv.status === 'open' ? 'warning' : 'default'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      {inv.pdfUrl ? (
                        <Tooltip title={t('billing.invoices.download')}>
                          <IconButton
                            size="small"
                            onClick={() => window.open(inv.pdfUrl!, '_blank')}
                          >
                            <PdfIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>
    </div>
  );
};

export default BillingPage;
