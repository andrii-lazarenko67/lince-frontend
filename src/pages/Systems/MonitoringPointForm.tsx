import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createMonitoringPoint, updateMonitoringPoint } from '../../store/slices/monitoringPointSlice';
import { fetchParameters } from '../../store/slices/parameterSlice';
import { fetchUnits } from '../../store/slices/unitSlice';
import { Input, Select, Button, Modal } from '../../components/common';
import type { MonitoringPoint, CreateMonitoringPointRequest } from '../../types';

interface MonitoringPointFormProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: number;
  monitoringPoint?: MonitoringPoint | null;
}

const MonitoringPointForm: React.FC<MonitoringPointFormProps> = ({
  isOpen,
  onClose,
  systemId,
  monitoringPoint
}) => {
  const dispatch = useAppDispatch();
  const { parameters } = useAppSelector((state) => state.parameters);
  const { units } = useAppSelector((state) => state.units);
  const { loading } = useAppSelector((state) => state.ui);

  const [formData, setFormData] = useState<CreateMonitoringPointRequest>({
    systemId: systemId,
    name: '',
    parameterId: 0,
    unitId: null,
    minValue: undefined,
    maxValue: undefined,
    alertEnabled: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch parameters and units when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchParameters());
      dispatch(fetchUnits());
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (monitoringPoint) {
      setFormData({
        systemId: systemId,
        name: monitoringPoint.name,
        parameterId: monitoringPoint.parameterId,
        unitId: monitoringPoint.unitId,
        minValue: monitoringPoint.minValue ?? undefined,
        maxValue: monitoringPoint.maxValue ?? undefined,
        alertEnabled: monitoringPoint.alertEnabled
      });
    } else {
      setFormData({
        systemId: systemId,
        name: '',
        parameterId: 0,
        unitId: null,
        minValue: undefined,
        maxValue: undefined,
        alertEnabled: true
      });
    }
    setErrors({});
  }, [monitoringPoint, isOpen, systemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'minValue' || name === 'maxValue') {
      setFormData({
        ...formData,
        [name]: value === '' ? undefined : parseFloat(value)
      });
    } else if (name === 'parameterId' || name === 'unitId') {
      setFormData({
        ...formData,
        [name]: value === '' ? null : parseInt(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Check if range is defined (both min and max values set)
  const hasRange = formData.minValue !== undefined && formData.maxValue !== undefined;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.parameterId || formData.parameterId === 0) newErrors.parameterId = 'Parameter is required';
    // Unit is now optional - no validation required
    if (formData.minValue !== undefined && formData.maxValue !== undefined) {
      if (formData.minValue >= formData.maxValue) {
        newErrors.minValue = 'Min value must be less than max value';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Auto-disable alerts if no range is set
    const alertEnabled = hasRange ? formData.alertEnabled : false;

    if (monitoringPoint) {
      const result = await dispatch(updateMonitoringPoint({
        id: monitoringPoint.id,
        data: {
          name: formData.name,
          parameterId: formData.parameterId,
          unitId: formData.unitId,
          minValue: formData.minValue,
          maxValue: formData.maxValue,
          alertEnabled
        }
      }));
      if (updateMonitoringPoint.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createMonitoringPoint({
        ...formData,
        alertEnabled
      }));
      if (createMonitoringPoint.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  // Generate options from Redux data
  const parameterOptions = parameters.map(p => ({
    value: p.id,
    label: p.name
  }));

  const unitOptions = units.map(u => ({
    value: u.id,
    label: `${u.name} (${u.abbreviation})`
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={monitoringPoint ? 'Edit Monitoring Point' : 'Add Monitoring Point'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          label="Name"
          placeholder="Enter monitoring point name"
          error={errors.name}
          required
        />

        <Select
          name="parameterId"
          value={formData.parameterId.toString()}
          onChange={handleChange}
          options={parameterOptions}
          label="Parameter"
          placeholder="Select parameter"
          error={errors.parameterId}
          required
        />

        <Select
          name="unitId"
          value={formData.unitId?.toString() || ''}
          onChange={handleChange}
          options={[
            { value: '', label: 'None (N/A)' },
            ...unitOptions
          ]}
          label="Unit (Optional)"
          placeholder="Select unit or leave as N/A"
          error={errors.unitId}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            name="minValue"
            value={formData.minValue ?? ''}
            onChange={handleChange}
            label="Min Value (Optional)"
            placeholder="Leave empty for N/A"
            step="0.01"
            error={errors.minValue}
          />

          <Input
            type="number"
            name="maxValue"
            value={formData.maxValue ?? ''}
            onChange={handleChange}
            label="Max Value (Optional)"
            placeholder="Leave empty for N/A"
            step="0.01"
            error={errors.maxValue}
          />
        </div>
        <p className="text-sm text-gray-500">
          Leave min/max empty for parameters without a valid range (e.g., Water Meter Reading).
        </p>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="alertEnabled"
              checked={hasRange ? formData.alertEnabled : false}
              onChange={handleChange}
              disabled={!hasRange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
            />
            <span className={`text-sm font-medium ${hasRange ? 'text-gray-700' : 'text-gray-400'}`}>
              Enable alerts when out of range
            </span>
          </label>
          {!hasRange && (
            <p className="text-sm text-gray-400 mt-1 ml-6">
              Alerts require min and max values to be set.
            </p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (monitoringPoint ? 'Updating...' : 'Creating...') : `${monitoringPoint ? 'Update' : 'Create'} Monitoring Point`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MonitoringPointForm;
