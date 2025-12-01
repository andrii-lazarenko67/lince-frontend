import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../hooks';
import { createSystem, updateSystem } from '../../store/slices/systemSlice';
import { Input, Select, TextArea, Button, Modal } from '../../components/common';
import type { System, CreateSystemRequest } from '../../types';

interface SystemFormProps {
  isOpen: boolean;
  onClose: () => void;
  system?: System | null;
}

const systemTypes = [
  { value: 'pool', label: 'Swimming Pool' },
  { value: 'cooling_tower', label: 'Cooling Tower' },
  { value: 'boiler', label: 'Boiler' },
  { value: 'wtp', label: 'Water Treatment Plant (WTP)' },
  { value: 'wwtp', label: 'Wastewater Treatment Plant (WWTP)' },
  { value: 'effluent', label: 'Effluent System' },
  { value: 'other', label: 'Other' }
];

const SystemForm: React.FC<SystemFormProps> = ({ isOpen, onClose, system }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<CreateSystemRequest>({
    name: '',
    type: '',
    location: '',
    description: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (system) {
      setFormData({
        name: system.name,
        type: system.type,
        location: system.location || '',
        description: system.description || ''
      });
    } else {
      setFormData({
        name: '',
        type: '',
        location: '',
        description: ''
      });
    }
    setErrors({});
  }, [system, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.type) newErrors.type = 'Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (system) {
      const result = await dispatch(updateSystem({ id: system.id, data: formData }));
      if (updateSystem.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createSystem(formData));
      if (createSystem.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={system ? 'Edit System' : 'Add New System'} size="lg">
      <form onSubmit={handleSubmit}>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          label="System Name"
          placeholder="Enter system name"
          error={errors.name}
          required
        />

        <Select
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={systemTypes}
          label="System Type"
          placeholder="Select system type"
          error={errors.type}
          required
        />

        <Input
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          label="Location"
          placeholder="Enter location"
        />

        <TextArea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          label="Description"
          placeholder="Enter system description"
          rows={3}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {system ? 'Update' : 'Create'} System
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SystemForm;
