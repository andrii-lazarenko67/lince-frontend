import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert as MuiAlert,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Card, Button } from '../../components/common';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchAdminBillingList,
  adminUpdateBilling,
  clearBillingError
} from '../../store/slices/billingSlice';
import type { AdminClientBilling, SubscriptionPlan, SubscriptionStatus } from '../../types';

const statusColors: Record<SubscriptionStatus, 'success' | 'warning' | 'error' | 'default'> = {
  active: 'success',
  trialing: 'warning',
  past_due: 'error',
  cancelled: 'error',
  expired: 'error',
  none: 'default'
};

const PLANS: SubscriptionPlan[] = ['none', 'starter', 'pro', 'enterprise'];
const STATUSES: SubscriptionStatus[] = ['none', 'trialing', 'active', 'past_due', 'cancelled', 'expired'];

interface EditState {
  client: AdminClientBilling;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
}

const AdminBillingPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { adminClients, loading, error } = useAppSelector((state) => state.billing);

  const { user } = useAppSelector((state) => state.auth);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    dispatch(clearBillingError());
    dispatch(fetchAdminBillingList());
  }, [dispatch]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const handleOpenEdit = (client: AdminClientBilling) => {
    setEditState({
      client,
      plan: client.plan,
      subscriptionStatus: client.subscriptionStatus
    });
  };

  const handleCloseEdit = () => {
    setEditState(null);
  };

  const handleSave = async () => {
    if (!editState) return;
    setSaving(true);
    await dispatch(adminUpdateBilling({
      clientId: editState.client.id,
      plan: editState.plan,
      subscriptionStatus: editState.subscriptionStatus
    }));
    setSaving(false);
    setEditState(null);
  };

  // Summary counts
  const total = adminClients.length;
  const activeCount = adminClients.filter(c => c.subscriptionStatus === 'active').length;
  const trialingCount = adminClients.filter(c => c.subscriptionStatus === 'trialing').length;
  const issueCount = adminClients.filter(c =>
    ['past_due', 'cancelled', 'expired'].includes(c.subscriptionStatus)
  ).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <Typography variant="h5" fontWeight={700}>
          {t('billing.admin.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {t('billing.admin.subtitle')}
        </Typography>
      </div>

      {error && (
        <MuiAlert severity="error" sx={{ borderRadius: 1 }}>
          {error}
        </MuiAlert>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('billing.admin.summary.total'), value: total, color: '#3b82f6' },
          { label: t('billing.admin.summary.active'), value: activeCount, color: '#10b981' },
          { label: t('billing.admin.summary.trialing'), value: trialingCount, color: '#f59e0b' },
          { label: t('billing.admin.summary.issues'), value: issueCount, color: '#ef4444' }
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white rounded border border-gray-200 p-4 flex flex-col gap-1"
          >
            <Typography variant="body2" color="text.secondary" fontSize={12}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} style={{ color }}>
              {loading ? '-' : value}
            </Typography>
          </div>
        ))}
      </div>

      {/* Clients table */}
      <Card title={t('billing.admin.title')}>
        {loading && adminClients.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : adminClients.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
            {t('billing.admin.empty')}
          </Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.client')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.plan')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.trialEndsAt')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.periodEnd')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('billing.admin.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {client.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`billing.plans.${client.plan}`)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={t(`billing.status.${client.subscriptionStatus}`)}
                        color={statusColors[client.subscriptionStatus] || 'default'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {formatDate(client.trialEndsAt)}
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>
                      {formatDate(client.currentPeriodEnd)}
                    </TableCell>
                    <TableCell>
                      {isAdmin && (
                        <Tooltip title={t('billing.admin.update.title')}>
                          <IconButton size="small" onClick={() => handleOpenEdit(client)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editState} onClose={handleCloseEdit} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {t('billing.admin.update.title')}
          {editState && (
            <Typography variant="body2" color="text.secondary" mt={0.25}>
              {editState.client.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <FormControl size="small" fullWidth>
            <InputLabel>{t('billing.admin.update.plan')}</InputLabel>
            <Select
              value={editState?.plan ?? 'none'}
              label={t('billing.admin.update.plan')}
              onChange={(e) => editState && setEditState({
                ...editState,
                plan: e.target.value as SubscriptionPlan
              })}
            >
              {PLANS.map(p => (
                <MenuItem key={p} value={p}>
                  {t(`billing.plans.${p}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>{t('billing.admin.update.status')}</InputLabel>
            <Select
              value={editState?.subscriptionStatus ?? 'none'}
              label={t('billing.admin.update.status')}
              onChange={(e) => editState && setEditState({
                ...editState,
                subscriptionStatus: e.target.value as SubscriptionStatus
              })}
            >
              {STATUSES.map(s => (
                <MenuItem key={s} value={s}>
                  {t(`billing.status.${s}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outline" onClick={handleCloseEdit} disabled={saving}>
            {saving ? '...' : t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? '...' : t('billing.admin.update.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminBillingPage;
