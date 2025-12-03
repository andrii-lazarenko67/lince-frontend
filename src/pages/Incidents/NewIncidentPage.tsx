import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createIncident } from '../../store/slices/incidentSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, TextArea } from '../../components/common';
import { Close as CloseIcon } from '@mui/icons-material';
import type { IncidentPriority } from '../../types';

interface PhotoPreview {
  file: File;
  preview: string;
}

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
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only images (JPEG, PNG, GIF, WEBP) under 10MB are allowed.');
    }

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotoPreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
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

    const photos = photoPreviews.map(p => p.file);

    const result = await dispatch(createIncident({
      systemId: Number(formData.systemId),
      title: formData.title,
      description: formData.description,
      priority: formData.priority as IncidentPriority,
      photos: photos.length > 0 ? photos : undefined
    }));

    if (createIncident.fulfilled.match(result)) {
      // Cleanup previews before navigating
      photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
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

        <Card title="Photos" className="mb-6">
          <div className="space-y-4">
            {/* Photo Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('incident-photo-input')?.click()}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Click to upload photos</p>
              <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, WEBP up to 10MB each</p>
              <input
                id="incident-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handlePhotosChange}
                className="hidden"
              />
            </div>

            {/* Photo Previews */}
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CloseIcon style={{ fontSize: 16 }} />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{photo.file.name}</p>
                  </div>
                ))}
              </div>
            )}

            {photoPreviews.length > 0 && (
              <p className="text-sm text-gray-600">{photoPreviews.length} photo(s) selected</p>
            )}
          </div>
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
