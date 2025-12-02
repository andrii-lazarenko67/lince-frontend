import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createIncident } from '../../store/slices/incidentSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, TextArea, FileUpload } from '../../components/common';
import type { IncidentPriority } from '../../types';

const NewIncidentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { goBack, goToIncidents } = useAppNavigation();

  const [formData, setFormData] = useState({
    systemId: '',
    title: '',
    description: '',
    priority: 'medium'
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePhotosChange = (files: File[]) => {
    setPhotos(files);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.systemId) newErrors.systemId = 'System is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const result = await dispatch(createIncident({
      systemId: Number(formData.systemId),
      title: formData.title,
      description: formData.description,
      priority: formData.priority as IncidentPriority,
      photos: photos.length > 0 ? photos : undefined
    }));

    if (createIncident.fulfilled.match(result)) {
      goToIncidents();
    }
  };

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Incident</h1>
          <p className="text-gray-500 mt-1">Create a new incident report</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Incident Information" className="mb-6">
          <div className='flex flex-col gap-10'>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="systemId"
                value={formData.systemId}
                onChange={handleChange}
                options={systemOptions}
                label="System"
                placeholder="Select system"
                error={errors.systemId}
                required
              />

              <Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={priorityOptions}
                label="Priority"
                required
              />
            </div>

            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              label="Title"
              placeholder="Enter incident title"
              error={errors.title}
              required
            />

            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              label="Description"
              placeholder="Describe the incident in detail"
              rows={5}
              error={errors.description}
              required
            />
          </div>
        </Card>

        <Card title="Attachments" className="mb-6">
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
        </Card>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={goBack}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit Incident
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewIncidentPage;
