import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppNavigation } from '../../hooks';
import { fetchDailyLogs } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button } from '../../components/common';
import { DailyLogsList, DailyLogFilters } from './sections';

const DailyLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { goToNewDailyLog } = useAppNavigation();

  const [filters, setFilters] = useState({
    systemId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({}));
    dispatch(fetchDailyLogs({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchDailyLogs({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', startDate: '', endDate: '' });
    dispatch(fetchDailyLogs({}));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-500 mt-1">Record and view daily monitoring data</p>
        </div>
        <Button variant="primary" onClick={goToNewDailyLog}>
          New Log
        </Button>
      </div>

      <DailyLogFilters
        filters={filters}
        onChange={setFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <Card noPadding>
        <DailyLogsList />
      </Card>
    </div>
  );
};

export default DailyLogsPage;
