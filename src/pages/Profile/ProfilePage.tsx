import React from 'react';
import { useTranslation } from 'react-i18next';
import ProfileInfoSection from './ProfileInfoSection';
import ChangePasswordSection from './ChangePasswordSection';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-500 mt-1">{t('profile.description')}</p>
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
