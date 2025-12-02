import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createSystem, updateSystem } from '../../store/slices/systemSlice';
import { Input, Select, TextArea, Button, Modal } from '../../components/common';
import type { System, CreateSystemRequest } from '../../types';

interface SystemFormProps {
  isOpen: boolean;
  onClose: () => void;
  system?: System | null;
  parentId?: number | null;
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

const SystemForm: React.FC<SystemFormProps> = ({ isOpen, onClose, system, parentId }) => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const [formData, setFormData] = useState<CreateSystemRequest>({
    name: '',
    type: '',
    location: '',
    description: '',
    parentId: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get available parent systems (exclude current system and its children if editing)
  const getAvailableParentSystems = () => {
    if (!system) {
      // When creating new system, all systems can be parents
      return systems.filter(s => s.status === 'active');
    }

    // When editing, exclude self and descendants
    const getDescendants = (systemId: number): number[] => {
      const descendants: number[] = [systemId];
      systems.forEach(s => {
        if (s.parentId === systemId) {
          descendants.push(...getDescendants(s.id));
        }
      });
      return descendants;
    };

    const excludedIds = getDescendants(system.id);
    return systems.filter(s => !excludedIds.includes(s.id) && s.status === 'active');
  };

  const availableParentSystems = getAvailableParentSystems();

  useEffect(() => {
    if (system) {
      setFormData({
        name: system.name,
        type: system.type,
        location: system.location || '',
        description: system.description || '',
        parentId: system.parentId || null
      });
    } else {
      setFormData({
        name: '',
        type: '',
        location: '',
        description: '',
        parentId: parentId || null
      });
    }
    setErrors({});
  }, [system, isOpen, parentId]);

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
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
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

        {!parentId && (
          <div>
            <Select
              name="parentId"
              value={formData.parentId?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  parentId: value ? parseInt(value) : null
                });
              }}
              options={[
                { value: '', label: 'None (Root System)' },
                ...availableParentSystems.map(s => ({
                  value: s.id.toString(),
                  label: `${s.name} (${s.type})`
                }))
              ]}
              label="Parent System"
              placeholder="Select parent system (optional)"
            />
            <p className="mt-1 text-sm text-gray-500">
              Select a parent system to create a sub-system (e.g., tap under reservoir)
            </p>
          </div>
        )}

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
