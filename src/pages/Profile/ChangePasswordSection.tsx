import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import { changePassword } from '../../store/slices/authSlice';
import { Card, Button, Input, Alert } from '../../components/common';

const ChangePasswordSection: React.FC = () => {
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setSuccessMessage('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await dispatch(changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword
    }));
    setLoading(false);

    if (changePassword.fulfilled.match(result)) {
      setSuccessMessage('Password changed successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <Card title="Change Password">
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-4" />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          label="Current Password"
          placeholder="Enter current password"
          error={errors.currentPassword}
          required
        />

        <Input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          label="New Password"
          placeholder="Enter new password"
          error={errors.newPassword}
          required
        />

        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          label="Confirm New Password"
          placeholder="Confirm new password"
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" variant="primary" className="mt-4" disabled={loading}>
          Update Password
        </Button>
      </form>
    </Card>
  );
};

export default ChangePasswordSection;
