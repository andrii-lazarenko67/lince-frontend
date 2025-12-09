import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

const SystemForm: React.FC<SystemFormProps> = ({ isOpen, onClose, system, parentId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.ui);

  const systemTypes = [
    { value: 'pool', label: t('systems.pool') },
    { value: 'cooling_tower', label: t('systems.coolingTower') },
    { value: 'boiler', label: t('systems.boiler') },
    { value: 'wtp', label: t('systems.wtp') },
    { value: 'wwtp', label: t('systems.wwtp') },
    { value: 'effluent', label: t('systems.effluent') },
    { value: 'monitoring_point', label: t('systems.monitoringPoint') },
    { value: 'other', label: t('products.other') }
  ];
  const [formData, setFormData] = useState<CreateSystemRequest>({
    name: '',
    type: '',
    location: '',
    description: '',
    parentId: null
  });
  const [customType, setCustomType] = useState<string>('');
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
      // Check if the type is a custom type (not in the predefined list)
      const isPredefinedType = systemTypes.some(st => st.value === system.type);
      if (!isPredefinedType && system.type) {
        setCustomType(system.type);
        setFormData(prev => ({ ...prev, type: 'other' }));
      } else {
        setCustomType('');
      }
    } else {
      setFormData({
        name: '',
        type: parentId ? 'monitoring_point' : '', // Default type for sub-systems
        location: '',
        description: '',
        parentId: parentId || null
      });
      setCustomType('');
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
      if (!formData.name.trim()) newErrors.name = t('common.required');
      if (!formData.type) newErrors.type = t('common.required');
      if (formData.type === 'other' && !customType.trim()) {
        newErrors.customType = t('systems.customTypeRequired');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare data for submission
    const submitData = { ...formData };

    // If 'other' is selected, use the custom type
    if (submitData.type === 'other' && customType.trim()) {
      submitData.type = customType.trim();
    }

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
    <Modal isOpen={isOpen} onClose={onClose} title={system ? t('systems.editSystem') : (parentId ? t('systems.addPoint') : t('systems.addSystem'))} size="lg">
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        {/* Only show name and type when NOT creating a sub-system */}
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
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={systemTypes}
              label={t('systems.systemType')}
              placeholder={t('systems.systemType')}
              error={errors.type}
              required
            />

            {formData.type === 'other' && (
              <Input
                name="customType"
                value={customType}
                onChange={(e) => {
                  setCustomType(e.target.value);
                  if (errors.customType) {
                    setErrors({ ...errors, customType: '' });
                  }
                }}
                label={t('systems.customType')}
                placeholder={t('systems.customTypePlaceholder')}
                error={errors.customType}
                required
              />
            )}
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
