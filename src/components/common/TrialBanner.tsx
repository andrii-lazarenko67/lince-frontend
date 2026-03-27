import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import { useAppSelector, useAppNavigation } from '../../hooks';

const TrialBanner: React.FC = () => {
  const { t } = useTranslation();
  const { goTo } = useAppNavigation();
  const billingStatus = useAppSelector((state) => state.billing.status);
  const user = useAppSelector((state) => state.auth.user);

  if (!billingStatus || user?.isServiceProvider) return null;

  // past_due — persistent payment warning (highest priority)
  if (billingStatus.status === 'past_due') {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 0, py: 0.5 }}
        action={
          <Button
            color="error"
            size="small"
            variant="outlined"
            onClick={() => goTo('/billing')}
            sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
          >
            {t('billing.pastDue.action')}
          </Button>
        }
      >
        {t('billing.pastDue.banner')}
      </Alert>
    );
  }

  // cancellation scheduled — warn owner before period ends
  if (billingStatus.cancelAtPeriodEnd && billingStatus.currentPeriodEnd && billingStatus.isOwner) {
    const endDate = new Date(billingStatus.currentPeriodEnd).toLocaleDateString('pt-BR');
    return (
      <Alert
        severity="warning"
        sx={{ borderRadius: 0, py: 0.5 }}
        action={
          <Button
            color="warning"
            size="small"
            variant="outlined"
            onClick={() => goTo('/billing')}
            sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
          >
            {t('billing.cancelScheduled.action')}
          </Button>
        }
      >
        {t('billing.cancelScheduled.banner', { date: endDate })}
      </Alert>
    );
  }

  // trial ending soon — show when 7 or fewer days remain
  if (!billingStatus.isTrialing || !billingStatus.trialEndsAt) return null;

  const daysLeft = Math.ceil(
    (new Date(billingStatus.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysLeft > 7) return null;

  const message =
    daysLeft === 0
      ? t('billing.trial.endsToday')
      : daysLeft === 1
      ? t('billing.trial.endsTomorrow')
      : t('billing.trial.endsIn', { days: daysLeft });

  return (
    <Alert
      severity="warning"
      sx={{ borderRadius: 0, py: 0.5 }}
      action={
        <Button
          color="warning"
          size="small"
          variant="outlined"
          onClick={() => goTo('/billing')}
          sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}
        >
          {t('billing.trial.upgrade')}
        </Button>
      }
    >
      {message}
    </Alert>
  );
};

export default TrialBanner;
