import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDailyLogById } from '../../store/slices/dailyLogSlice';
import { Card, Badge, Table } from '../../components/common';
import type { DailyLogEntry } from '../../types';
import { useTour, useAutoStartTour, DAILY_LOGS_DETAIL_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const DailyLogDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentDailyLog } = useAppSelector((state) => state.dailyLogs);
  const { goBack } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(DAILY_LOGS_DETAIL_TOUR);

  useEffect(() => {
    if (id) {
      dispatch(fetchDailyLogById(Number(id)));
    }
  }, [dispatch, id]);

  const entryColumns = [
    {
      key: 'monitoringPoint',
      header: t('dailyLogs.detail.monitoringPoint'),
      render: (entry: DailyLogEntry) => (
        <div>
          <span className="font-medium text-gray-900">
            {entry.monitoringPoint?.name || '-'}
          </span>
          {entry.monitoringPoint?.parameterObj && (
            <span className="text-xs text-gray-500 ml-2">
              ({entry.monitoringPoint.parameterObj.name})
            </span>
          )}
        </div>
      )
    },
    {
      key: 'value',
      header: t('dailyLogs.detail.value'),
      render: (entry: DailyLogEntry) => (
        <span className={entry.isOutOfRange ? 'text-red-600 font-medium' : ''}>
          {entry.value}
          {entry.monitoringPoint?.unitObj ? ` ${entry.monitoringPoint.unitObj.abbreviation}` : ''}
        </span>
      )
    },
    {
      key: 'range',
      header: t('dailyLogs.detail.expectedRange'),
      render: (entry: DailyLogEntry) => {
        const mp = entry.monitoringPoint;
        if (mp && mp.minValue !== null && mp.maxValue !== null) {
          return `${mp.minValue} - ${mp.maxValue}`;
        }
        return <span className="text-gray-400">{t('dailyLogs.detail.na')}</span>;
      }
    },
    {
      key: 'status',
      header: t('dailyLogs.detail.status'),
      render: (entry: DailyLogEntry) => (
        <Badge variant={entry.isOutOfRange ? 'danger' : 'success'}>
          {entry.isOutOfRange ? t('dailyLogs.detail.outOfRange') : t('dailyLogs.detail.normal')}
        </Badge>
      )
    },
    {
      key: 'notes',
      header: t('dailyLogs.detail.notes'),
      render: (entry: DailyLogEntry) => entry.notes || '-'
    }
  ];

  if (!currentDailyLog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('dailyLogs.detail.loading')}</p>
      </div>
    );
  }

  const outOfRangeCount = currentDailyLog.entries?.filter(e => e.isOutOfRange).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1" data-tour="detail-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('dailyLogs.detail.title')}</h1>
          <p className="text-gray-500 mt-1">
            {currentDailyLog.recordType === 'field' ? t('dailyLogs.recordType.field') : t('dailyLogs.recordType.laboratory')} - {new Date(currentDailyLog.date).toLocaleDateString()} - {currentDailyLog.system?.name}
          </p>
        </div>
        <Tooltip title={isCompleted(DAILY_LOGS_DETAIL_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(DAILY_LOGS_DETAIL_TOUR)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-tour="record-info">
          <Card title={t('dailyLogs.detail.recordInformation')} className="lg:col-span-1">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.recordType')}</dt>
                <dd className="mt-1">
                  <Badge variant={currentDailyLog.recordType === 'field' ? 'primary' : 'info'}>
                    {currentDailyLog.recordType === 'field' ? t('dailyLogs.recordType.field') : t('dailyLogs.recordType.laboratory')}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.system')}</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.system?.name}</dd>
              </div>
              {currentDailyLog.stage && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.stage')}</dt>
                  <dd className="mt-1 text-gray-900">{currentDailyLog.stage.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.date')}</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(currentDailyLog.date).toLocaleDateString()}
                </dd>
              </div>
              {currentDailyLog.period && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.period')}</dt>
                  <dd className="mt-1 text-gray-900">{currentDailyLog.period}</dd>
                </div>
              )}
              {currentDailyLog.time && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.time')}</dt>
                  <dd className="mt-1 text-gray-900">{currentDailyLog.time}</dd>
                </div>
              )}
              {currentDailyLog.recordType === 'laboratory' && (
                <>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.laboratory')}</dt>
                    <dd className="mt-1 text-gray-900">{currentDailyLog.laboratory}</dd>
                  </div>
                  {currentDailyLog.collectionDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.collectionDate')}</dt>
                      <dd className="mt-1 text-gray-900">
                        {new Date(currentDailyLog.collectionDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {currentDailyLog.collectionTime && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.collectionTime')}</dt>
                      <dd className="mt-1 text-gray-900">{currentDailyLog.collectionTime}</dd>
                    </div>
                  )}
                </>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.recordedBy')}</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.user?.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.status')}</dt>
                <dd className="mt-1">
                  {outOfRangeCount > 0 ? (
                    <Badge variant="danger">{t('dailyLogs.detail.outOfRangeCount', { count: outOfRangeCount })}</Badge>
                  ) : (
                    <Badge variant="success">{t('dailyLogs.detail.allNormal')}</Badge>
                  )}
                </dd>
              </div>
              {currentDailyLog.notes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('dailyLogs.detail.notes')}</dt>
                  <dd className="mt-1 text-gray-900">{currentDailyLog.notes}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        <div data-tour="monitoring-entries" className="lg:col-span-2">
          <Card title={t('dailyLogs.detail.monitoringEntries')} noPadding>
            <Table
              columns={entryColumns}
              data={currentDailyLog.entries || []}
              keyExtractor={(entry) => entry.id}
              emptyMessage={t('dailyLogs.detail.noEntries')}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DailyLogDetailPage;
