import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch, useAppNavigation } from '../../hooks';
import { getMe } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { GlobalLoader } from '../common';

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
    <div className="flex min-h-screen bg-gray-100 max-h-screen">
      <GlobalLoader />
      <Sidebar />
      <Header />

      <main className="flex-grow mt-[64px] lg:ml-64 overflow-auto p-3">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
