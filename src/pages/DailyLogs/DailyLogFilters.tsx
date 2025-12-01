import React from 'react';
import { useAppSelector } from '../../hooks';
import { Select, Input, Button } from '../../components/common';

interface DailyLogFiltersProps {
  filters: {
    systemId: string;
    startDate: string;
    endDate: string;
  };
  onChange: (filters: { systemId: string; startDate: string; endDate: string }) => void;
  onApply: () => void;
  onClear: () => void;
}

const DailyLogFilters: React.FC<DailyLogFiltersProps> = ({
  filters,
  onChange,
  onApply,
  onClear
}) => {
  const { systems } = useAppSelector((state) => state.systems);

  const systemOptions = systems.map(system => ({
    value: system.id,
    label: system.name
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <Select
          name="systemId"
          value={filters.systemId}
          onChange={(e) => onChange({ ...filters, systemId: e.target.value })}
          options={systemOptions}
          label="System"
          placeholder="All Systems"
        />

        <Input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
          label="Start Date"
        />

        <Input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
          label="End Date"
        />

        <div className="flex space-x-2">
          <Button variant="primary" onClick={onApply}>
            Apply
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyLogFilters;
