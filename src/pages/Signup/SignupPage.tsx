import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { register } from '../../store/slices/authSlice';
import { setSelectedClient } from '../../store/slices/clientSlice';
import { Input, Alert } from '../../components/common';
import { GlobalLoader } from '../../components/common';
import { AuthLayout } from '../../components/layout';
import MuiButton from '@mui/material/Button';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

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
    phone: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (token) goToDashboard();
  }, [token, goToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
    const result = await dispatch(
      register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        isServiceProvider: formData.isServiceProvider,
        companyName: formData.companyName || undefined,
        phone: formData.phone || undefined,
      })
    );
    if (register.fulfilled.match(result)) {
      const { client, redirectTo } = result.payload;
      if (client) dispatch(setSelectedClient(client.id));
      if (redirectTo === 'add-client') goToAddClient();
      else goToDashboard();
    }
  };

  const trustSignals = t('signup.trustSignals', { returnObjects: true }) as string[];

  return (
    <AuthLayout
      panelTitle={t('signup.panelTitle')}
      panelSubtitle={t('signup.panelSubtitle')}
    >
      <GlobalLoader />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {/* Top stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />

          <div className="px-8 py-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-3">
                <WaterDropIcon sx={{ fontSize: 26, color: '#3b82f6' }} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{t('signup.title')}</h1>
              <p className="text-gray-500 text-sm mt-1 text-center">{t('signup.subtitle')}</p>
            </div>

            {/* Error */}
            {(error || formError) && (
              <Alert
                type="error"
                message={formError || error || t('signup.errorOccurred')}
                className="mb-5"
              />
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Personal info */}
              <div className="grid grid-cols-1 gap-4">
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
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  label={t('signup.passwordLabel')}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  label={t('signup.confirmPasswordLabel')}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Account type selector */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {t('signup.isServiceProviderLabel')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* End customer */}
                  <button
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, isServiceProvider: false }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded border-2 transition-all text-center
                      ${!formData.isServiceProvider
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <BusinessIcon
                      sx={{ fontSize: 24, color: !formData.isServiceProvider ? '#3b82f6' : '#9ca3af' }}
                    />
                    <span className={`text-xs font-semibold leading-tight ${!formData.isServiceProvider ? 'text-blue-700' : 'text-gray-500'}`}>
                      {t('signup.endCustomerLabel')}
                    </span>
                    <span className="text-xs text-gray-400 leading-tight">{t('signup.endCustomerSub')}</span>
                    {!formData.isServiceProvider && (
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                    )}
                  </button>

                  {/* Service provider */}
                  <button
                    type="button"
                    onClick={() => setFormData((f) => ({ ...f, isServiceProvider: true, companyName: '' }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded border-2 transition-all text-center
                      ${formData.isServiceProvider
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <HandshakeIcon
                      sx={{ fontSize: 24, color: formData.isServiceProvider ? '#10b981' : '#9ca3af' }}
                    />
                    <span className={`text-xs font-semibold leading-tight ${formData.isServiceProvider ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {t('signup.serviceProviderLabel')}
                    </span>
                    <span className="text-xs text-gray-400 leading-tight">{t('signup.serviceProviderSub')}</span>
                    {formData.isServiceProvider && (
                      <CheckCircleIcon sx={{ fontSize: 14, color: '#10b981' }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Company name (end customer only) */}
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

              {/* Submit */}
              <MuiButton
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                endIcon={<PersonAddIcon />}
                sx={{
                  mt: 1,
                  py: 1.25,
                  bgcolor: '#3b82f6',
                  '&:hover': { bgcolor: '#2563eb' },
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {t('signup.signUpButton')}
              </MuiButton>

              {/* Legal note */}
              <p className="flex items-start gap-1.5 text-xs text-gray-400 text-center justify-center">
                <LockIcon sx={{ fontSize: 12, mt: '2px', flexShrink: 0 }} />
                {t('signup.legalNote')}
              </p>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs">{t('signup.orDivider')}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500">
              {t('signup.hasAccount')}{' '}
              <button
                type="button"
                onClick={goToLogin}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                {t('signup.signInLink')}
              </button>
            </p>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-5 flex flex-wrap justify-center gap-4">
          {trustSignals.map((label) => (
            <div key={label} className="flex items-center gap-1.5 text-gray-400 text-xs">
              <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981' }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignupPage;
