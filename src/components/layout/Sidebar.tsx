import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  Assignment as AssignmentIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  FolderOpen as FolderOpenIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch, useAppNavigation } from '../../hooks';
import { useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/slices/uiSlice';
import LanguageSwitcher from '../LanguageSwitcher';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  serviceProviderOnly?: boolean;
}

const DRAWER_WIDTH = 256;

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { goTo } = useAppNavigation();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  const handleCloseSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleNavClick = (path: string) => {
    goTo(path);
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  };

  const navItems: NavItem[] = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: <DashboardIcon /> },
    { name: t('nav.clients'), path: '/clients', icon: <BusinessIcon />, roles: ['manager', 'admin'], serviceProviderOnly: true },
    { name: t('nav.systems'), path: '/systems', icon: <StorageIcon />, roles: ['manager', 'admin'] },
    { name: t('nav.dailyLogs'), path: '/daily-logs', icon: <AssignmentIcon /> },
    { name: t('nav.inspections'), path: '/inspections', icon: <PlaylistAddCheckIcon /> },
    { name: t('nav.incidents'), path: '/incidents', icon: <WarningIcon /> },
    { name: t('nav.products'), path: '/products', icon: <InventoryIcon />, roles: ['manager', 'admin'] },
    { name: t('nav.reports'), path: '/reports', icon: <AssessmentIcon /> },
    { name: t('nav.library'), path: '/library', icon: <FolderOpenIcon />, roles: ['manager', 'admin'] },
    { name: t('nav.users'), path: '/users', icon: <PeopleIcon />, roles: ['admin'] },
    { name: t('nav.settings'), path: '/settings', icon: <SettingsIcon />, roles: ['admin'] }
  ];

  const filteredNavItems = navItems.filter(item => {
    // Check service provider only items
    if (item.serviceProviderOnly && !user?.isServiceProvider) return false;
    // Check role restrictions
    if (item.roles && (!user || !item.roles.includes(user.role))) return false;
    return true;
  });

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'primary.main' }}>
      {/* Logo Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        px: 2.5,
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            width: 40,
            height: 40,
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}>
            <InventoryIcon sx={{ color: 'white', fontSize: 24 }} />
          </Avatar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: 2
            }}
          >
            LINCE
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={handleCloseSidebar} sx={{ color: '#1e40af' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        <List>
          {filteredNavItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                selected={isActive(item.path)}
                sx={{
                  px: 2,
                  py: 1.6,
                  borderRadius: 1.5,
                  color: 'primary.contrastText',
                  opacity: 0.8,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    opacity: 0.6
                  },
                  '&.Mui-selected': {
                    bgcolor: 'primary.dark',
                    opacity: 1,
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  slotProps={{
                    primary: { fontSize: 14, fontWeight: 500 }
                  }}
                />
                {isActive(item.path) && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.light' }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Profile & Language Switcher */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'primary.dark', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <LanguageSwitcher />
        </Box>
        <Box
          onClick={() => handleNavClick('/profile')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'primary.dark',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'primary.light',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <Avatar
            src={user?.avatar || undefined}
            sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', width: 40, height: 40, fontWeight: 700 }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ ml: 1.5, flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} color="primary.contrastText" noWrap>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'primary.contrastText', opacity: 0.7, textTransform: 'capitalize' }}>
              {user?.role ? t(`users.roles.${user.role}`) : 'Role'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        ModalProps={{
          keepMounted: true, // Better mobile performance
          container: document.getElementById('modal-root') || document.body
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Box
        data-desktop-drawer="true"
        sx={{ display: { xs: 'none', lg: 'block' } }}
      >
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' }
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
    </>
  );
};

export default Sidebar;
