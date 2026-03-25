import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from '@mui/material';
import { useAppSelector, useAppNavigation } from '../../hooks';

const TrialBanner: React.FC = () => {
  const { t } = useTranslation();
  const { goTo } = useAppNavigation();
  const billingStatus = useAppSelector((state) => state.billing.status);
  const user = useAppSelector((state) => state.auth.user);

  // Only show for non-service-providers on trial
  if (!billingStatus || user?.isServiceProvider) return null;
  if (!billingStatus.isTrialing || !billingStatus.trialEndsAt) return null;

  const trialEnd = new Date(billingStatus.trialEndsAt);
  const now = new Date();
  const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Only show banner when 7 or fewer days remain
  if (daysLeft > 7) return null;

  let message: string;
  if (daysLeft === 0) {
    message = t('billing.trial.endsToday');
  } else if (daysLeft === 1) {
    message = t('billing.trial.endsTomorrow');
  } else {
    message = t('billing.trial.endsIn', { days: daysLeft });
  }

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
