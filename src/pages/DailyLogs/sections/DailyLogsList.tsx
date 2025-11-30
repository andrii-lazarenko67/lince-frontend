import React from 'react';
import { useAppSelector, useAppNavigation } from '../../../hooks';
import { Table, Badge } from '../../../components/common';
import type { DailyLog } from '../../../types';

const DailyLogsList: React.FC = () => {
  const { dailyLogs } = useAppSelector((state) => state.dailyLogs);
  const { goToDailyLogDetail } = useAppNavigation();

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (log: DailyLog) => (
        <span className="font-medium text-gray-900">
          {new Date(log.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'system',
      header: 'System',
      render: (log: DailyLog) => log.system?.name || '-'
    },
    {
      key: 'user',
      header: 'Recorded By',
      render: (log: DailyLog) => log.user?.name || '-'
    },
    {
      key: 'entries',
      header: 'Entries',
      render: (log: DailyLog) => {
        const outOfRange = log.entries?.filter(e => e.isOutOfRange).length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span>{log.entries?.length || 0} entries</span>
            {outOfRange > 0 && (
              <Badge variant="danger">{outOfRange} out of range</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (log: DailyLog) => new Date(log.createdAt).toLocaleString()
    }
  ];

  return (
    <Table
      columns={columns}
      data={dailyLogs}
      keyExtractor={(log) => log.id}
      onRowClick={(log) => goToDailyLogDetail(log.id)}
      emptyMessage="No daily logs found. Click 'New Log' to create one."
    />
  );
};

export default DailyLogsList;
