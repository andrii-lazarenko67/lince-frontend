import React from 'react';
import { useTranslation } from 'react-i18next';
import ProfileInfoSection from './ProfileInfoSection';
import ChangePasswordSection from './ChangePasswordSection';
import { useTour, useAutoStartTour, PROFILE_TOUR } from '../../tours';
import { IconButton, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(PROFILE_TOUR);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div data-tour="profile-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-500 mt-1">{t('profile.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={isCompleted(PROFILE_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
            <IconButton
              onClick={() => startTour(PROFILE_TOUR)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark'
                }
              }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileInfoSection />
        <ChangePasswordSection />
      </div>
    </div>
  );
};

export default ProfilePage;
