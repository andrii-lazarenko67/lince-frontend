import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAppSelector, useAppDispatch, useAppNavigation } from '../../hooks';
import { getMe } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { GlobalLoader } from '../common';

const DRAWER_WIDTH = 256;

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const { goToLogin } = useAppNavigation();

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe());
    }
  }, [dispatch, token, user]);

  useEffect(() => {
    if (!token) {
      goToLogin();
    }
  }, [token, goToLogin]);

  if (!token) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
      <GlobalLoader />
      <Sidebar />
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          ml: { xs: 0, lg: `${DRAWER_WIDTH}px` },
          pt: '64px'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
