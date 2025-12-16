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
      // For steps (has parent), don't set systemTypeId or location - backend will inherit from parent
      setFormData({
        name: '',
        systemTypeId: parentId ? 0 : 0,
        location: '',
        description: '',
        parentId: parentId || null
      });
    }
    setErrors({});
  }, [system, isOpen, parentId]);

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
    // Always validate name
    if (!formData.name.trim()) newErrors.name = t('common.required');

    // Only validate systemTypeId for root systems (not steps)
    if (!parentId && (!formData.systemTypeId || formData.systemTypeId === 0)) {
      newErrors.systemTypeId = t('common.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Prepare data for submission
    const submitData = { ...formData };

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
    <Modal isOpen={isOpen} onClose={onClose} title={system ? t('systems.editSystem') : (parentId ? t('systems.addStep') : t('systems.addSystem'))} size="lg">
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        {/* For steps (has parent), only show name and description */}
        {/* For root systems, show all fields */}
        {parentId && !system ? (
          <>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              label={t('systems.stepName')}
              placeholder={t('systems.stepNamePlaceholder')}
              error={errors.name}
              required
            />

            <TextArea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              label={t('common.description')}
              placeholder={t('common.description')}
              rows={3}
            />
          </>
        ) : (
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

            {!parentId && (
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
          </>
        )}

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
