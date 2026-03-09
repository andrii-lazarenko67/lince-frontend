import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Alert } from '../../components/common';
import { AuthLayout } from '../../components/layout';
import MuiButton from '@mui/material/Button';
import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axiosInstance from '../../api/axiosInstance';
import { useAppNavigation } from '../../hooks';

const ResetPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { goToLogin } = useAppNavigation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(t('login.resetPassword.errors.passwordTooShort'));
      return;
    }
    if (password !== confirm) {
      setError(t('login.resetPassword.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err: unknown) {
      const messageKey = (err as { response?: { data?: { messageKey?: string } } })?.response?.data?.messageKey;
      if (messageKey) {
        setError(t(messageKey));
      } else {
        setError(t('login.resetPassword.errors.invalidToken'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      panelTitle={t('login.panelTitle')}
      panelSubtitle={t('login.panelSubtitle')}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-blue-400 to-teal-400" />

          <div className="px-8 py-8">
            {success ? (
              <div className="text-center">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon sx={{ fontSize: 32, color: '#10b981' }} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('login.resetPassword.successTitle')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('login.resetPassword.successMessage')}</p>
                <MuiButton
                  variant="contained"
                  fullWidth
                  onClick={goToLogin}
                  sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 600 }}
                >
                  {t('login.resetPassword.goToLogin')}
                </MuiButton>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center mb-7">
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-3">
                    <LockResetIcon sx={{ fontSize: 26, color: '#3b82f6' }} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{t('login.resetPassword.title')}</h1>
                  <p className="text-gray-500 text-sm mt-1 text-center">{t('login.resetPassword.subtitle')}</p>
                </div>

                {!token && (
                  <Alert type="error" message={t('login.resetPassword.errors.invalidToken')} className="mb-5" />
                )}

                {error && (
                  <Alert type="error" message={error} className="mb-5" />
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    label={t('login.resetPassword.passwordLabel')}
                    placeholder={t('login.resetPassword.passwordPlaceholder')}
                    required
                    autoComplete="new-password"
                    disabled={!token}
                  />
                  <Input
                    type="password"
                    name="confirm"
                    value={confirm}
                    onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                    label={t('login.resetPassword.confirmLabel')}
                    placeholder={t('login.resetPassword.confirmPlaceholder')}
                    required
                    autoComplete="new-password"
                    disabled={!token}
                  />
                  <MuiButton
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || !token}
                    sx={{
                      mt: 1,
                      py: 1.25,
                      bgcolor: '#3b82f6',
                      '&:hover': { bgcolor: '#2563eb' },
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {loading ? '...' : t('login.resetPassword.submitButton')}
                  </MuiButton>
                </form>

                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors"
                  >
                    {t('login.forgotPassword.backToLogin')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ResetPasswordPage;
