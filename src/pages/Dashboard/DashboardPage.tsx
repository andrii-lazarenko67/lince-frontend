import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { StatsSection, RecentActivitySection, AlertsSection } from './sections';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'User'}</p>
        </div>
      </div>

      <StatsSection />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivitySection />
        <AlertsSection />
      </div>
    </div>
  );
};

export default DashboardPage;
