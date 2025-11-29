import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createDailyLog } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints } from '../../store/slices/monitoringPointSlice';
import { Card, Button, Select, Input, TextArea } from '../../components/common';

interface EntryValue {
  monitoringPointId: number;
  value: string;
  notes: string;
}

const NewDailyLogPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { goBack, goToDailyLogs } = useAppNavigation();

  const [formData, setFormData] = useState({
    systemId: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    notes: ''
  });
  const [entries, setEntries] = useState<EntryValue[]>([]);

  useEffect(() => {
    dispatch(fetchSystems());
  }, [dispatch]);

  useEffect(() => {
    if (formData.systemId) {
      dispatch(fetchMonitoringPoints(Number(formData.systemId)));
    }
  }, [dispatch, formData.systemId]);

  useEffect(() => {
    if (monitoringPoints.length > 0) {
      setEntries(monitoringPoints.map(mp => ({
        monitoringPointId: mp.id,
        value: '',
        notes: ''
      })));
    }
  }, [monitoringPoints]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEntryChange = (index: number, field: 'value' | 'notes', value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.systemId) {
      alert('Please select a system');
      return;
    }

    const validEntries = entries.filter(e => e.value !== '').map(e => ({
      monitoringPointId: e.monitoringPointId,
      value: parseFloat(e.value),
      notes: e.notes || undefined
    }));

    if (validEntries.length === 0) {
      alert('Please enter at least one value');
      return;
    }

    const result = await dispatch(createDailyLog({
      systemId: Number(formData.systemId),
      date: formData.date,
      shift: formData.shift as 'morning' | 'afternoon' | 'night',
      notes: formData.notes || undefined,
      entries: validEntries
    }));

    if (createDailyLog.fulfilled.match(result)) {
      goToDailyLogs();
    }
  };

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));
  const shiftOptions = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'night', label: 'Night' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Daily Log</h1>
          <p className="text-gray-500 mt-1">Record monitoring data for a system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Log Information" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              name="systemId"
              value={formData.systemId}
              onChange={handleChange}
              options={systemOptions}
              label="System"
              placeholder="Select system"
              required
            />

            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              label="Date"
              required
            />

            <Select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              options={shiftOptions}
              label="Shift"
              required
            />
          </div>

          <TextArea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            label="General Notes"
            placeholder="Enter any general notes for this log"
            rows={2}
          />
        </Card>

        {monitoringPoints.length > 0 && (
          <Card title="Monitoring Values" className="mb-6">
            <div className="space-y-4">
              {monitoringPoints.map((mp, index) => (
                <div key={mp.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{mp.name}</p>
                    <p className="text-xs text-gray-500">
                      {mp.parameter} ({mp.unit})
                      {mp.minValue !== null && mp.maxValue !== null && (
                        <span className="ml-2">Range: {mp.minValue} - {mp.maxValue}</span>
                      )}
                    </p>
                  </div>

                  <Input
                    type="number"
                    name={`value-${mp.id}`}
                    value={entries[index]?.value || ''}
                    onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                    placeholder={`Enter ${mp.parameter}`}
                    step="0.01"
                  />

                  <Input
                    type="text"
                    name={`notes-${mp.id}`}
                    value={entries[index]?.notes || ''}
                    onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Log
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewDailyLogPage;
