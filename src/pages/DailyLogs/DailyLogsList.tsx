import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Table, Badge } from '../../components/common';
import type { DailyLog } from '../../types';

const DailyLogsList: React.FC = () => {
  const { t } = useTranslation();
  const { dailyLogs } = useAppSelector((state) => state.dailyLogs);
  const { goToDailyLogDetail } = useAppNavigation();

  const columns = [
    {
      key: 'recordType',
      header: t('dailyLogs.list.type'),
      render: (log: DailyLog) => (
        <Badge variant={log.recordType === 'field' ? 'primary' : 'info'}>
          {log.recordType === 'field' ? t('dailyLogs.list.field') : t('dailyLogs.list.lab')}
        </Badge>
      )
    },
    {
      key: 'date',
      header: t('dailyLogs.list.date'),
      render: (log: DailyLog) => (
        <span className="font-medium text-gray-900">
          {new Date(log.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'system',
      header: t('dailyLogs.list.system'),
      render: (log: DailyLog) => (
        <div>
          <div>{log.system?.name || '-'}</div>
          {log.stage && (
            <div className="text-xs text-gray-500">{t('dailyLogs.list.stage')}: {log.stage.name}</div>
          )}
        </div>
      )
    },
    {
      key: 'period',
      header: t('dailyLogs.list.period'),
      render: (log: DailyLog) => log.period ? t(`dailyLogs.period.${log.period}`, { defaultValue: log.period }) : '-'
    },
    {
      key: 'laboratory',
      header: t('dailyLogs.list.laboratory'),
      render: (log: DailyLog) => log.recordType === 'laboratory' ? (log.laboratory || '-') : '-'
    },
    {
      key: 'user',
      header: t('dailyLogs.list.recordedBy'),
      render: (log: DailyLog) => log.user?.name || '-'
    },
    {
      key: 'entries',
      header: t('dailyLogs.list.entries'),
      render: (log: DailyLog) => {
        const outOfRange = log.entries?.filter(e => e.isOutOfRange).length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span>{log.entries?.length || 0}</span>
            {outOfRange > 0 && (
              <Badge variant="danger">{t('dailyLogs.list.alert', { count: outOfRange })}</Badge>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <Table
      columns={columns}
      data={dailyLogs}
      keyExtractor={(log) => log.id}
      onRowClick={(log) => goToDailyLogDetail(log.id)}
      emptyMessage={t('dailyLogs.list.emptyMessage')}
    />
  );
};

export default DailyLogsList;
