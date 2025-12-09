import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createChecklistItem, updateChecklistItem } from '../../store/slices/checklistItemSlice';
import { Input, Button, Modal, TextArea } from '../../components/common';
import type { ChecklistItem, CreateChecklistItemRequest } from '../../types';

interface ChecklistItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  systemId: number;
  checklistItem?: ChecklistItem | null;
}

const ChecklistItemForm: React.FC<ChecklistItemFormProps> = ({
  isOpen,
  onClose,
  systemId,
  checklistItem
}) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.ui);

  const [formData, setFormData] = useState<CreateChecklistItemRequest>({
    systemId: systemId,
    name: '',
    description: '',
    isRequired: true,
    order: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (checklistItem) {
      setFormData({
        systemId: systemId,
        name: checklistItem.name,
        description: checklistItem.description || '',
        isRequired: checklistItem.isRequired,
        order: checklistItem.order
      });
    } else {
      setFormData({
        systemId: systemId,
        name: '',
        description: '',
        isRequired: true,
        order: 0
      });
    }
    setErrors({});
  }, [checklistItem, isOpen, systemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name === 'order') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : parseInt(value)
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (checklistItem) {
      const result = await dispatch(updateChecklistItem({
        id: checklistItem.id,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          isRequired: formData.isRequired,
          order: formData.order
        }
      }));
      if (updateChecklistItem.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createChecklistItem(formData));
      if (createChecklistItem.fulfilled.match(result)) {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={checklistItem ? 'Edit Checklist Item' : 'Add Checklist Item'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          label="Name"
          placeholder="Enter checklist item name"
          error={errors.name}
          required
        />

        <TextArea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          label="Description (Optional)"
          placeholder="Enter checklist item description"
          rows={3}
        />

        <Input
          type="number"
          name="order"
          value={formData.order?.toString() ?? '0'}
          onChange={handleChange}
          label="Display Order"
          placeholder="Enter display order"
          min={0}
        />

        <div className="mt-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isRequired"
              checked={formData.isRequired}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Required item (must be checked during inspection)
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (checklistItem ? 'Updating...' : 'Creating...') : `${checklistItem ? 'Update' : 'Create'} Checklist Item`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChecklistItemForm;
