import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Divider,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch, useAppNavigation } from '../../hooks';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { fetchUnreadCount } from '../../store/slices/notificationSlice';

const DRAWER_WIDTH = 256;

const Header: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { goToNotifications, goToSettings, goToLogin, goTo } = useAppNavigation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (user) {
      dispatch(fetchUnreadCount());
    }
  }, [dispatch, user]);

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = () => {
    dispatch(logout());
    goToLogin();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: { xs: 0, lg: DRAWER_WIDTH },
        width: { xs: '100%', lg: `calc(100% - ${DRAWER_WIDTH}px)` },
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1e40af 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {/* Mobile menu button */}
        <IconButton
          onClick={handleToggleSidebar}
          edge="start"
          sx={{
            mr: 2,
            display: { lg: 'none' },
            color: 'white'
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            color: 'white',
            fontWeight: 600,
            display: { xs: 'none', lg: 'block' },
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          {t('login.subtitle')}
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={goToNotifications}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <Badge
              badgeContent={unreadCount > 99 ? '99+' : unreadCount}
              color="error"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton
            onClick={goToSettings}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <SettingsIcon />
          </IconButton>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, height: 32, alignSelf: 'center', bgcolor: 'rgba(255, 255, 255, 0.3)' }}
          />

          {/* User info */}
          {!isMobile && (
            <Box
              onClick={() => goTo('/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: 2,
                px: 1,
                py: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'scale(1.02)'
                }
              }}
            >
              <Box sx={{ mr: 1.5, textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.name || 'User'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.9)', textTransform: 'capitalize' }}>
                  {user?.role ? t(`users.roles.${user.role}`) : 'Role'}
                </Typography>
              </Box>
              <Avatar
                src={user?.avatar || undefined}
                alt={user?.name || 'User'}
                sx={{
                  width: 36,
                  height: 36,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </Box>
          )}

          {/* Logout */}
          <IconButton
            onClick={handleLogout}
            title={t('common.signOut')}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(239, 68, 68, 0.2)'
              }
            }}
          >
            <LogoutIcon />
            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500, color: 'white' }}>
                {t('common.signOut')}
              </Typography>
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
