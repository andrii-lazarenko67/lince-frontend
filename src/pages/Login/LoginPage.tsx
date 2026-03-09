import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { login } from '../../store/slices/authSlice';
import { setSelectedClient } from '../../store/slices/clientSlice';
import { Input, Alert } from '../../components/common';
import { GlobalLoader } from '../../components/common';
import { AuthLayout } from '../../components/layout';
import MuiButton from '@mui/material/Button';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import axiosInstance from '../../api/axiosInstance';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { token, error } = useAppSelector((state) => state.auth);
  const { goToDashboard, goToAddClient, goToSignup } = useAppNavigation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    if (token) goToDashboard();
  }, [token, goToDashboard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      const { client, redirectTo } = result.payload;
      if (client) dispatch(setSelectedClient(client.id));
      if (redirectTo === 'add-client') goToAddClient();
      else goToDashboard();
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError(t('login.forgotPassword.errors.emailRequired'));
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      await axiosInstance.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSent(true);
    } catch {
      setForgotError(t('login.errorOccurred'));
    } finally {
      setForgotLoading(false);
    }
  };

  const trustSignals = t('login.trustSignals', { returnObjects: true }) as string[];

  return (
    <AuthLayout
      panelTitle={t('login.panelTitle')}
      panelSubtitle={t('login.panelSubtitle')}
    >
      <GlobalLoader />

      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          {/* Card header stripe */}
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />

          <div className="px-8 py-8">
            {!showForgot ? (
              <>
                {/* Header */}
                <div className="flex flex-col items-center mb-7">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-3">
                    <WaterDropIcon sx={{ fontSize: 26, color: '#3b82f6' }} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('login.title')}</h1>
                  <p className="text-gray-500 text-sm mt-1 text-center">{t('login.subtitle')}</p>
                </div>

                {/* Error */}
                {(error || formError) && (
                  <Alert
                    type="error"
                    message={formError || error || t('login.errorOccurred')}
                    className="mb-5"
                  />
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

                  <div className="flex flex-col gap-1">
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
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => { setShowForgot(true); setForgotEmail(formData.email); setForgotSent(false); setForgotError(''); }}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                      >
                        {t('login.forgotPassword.link')}
                      </button>
                    </div>
                  </div>

                  <MuiButton
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={<LoginIcon />}
                    sx={{
                      mt: 1,
                      py: 1.25,
                      bgcolor: '#3b82f6',
                      '&:hover': { bgcolor: '#2563eb' },
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {t('login.signInButton')}
                  </MuiButton>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-gray-400 text-xs">{t('login.orDivider')}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* Sign up link */}
                <p className="text-center text-sm text-gray-500">
                  {t('login.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={goToSignup}
                    className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                  >
                    {t('login.signUpLink')}
                  </button>
                </p>
              </>
            ) : (
              <>
                {/* Forgot Password view */}
                <div className="flex flex-col items-center mb-7">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-3">
                    <EmailIcon sx={{ fontSize: 26, color: '#3b82f6' }} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('login.forgotPassword.title')}</h1>
                  <p className="text-gray-500 text-sm mt-1 text-center">{t('login.forgotPassword.subtitle')}</p>
                </div>

                {forgotSent ? (
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('login.forgotPassword.successTitle')}</h2>
                    <p className="text-gray-500 text-sm mb-6">{t('login.forgotPassword.successMessage')}</p>
                    <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="text-blue-600 font-semibold hover:text-blue-700 hover:underline text-sm transition-colors"
                    >
                      {t('login.forgotPassword.backToLogin')}
                    </button>
                  </div>
                ) : (
                  <>
                    {forgotError && (
                      <Alert type="error" message={forgotError} className="mb-5" />
                    )}
                    <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
                      <Input
                        type="email"
                        name="forgotEmail"
                        value={forgotEmail}
                        onChange={(e) => { setForgotEmail(e.target.value); setForgotError(''); }}
                        label={t('login.forgotPassword.emailLabel')}
                        placeholder={t('login.forgotPassword.emailPlaceholder')}
                        required
                        autoComplete="email"
                      />
                      <MuiButton
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={forgotLoading}
                        sx={{
                          mt: 1,
                          py: 1.25,
                          bgcolor: '#3b82f6',
                          '&:hover': { bgcolor: '#2563eb' },
                          fontWeight: 600,
                          fontSize: '0.95rem',
                        }}
                      >
                        {forgotLoading ? '...' : t('login.forgotPassword.submitButton')}
                      </MuiButton>
                    </form>
                    <div className="mt-5 text-center">
                      <button
                        type="button"
                        onClick={() => setShowForgot(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                      >
                        {t('login.forgotPassword.backToLogin')}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
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

export default LoginPage;
