import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changePassword, updateProfile } from '../../store/slices/authSlice';
import { Card, Button, Input, Alert, Badge } from '../../components/common';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [profileSuccessMessage, setProfileSuccessMessage] = useState('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    if (profileErrors[e.target.name]) {
      setProfileErrors({ ...profileErrors, [e.target.name]: '' });
    }
    setProfileSuccessMessage('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    if (passwordErrors[e.target.name]) {
      setPasswordErrors({ ...passwordErrors, [e.target.name]: '' });
    }
    setPasswordSuccessMessage('');
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};
    if (!profileData.name.trim()) newErrors.name = 'Name is required';
    if (!profileData.email.trim()) newErrors.email = 'Email is required';
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Invalid email format';
    }
    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;

    const result = await dispatch(updateProfile({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone || undefined
    }));

    if (updateProfile.fulfilled.match(result)) {
      setProfileSuccessMessage('Profile updated successfully');
      setIsEditingProfile(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const result = await dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));

    if (changePassword.fulfilled.match(result)) {
      setPasswordSuccessMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileErrors({});
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'technician': return 'Technician';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string): 'primary' | 'secondary' | 'danger' => {
    switch (role) {
      case 'admin': return 'danger';
      case 'manager': return 'primary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Profile Information">
          {profileSuccessMessage && (
            <Alert type="success" message={profileSuccessMessage} className="mb-4" />
          )}

          {isEditingProfile ? (
            <form onSubmit={handleSubmitProfile}>
              <Input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                label="Name"
                placeholder="Enter your name"
                error={profileErrors.name}
                required
              />

              <Input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                label="Email"
                placeholder="Enter your email"
                error={profileErrors.email}
                required
              />

              <Input
                type="tel"
                name="phone"
                value={profileData.phone}
                onChange={handleProfileChange}
                label="Phone"
                placeholder="Enter your phone number (optional)"
              />

              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center mb-6">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full mr-4" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-2xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <Badge variant={getRoleBadgeVariant(user?.role || 'technician')}>
                    {getRoleLabel(user?.role || 'technician')}
                  </Badge>
                </div>
              </div>

              <dl className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{user?.phone || '-'}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <Badge variant={user?.isActive ? 'success' : 'danger'}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                  <dd className="text-sm text-gray-900">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                  <dd className="text-sm text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </dd>
                </div>
              </dl>

              <Button
                variant="primary"
                className="mt-6 w-full"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </Button>
            </>
          )}
        </Card>

        <Card title="Change Password">
          {passwordSuccessMessage && (
            <Alert type="success" message={passwordSuccessMessage} className="mb-4" />
          )}

          <form onSubmit={handleSubmitPassword}>
            <Input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              label="Current Password"
              placeholder="Enter current password"
              error={passwordErrors.currentPassword}
              required
            />

            <Input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              label="New Password"
              placeholder="Enter new password"
              error={passwordErrors.newPassword}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={passwordErrors.confirmPassword}
              required
            />

            <Button type="submit" variant="primary" className="mt-4">
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {(user?.role === 'manager' || user?.role === 'admin') && (
        <Card title="Administration">
          <p className="text-gray-500">
            As a {user?.role}, you have access to manage users and system settings from the respective pages.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = '/users'}>
              Manage Users
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/systems'}>
              Manage Systems
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
