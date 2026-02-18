import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../hooks';
import { changePassword } from '../../store/slices/authSlice';
import { Card, Button, Input, Alert } from '../../components/common';

const ChangePasswordSection: React.FC = () => {
  const { t } = useTranslation();
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
    if (!formData.currentPassword) newErrors.currentPassword = t('profile.password.currentRequired');
    if (!formData.newPassword) newErrors.newPassword = t('profile.password.newRequired');
    if (formData.newPassword.length < 6) newErrors.newPassword = t('profile.password.minLength');
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('profile.password.passwordsNoMatch');
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
      setSuccessMessage(t('profile.password.passwordChanged'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  return (
    <div data-tour="password-section">
      <Card title={t('profile.password.title')}>
        {successMessage && (
          <Alert type="success" message={successMessage} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          label={t('profile.password.currentPassword')}
          placeholder={t('profile.password.currentPlaceholder')}
          error={errors.currentPassword}
          required
        />

        <Input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          label={t('profile.password.newPassword')}
          placeholder={t('profile.password.newPlaceholder')}
          error={errors.newPassword}
          required
        />

        <Input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          label={t('profile.password.confirmPassword')}
          placeholder={t('profile.password.confirmPlaceholder')}
          error={errors.confirmPassword}
          required
        />

        <Button type="submit" variant="primary" className="mt-4" disabled={loading}>
          {t('profile.password.updatePassword')}
        </Button>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordSection;
