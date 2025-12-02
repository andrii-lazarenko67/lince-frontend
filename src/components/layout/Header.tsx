import React, { useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  Box,
  Divider,
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
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { goToNotifications, goToSettings, goToLogin } = useAppNavigation();
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
        bgcolor: 'rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(12px)',
        borderBottom: 1,
        borderColor: 'divider'
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
            color: 'text.primary'
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
            color: 'text.primary',
            fontWeight: 600,
            display: { xs: 'none', lg: 'block' }
          }}
        >
          Water Treatment Monitoring
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={goToNotifications}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover'
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
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <SettingsIcon />
          </IconButton>

          {/* Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 1, height: 32, alignSelf: 'center' }}
          />

          {/* User info */}
          {!isMobile && (
            <Box sx={{ mr: 1.5, textAlign: 'right' }}>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {user?.role || 'Role'}
              </Typography>
            </Box>
          )}

          {/* Logout */}
          <IconButton
            onClick={handleLogout}
            title="Logout"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <LogoutIcon />
            {!isMobile && (
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                Logout
              </Typography>
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
