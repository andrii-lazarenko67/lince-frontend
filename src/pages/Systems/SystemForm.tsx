import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createSystem, updateSystem } from '../../store/slices/systemSlice';
import { fetchSystemTypes } from '../../store/slices/systemTypeSlice';
import { Input, Select, TextArea, Button, Modal } from '../../components/common';
import type { System, CreateSystemRequest } from '../../types';

interface SystemFormProps {
  isOpen: boolean;
  onClose: () => void;
  system?: System | null;
  parentId?: number | null;
}

const SystemForm: React.FC<SystemFormProps> = ({ isOpen, onClose, system, parentId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.ui);
  const { systemTypes: systemTypesData } = useAppSelector((state) => state.systemTypes);

  const [formData, setFormData] = useState<CreateSystemRequest>({
    name: '',
    systemTypeId: 0,
    location: '',
    description: '',
    parentId: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch system types on mount
  useEffect(() => {
    dispatch(fetchSystemTypes());
  }, [dispatch]);

  // Convert systemTypes to select options
  const systemTypeOptions = systemTypesData.map(st => ({
    value: st.id.toString(),
    label: st.name
  }));

  useEffect(() => {
    if (system) {
      setFormData({
        name: system.name,
        systemTypeId: system.systemTypeId,
        location: system.location || '',
        description: system.description || '',
        parentId: system.parentId || null
      });
    } else {
      // Find monitoring point type ID (should be ID 7 based on seeders)
      const monitoringPointType = systemTypesData.find(st => st.name.toLowerCase().includes('monitoring') || st.name.toLowerCase().includes('monitoramento'));
      setFormData({
        name: '',
        systemTypeId: parentId && monitoringPointType ? monitoringPointType.id : 0,
        location: '',
        description: '',
        parentId: parentId || null
      });
    }
    setErrors({});
  }, [system, isOpen, parentId, systemTypesData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'systemTypeId' ? parseInt(value) : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    // Only validate name and systemTypeId for root systems (not sub-systems)
    if (!parentId) {
      if (!formData.name.trim()) newErrors.name = t('common.required');
      if (!formData.systemTypeId || formData.systemTypeId === 0) newErrors.systemTypeId = t('common.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare data for submission
    const submitData = { ...formData };

    // For sub-systems, set default name if not provided
    if (parentId && !system) {
      if (!submitData.name) {
        submitData.name = 'Monitoring Point'; // Default name
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
    <Modal isOpen={isOpen} onClose={onClose} title={system ? t('systems.editSystem') : (parentId ? t('systems.addPoint') : t('systems.addSystem'))} size="lg">
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        {/* Only show name and systemTypeId when NOT creating a sub-system */}
        {!parentId && (
          <>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              label={t('common.name')}
              placeholder={t('common.name')}
              error={errors.name}
              required
            />

            <Select
              name="systemTypeId"
              value={formData.systemTypeId.toString()}
              onChange={handleChange}
              options={systemTypeOptions}
              label={t('systems.systemType')}
              placeholder={t('systems.systemType')}
              error={errors.systemTypeId}
              required
            />
          </>
        )}

        <Input
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          label={t('common.location')}
          placeholder={t('common.location')}
        />

        <TextArea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          label={t('common.description')}
          placeholder={t('common.description')}
          rows={3}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('common.loading') : system ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default SystemForm;
