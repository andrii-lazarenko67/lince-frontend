import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createInspection, fetchChecklistItems } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, TextArea, Checkbox, FileUpload } from '../../components/common';

interface ItemValue {
  checklistItemId: number;
  passed: boolean;
  value?: string;
  notes: string;
}

const NewInspectionPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { checklistItems } = useAppSelector((state) => state.inspections);
  const { goBack, goToInspections } = useAppNavigation();

  const [formData, setFormData] = useState({
    systemId: '',
    date: new Date().toISOString().split('T')[0],
    conclusion: ''
  });
  const [items, setItems] = useState<ItemValue[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);

  useEffect(() => {
    dispatch(fetchSystems());
  }, [dispatch]);

  useEffect(() => {
    if (formData.systemId) {
      dispatch(fetchChecklistItems(Number(formData.systemId)));
    }
  }, [dispatch, formData.systemId]);

  useEffect(() => {
    if (checklistItems.length > 0) {
      setItems(checklistItems.map(ci => ({
        checklistItemId: ci.id,
        passed: false,
        value: '',
        notes: ''
      })));
    }
  }, [checklistItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index: number, field: 'passed' | 'value' | 'notes', value: boolean | string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handlePhotosChange = (files: File[]) => {
    setPhotos(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.systemId) {
      alert('Please select a system');
      return;
    }

    const result = await dispatch(createInspection({
      systemId: Number(formData.systemId),
      date: formData.date,
      conclusion: formData.conclusion || undefined,
      items: items.map(item => ({
        checklistItemId: item.checklistItemId,
        passed: item.passed,
        value: item.value ? parseFloat(item.value) : undefined,
        notes: item.notes || undefined
      })),
      photos: photos.length > 0 ? photos : undefined
    }));

    if (createInspection.fulfilled.match(result)) {
      goToInspections();
    }
  };

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Inspection</h1>
          <p className="text-gray-500 mt-1">Create a new system inspection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Inspection Information" className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </Card>

        {checklistItems.length > 0 && (
          <Card title="Checklist Items" className="mb-6">
            <div className="space-y-4">
              {checklistItems.map((ci, index) => (
                <div key={ci.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{ci.name}</p>
                      {ci.description && (
                        <p className="text-sm text-gray-500">{ci.description}</p>
                      )}
                    </div>
                    <Checkbox
                      name={`passed-${ci.id}`}
                      checked={items[index]?.passed || false}
                      onChange={(e) => handleItemChange(index, 'passed', e.target.checked)}
                      label="Passed"
                    />
                  </div>

                  {ci.type === 'value' && (
                    <Input
                      type="number"
                      name={`value-${ci.id}`}
                      value={items[index]?.value || ''}
                      onChange={(e) => handleItemChange(index, 'value', e.target.value)}
                      placeholder="Enter value"
                      step="0.01"
                      className="mb-2"
                    />
                  )}

                  <Input
                    type="text"
                    name={`notes-${ci.id}`}
                    value={items[index]?.notes || ''}
                    onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                    placeholder="Notes (optional)"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card title="Photos & Conclusion" className="mb-6">
          <FileUpload
            name="photos"
            label="Attach Photos"
            accept="image/*"
            multiple
            onChange={handlePhotosChange}
          />

          {photos.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              {photos.length} photo(s) selected
            </div>
          )}

          <TextArea
            name="conclusion"
            value={formData.conclusion}
            onChange={handleChange}
            label="Conclusion"
            placeholder="Enter inspection conclusion"
            rows={4}
          />
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Inspection
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewInspectionPage;
