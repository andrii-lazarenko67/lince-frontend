import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip } from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { logout } from '../../store/slices/authSlice';

interface BillingLayoutProps {
  children: React.ReactNode;
}

const BillingLayout: React.FC<BillingLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goTo } = useAppNavigation();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    goTo('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <img src="/logo.png" alt="LINCE" className="h-12 w-auto" />
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 hidden sm:block">{user.name}</span>
              <Tooltip title={t('common.signOut')}>
                <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary' }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-center">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} LINCE · {t('landing.footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BillingLayout;
