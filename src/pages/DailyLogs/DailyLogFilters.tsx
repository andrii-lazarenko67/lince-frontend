import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Select, DateInput, Button } from '../../components/common';
import type { System } from '../../types';

interface DailyLogFiltersProps {
  filters: {
    systemId: string;
    stageId: string;
    recordType: string;
    startDate: string;
    endDate: string;
  };
  onChange: (filters: { systemId: string; stageId: string; recordType: string; startDate: string; endDate: string }) => void;
  onApply: () => void;
  onClear: () => void;
}

const DailyLogFilters: React.FC<DailyLogFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onClear
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const [stages, setStages] = useState<System[]>([]);

  const systemOptions = systems.map(system => ({
    value: system.id,
    label: system.name
  }));

  // Fetch stages (children) when system is selected
  useEffect(() => {
    if (filters.systemId) {
      dispatch(fetchSystems({ parentId: Number(filters.systemId) }))
        .unwrap()
        .then((fetchedSystems) => {
          setStages(fetchedSystems);
        })
        .catch(() => {
          setStages([]);
        });
    } else {
      setStages([]);
    }
  }, [filters.systemId, dispatch]);

  const stageOptions = stages.map(stage => ({
    value: stage.id,
    label: stage.name
  }));

  const recordTypeOptions = [
    { value: 'field', label: t('dailyLogs.filters.fieldRecords') },
    { value: 'laboratory', label: t('dailyLogs.filters.laboratoryRecords') }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <Select
            name="recordType"
            value={filters.recordType}
            onChange={(e) => onChange({ ...filters, recordType: e.target.value, stageId: '' })}
            options={recordTypeOptions}
            label={t('dailyLogs.filters.recordType')}
            placeholder={t('dailyLogs.filters.allTypes')}
          />
        </div>

        <div>
          <Select
            name="systemId"
            value={filters.systemId}
            onChange={(e) => onChange({ ...filters, systemId: e.target.value, stageId: '' })}
            options={systemOptions}
            label={t('dailyLogs.filters.system')}
            placeholder={t('dailyLogs.filters.allSystems')}
          />
        </div>

        {stageOptions.length > 0 && (
          <div>
            <Select
              name="stageId"
              value={filters.stageId}
              onChange={(e) => onChange({ ...filters, stageId: e.target.value })}
              options={stageOptions}
              label={t('dailyLogs.filters.stage')}
              placeholder={t('dailyLogs.filters.allStages')}
            />
          </div>
        )}

        <div>
          <DateInput
            name="startDate"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            label={t('dailyLogs.filters.startDate')}
          />
        </div>

        <div>
          <DateInput
            name="endDate"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            label={t('dailyLogs.filters.endDate')}
          />
        </div>

        <div className="flex space-x-2 items-end">
          <Button variant="primary" onClick={onApply} className="flex-1">
            {t('dailyLogs.filters.apply')}
          </Button>
          <Button variant="outline" onClick={onClear} className="flex-1">
            {t('dailyLogs.filters.clear')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyLogFilters;
