import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { createMonitoringPoint, updateMonitoringPoint } from '../../store/slices/monitoringPointSlice';
import { Input, Select, Button, Modal } from '../../components/common';
import type { MonitoringPoint, CreateMonitoringPointRequest } from '../../types';

interface MonitoringPointFormProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: number;
  monitoringPoint?: MonitoringPoint | null;
}

const parameterOptions = [
  { value: 'pH', label: 'pH' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'turbidity', label: 'Turbidity' },
  { value: 'chlorine', label: 'Chlorine' },
  { value: 'conductivity', label: 'Conductivity' },
  { value: 'dissolved_oxygen', label: 'Dissolved Oxygen' },
  { value: 'tds', label: 'TDS (Total Dissolved Solids)' },
  { value: 'hardness', label: 'Hardness' },
  { value: 'alkalinity', label: 'Alkalinity' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'flow_rate', label: 'Flow Rate' },
  { value: 'other', label: 'Other' }
];

const unitOptions = [
  { value: 'pH', label: 'pH' },
  { value: '°C', label: '°C' },
  { value: '°F', label: '°F' },
  { value: 'NTU', label: 'NTU' },
  { value: 'mg/L', label: 'mg/L' },
  { value: 'ppm', label: 'ppm' },
  { value: 'µS/cm', label: 'µS/cm' },
  { value: 'bar', label: 'bar' },
  { value: 'psi', label: 'psi' },
  { value: 'L/min', label: 'L/min' },
  { value: 'm³/h', label: 'm³/h' },
  { value: '%', label: '%' }
];

const MonitoringPointForm: React.FC<MonitoringPointFormProps> = ({
  isOpen,
  onClose,
  systemId,
  monitoringPoint
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<CreateMonitoringPointRequest>({
    systemId: systemId,
    name: '',
    parameter: '',
    unit: '',
    minValue: undefined,
    maxValue: undefined,
    alertEnabled: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (monitoringPoint) {
      setFormData({
        systemId: systemId,
        name: monitoringPoint.name,
        parameter: monitoringPoint.parameter,
        unit: monitoringPoint.unit,
        minValue: monitoringPoint.minValue ?? undefined,
        maxValue: monitoringPoint.maxValue ?? undefined,
        alertEnabled: monitoringPoint.alertEnabled
      });
    } else {
      setFormData({
        systemId: systemId,
        name: '',
        parameter: '',
        unit: '',
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.parameter) newErrors.parameter = 'Parameter is required';
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

    if (monitoringPoint) {
      const result = await dispatch(updateMonitoringPoint({
        id: monitoringPoint.id,
        data: {
          name: formData.name,
          parameter: formData.parameter,
          unit: formData.unit,
          minValue: formData.minValue,
          maxValue: formData.maxValue,
          alertEnabled: formData.alertEnabled
        }
      }));
      if (updateMonitoringPoint.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createMonitoringPoint(formData));
      if (createMonitoringPoint.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={monitoringPoint ? 'Edit Monitoring Point' : 'Add Monitoring Point'}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
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
          name="parameter"
          value={formData.parameter}
          onChange={handleChange}
          options={parameterOptions}
          label="Parameter"
          placeholder="Select parameter"
          error={errors.parameter}
          required
        />

        <Select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          options={unitOptions}
          label="Unit"
          placeholder="Select unit"
          error={errors.unit}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            name="minValue"
            value={formData.minValue ?? ''}
            onChange={handleChange}
            label="Min Value"
            placeholder="Enter minimum value"
            step="0.01"
            error={errors.minValue}
          />

          <Input
            type="number"
            name="maxValue"
            value={formData.maxValue ?? ''}
            onChange={handleChange}
            label="Max Value"
            placeholder="Enter maximum value"
            step="0.01"
            error={errors.maxValue}
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="alertEnabled"
              checked={formData.alertEnabled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">Enable alerts when out of range</span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {monitoringPoint ? 'Update' : 'Create'} Monitoring Point
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MonitoringPointForm;
