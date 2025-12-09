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
  { value: 'monitoring_point', label: 'Monitoring Point' },
  { value: 'other', label: 'Other' }
];

const SystemForm: React.FC<SystemFormProps> = ({ isOpen, onClose, system, parentId }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.ui);
  const [formData, setFormData] = useState<CreateSystemRequest>({
    name: '',
    type: '',
    location: '',
    description: '',
    parentId: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});


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
        type: parentId ? 'monitoring_point' : '', // Default type for sub-systems
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
    // Only validate name and type for root systems (not sub-systems)
    if (!parentId) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.type) newErrors.type = 'Type is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare data for submission
    const submitData = { ...formData };

    // For sub-systems, set default name and type if not provided
    if (parentId && !system) {
      if (!submitData.name) {
        submitData.name = 'Monitoring Point'; // Default name
      }
      if (!submitData.type) {
        submitData.type = 'monitoring_point'; // Already set in useEffect
      }
    }

    if (system) {
      const result = await dispatch(updateSystem({ id: system.id, data: submitData }));
      if (updateSystem.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createSystem(submitData));
      if (createSystem.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={system ? 'Edit System' : (parentId ? 'Add Monitoring Point' : 'Add New System')} size="lg">
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        {/* Only show name and type when NOT creating a sub-system */}
        {!parentId && (
          <>
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
          </>
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
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (system ? 'Updating...' : 'Creating...') : (system ? 'Update' : 'Create')} {!loading && 'System'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SystemForm;
