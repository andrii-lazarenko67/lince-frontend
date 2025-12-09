import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { login } from '../../store/slices/authSlice';
import { Input, Button, Alert } from '../../components/common';
import { GlobalLoader } from '../../components/common';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { token, error } = useAppSelector((state) => state.auth);
  const { goToDashboard } = useAppNavigation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token) {
      goToDashboard();
    }
  }, [token, goToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setFormError(t('login.fillAllFields'));
      return;
    }

    const result = await dispatch(login(formData));
    if (login.fulfilled.match(result)) {
      goToDashboard();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <GlobalLoader />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">{t('login.title')}</h1>
            <p className="text-gray-500 mt-2">{t('login.subtitle')}</p>
          </div>

          {(error || formError) && (
            <Alert
              type="error"
              message={formError || error || t('login.errorOccurred')}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              label={t('login.emailLabel')}
              placeholder={t('login.emailPlaceholder')}
              required
              autoComplete="email"
            />

            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              label={t('login.passwordLabel')}
              placeholder={t('login.passwordPlaceholder')}
              required
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" fullWidth className="mt-6">
              {t('login.signInButton')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('login.footer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
