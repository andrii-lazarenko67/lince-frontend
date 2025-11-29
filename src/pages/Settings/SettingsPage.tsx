import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { changePassword } from '../../store/slices/authSlice';
import { Card, Button, Input, Alert } from '../../components/common';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setSuccessMessage('');
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const result = await dispatch(changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }));

    if (changePassword.fulfilled.match(result)) {
      setSuccessMessage('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
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
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-gray-900">{user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Role</dt>
              <dd className="mt-1 text-gray-900 capitalize">{user?.role}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="mt-1 text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Change Password">
          {successMessage && (
            <Alert type="success" message={successMessage} className="mb-4" />
          )}

          <form onSubmit={handleSubmitPassword}>
            <Input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              label="Current Password"
              placeholder="Enter current password"
              error={errors.currentPassword}
              required
            />

            <Input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              label="New Password"
              placeholder="Enter new password"
              error={errors.newPassword}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              label="Confirm New Password"
              placeholder="Confirm new password"
              error={errors.confirmPassword}
              required
            />

            <Button type="submit" variant="primary" className="mt-4">
              Update Password
            </Button>
          </form>
        </Card>
      </div>

      {user?.role === 'manager' && (
        <Card title="Company Settings">
          <p className="text-gray-500">
            Company settings and preferences will be available in a future update.
          </p>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
