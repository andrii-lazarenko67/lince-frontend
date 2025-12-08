import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDailyLogById } from '../../store/slices/dailyLogSlice';
import { Card, Badge, Table } from '../../components/common';
import type { DailyLogEntry } from '../../types';

const DailyLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentDailyLog } = useAppSelector((state) => state.dailyLogs);
  const { goBack } = useAppNavigation();

  useEffect(() => {
    if (id) {
      dispatch(fetchDailyLogById(Number(id)));
    }
  }, [dispatch, id]);

  const entryColumns = [
    {
      key: 'monitoringPoint',
      header: 'Monitoring Point',
      render: (entry: DailyLogEntry) => (
        <span className="font-medium text-gray-900">
          {entry.monitoringPoint?.name || '-'}
        </span>
      )
    },
    {
      key: 'parameter',
      header: 'Parameter',
      render: (entry: DailyLogEntry) => entry.monitoringPoint?.parameterObj?.name || '-'
    },
    {
      key: 'value',
      header: 'Value',
      render: (entry: DailyLogEntry) => (
        <span className={entry.isOutOfRange ? 'text-red-600 font-medium' : ''}>
          {entry.value}
          {entry.monitoringPoint?.unitObj ? ` ${entry.monitoringPoint.unitObj.abbreviation}` : ''}
        </span>
      )
    },
    {
      key: 'range',
      header: 'Expected Range',
      render: (entry: DailyLogEntry) => {
        const mp = entry.monitoringPoint;
        if (mp && mp.minValue !== null && mp.maxValue !== null) {
          return `${mp.minValue} - ${mp.maxValue}`;
        }
        return <span className="text-gray-400">N/A</span>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (entry: DailyLogEntry) => (
        <Badge variant={entry.isOutOfRange ? 'danger' : 'success'}>
          {entry.isOutOfRange ? 'Out of Range' : 'Normal'}
        </Badge>
      )
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (entry: DailyLogEntry) => entry.notes || '-'
    }
  ];

  if (!currentDailyLog) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading daily log details...</p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Record Details</h1>
          <p className="text-gray-500 mt-1">
            {currentDailyLog.recordType === 'field' ? 'Field Record' : 'Laboratory Record'} - {new Date(currentDailyLog.date).toLocaleDateString()} - {currentDailyLog.system?.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Record Information" className="lg:col-span-1">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Record Type</dt>
              <dd className="mt-1">
                <Badge variant={currentDailyLog.recordType === 'field' ? 'primary' : 'info'}>
                  {currentDailyLog.recordType === 'field' ? 'Field Record' : 'Laboratory Record'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">System</dt>
              <dd className="mt-1 text-gray-900">{currentDailyLog.system?.name}</dd>
            </div>
            {currentDailyLog.stage && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Stage</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.stage.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentDailyLog.date).toLocaleDateString()}
              </dd>
            </div>
            {currentDailyLog.period && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Period</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.period}</dd>
              </div>
            )}
            {currentDailyLog.time && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Time</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.time}</dd>
              </div>
            )}
            {currentDailyLog.recordType === 'laboratory' && (
              <>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Laboratory</dt>
                  <dd className="mt-1 text-gray-900">{currentDailyLog.laboratory}</dd>
                </div>
                {currentDailyLog.collectionDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Collection Date</dt>
                    <dd className="mt-1 text-gray-900">
                      {new Date(currentDailyLog.collectionDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                {currentDailyLog.collectionTime && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Collection Time</dt>
                    <dd className="mt-1 text-gray-900">{currentDailyLog.collectionTime}</dd>
                  </div>
                )}
              </>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Recorded By</dt>
              <dd className="mt-1 text-gray-900">{currentDailyLog.user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                {outOfRangeCount > 0 ? (
                  <Badge variant="danger">{outOfRangeCount} out of range</Badge>
                ) : (
                  <Badge variant="success">All values normal</Badge>
                )}
              </dd>
            </div>
            {currentDailyLog.notes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-gray-900">{currentDailyLog.notes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Monitoring Entries" className="lg:col-span-2" noPadding>
          <Table
            columns={entryColumns}
            data={currentDailyLog.entries || []}
            keyExtractor={(entry) => entry.id}
            emptyMessage="No entries recorded for this log."
          />
        </Card>
      </div>
    </div>
  );
};

export default DailyLogDetailPage;
