import React from 'react';
import ProfileInfoSection from './ProfileInfoSection';
import ChangePasswordSection from './ChangePasswordSection';

const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal information</p>
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
