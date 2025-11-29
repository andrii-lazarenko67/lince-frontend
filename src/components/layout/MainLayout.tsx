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
  const { sidebarOpen } = useAppSelector((state) => state.ui);
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
    <div className="min-h-screen bg-gray-100">
      <GlobalLoader />
      <Sidebar />
      <Header />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => {}}
        />
      )}

      <main className="lg:ml-64 pt-16 min-h-screen">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
