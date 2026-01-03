import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { register } from '../../store/slices/authSlice';
import { setSelectedClient } from '../../store/slices/clientSlice';
import { Input, Button, Alert } from '../../components/common';
import { GlobalLoader } from '../../components/common';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const SignupPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { token, error } = useAppSelector((state) => state.auth);
  const { goToDashboard, goToAddClient, goToLogin } = useAppNavigation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isServiceProvider: false,
    companyName: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token) {
      goToDashboard();
    }
  }, [token, goToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setFormError(t('signup.errors.requiredFields'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError(t('signup.errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setFormError(t('signup.errors.passwordTooShort'));
      return;
    }

    if (!formData.isServiceProvider && !formData.companyName) {
      setFormError(t('signup.errors.companyNameRequired'));
      return;
    }

    const result = await dispatch(register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      isServiceProvider: formData.isServiceProvider,
      companyName: formData.companyName || undefined,
      phone: formData.phone || undefined
    }));

    if (register.fulfilled.match(result)) {
      const { client, redirectTo } = result.payload;
      // Set selected client in Redux store
      if (client) {
        dispatch(setSelectedClient(client.id));
      }
      // Redirect based on server response
      if (redirectTo === 'add-client') {
        goToAddClient();
      } else {
        goToDashboard();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8">
      <GlobalLoader />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600">{t('signup.title')}</h1>
            <p className="text-gray-500 mt-2">{t('signup.subtitle')}</p>
          </div>

          {(error || formError) && (
            <Alert
              type="error"
              message={formError || error || t('signup.errorOccurred')}
              className="mb-4"
            />
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              label={t('signup.nameLabel')}
              placeholder={t('signup.namePlaceholder')}
              required
              autoComplete="name"
            />

            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              label={t('signup.emailLabel')}
              placeholder={t('signup.emailPlaceholder')}
              required
              autoComplete="email"
            />

            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              label={t('signup.phoneLabel')}
              placeholder={t('signup.phonePlaceholder')}
              autoComplete="tel"
            />

            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              label={t('signup.passwordLabel')}
              placeholder={t('signup.passwordPlaceholder')}
              required
              autoComplete="new-password"
            />

            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              label={t('signup.confirmPasswordLabel')}
              placeholder={t('signup.confirmPasswordPlaceholder')}
              required
              autoComplete="new-password"
            />

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="isServiceProvider"
                name="isServiceProvider"
                checked={formData.isServiceProvider}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isServiceProvider" className="text-sm text-gray-700">
                {t('signup.isServiceProviderLabel')}
              </label>
            </div>

            {!formData.isServiceProvider && (
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                label={t('signup.companyNameLabel')}
                placeholder={t('signup.companyNamePlaceholder')}
                required
              />
            )}

            <Button type="submit" variant="primary" fullWidth className="mt-4">
              {t('signup.signUpButton')}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('signup.hasAccount')}{' '}
            <button
              type="button"
              onClick={goToLogin}
              className="text-blue-600 hover:underline"
            >
              {t('signup.signInLink')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
