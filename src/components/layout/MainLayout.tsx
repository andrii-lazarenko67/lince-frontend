import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch, useAppNavigation } from '../../hooks';
import { getMe } from '../../store/slices/authSlice';
import Sidebar from './Sidebar';
import Header from './Header';
import { GlobalLoader } from '../common';
import { AiChatSidebar, AiChatButton } from '../ai/AiChatSidebar';
import type { AiContext } from '../../api/aiApi';

const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);
  const { goToLogin } = useAppNavigation();
  const [aiChatOpen, setAiChatOpen] = useState(false);

  // Get current page context for AI
  const getPageContext = (): AiContext => {
    const path = location.pathname;
    let page = 'dashboard';

    if (path.includes('/systems')) page = 'systems';
    else if (path.includes('/monitoring-points')) page = 'monitoring-points';
    else if (path.includes('/daily-logs')) page = 'daily-logs';
    else if (path.includes('/inspections')) page = 'inspections';
    else if (path.includes('/incidents')) page = 'incidents';
    else if (path.includes('/reports')) page = 'reports';
    else if (path.includes('/products')) page = 'products';

    return { page };
  };

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

      {/* AI Assistant */}
      <AiChatSidebar
        open={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        context={getPageContext()}
      />
      <AiChatButton
        onClick={() => setAiChatOpen(true)}
        hasContext={!!getPageContext().page}
      />
    </div>
  );
};

export default MainLayout;
