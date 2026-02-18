import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createInspection, fetchChecklistItems, clearChecklistItems } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, TextArea } from '../../components/common';
import { Close as CloseIcon, HelpOutline } from '@mui/icons-material';
import { useTour, useAutoStartTour, INSPECTIONS_NEW_TOUR } from '../../tours';
import { IconButton, Tooltip } from '@mui/material';

interface ItemValue {
  checklistItemId: number;
  status: 'C' | 'NC' | 'NA' | 'NV';
  comment: string;
}

interface PhotoPreview {
  file: File;
  preview: string;
}

const NewInspectionPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { checklistItems } = useAppSelector((state) => state.inspections);
  const { loading } = useAppSelector((state) => state.ui);
  const { goBack, goToInspections } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(INSPECTIONS_NEW_TOUR);

  const [formData, setFormData] = useState({
    systemId: '',
    stageId: '',
    date: new Date().toISOString().split('T')[0],
    conclusion: '',
    sendNotification: false
  });
  const [items, setItems] = useState<ItemValue[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [availableStages, setAvailableStages] = useState<Array<{ value: number; label: string }>>([]);

  useEffect(() => {
    dispatch(fetchSystems({}));
    return () => {
      dispatch(clearChecklistItems());
    };
  }, [dispatch]);

  // Filter stages (child systems) when a system is selected
  useEffect(() => {
    if (formData.systemId && systems.length > 0) {
      const selectedSystemId = Number(formData.systemId);
      const childSystems = systems.filter(s => s.parentId === selectedSystemId);
      setAvailableStages(childSystems.map(s => ({ value: s.id, label: s.name })));

      // Reset stage selection when system changes
      setFormData(prev => ({ ...prev, stageId: '' }));
    } else {
      setAvailableStages([]);
    }
  }, [formData.systemId, systems]);

  // Fetch checklist items when system or stage changes
  useEffect(() => {
    if (formData.stageId) {
      dispatch(fetchChecklistItems(Number(formData.stageId)));
    } else if (formData.systemId) {
      dispatch(fetchChecklistItems(Number(formData.systemId)));
    }
  }, [dispatch, formData.systemId, formData.stageId]);

  useEffect(() => {
    if (checklistItems.length > 0) {
      setItems(checklistItems.map(ci => ({
        checklistItemId: ci.id,
        status: 'NV' as const,
        comment: ''
      })));
    }
  }, [checklistItems]);

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
  };

  const handleItemChange = (index: number, field: 'status' | 'comment', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert(t('inspections.new.filesSkipped'));
    }

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotoPreviews(prev => [...prev, ...newPreviews]);

    // Reset input to allow selecting same file again
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.systemId) {
      alert(t('inspections.new.selectSystem'));
      return;
    }

    const photos = photoPreviews.map(p => p.file);

    const result = await dispatch(createInspection({
      systemId: Number(formData.systemId),
      stageId: formData.stageId ? Number(formData.stageId) : undefined,
      date: formData.date,
      conclusion: formData.conclusion || undefined,
      items: items.map(item => ({
        checklistItemId: item.checklistItemId,
        status: item.status,
        comment: item.comment || undefined
      })),
      photos: photos.length > 0 ? photos : undefined,
      sendNotification: formData.sendNotification
    }));

    if (createInspection.fulfilled.match(result)) {
      // Cleanup previews before navigating
      photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
      goToInspections();
    }
  };

  const systemOptions = systems.filter(s => !s.parentId).map(s => ({ value: s.id, label: s.name }));
  const statusOptions = [
    { value: 'C', label: t('inspections.new.conforme') },
    { value: 'NC', label: t('inspections.new.noConforme') },
    { value: 'NA', label: t('inspections.new.noAplica') },
    { value: 'NV', label: t('inspections.new.noVerificado') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1" data-tour="new-inspection-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('inspections.new.title')}</h1>
          <p className="text-gray-500 mt-1">{t('inspections.new.description')}</p>
        </div>
        <Tooltip title={isCompleted(INSPECTIONS_NEW_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(INSPECTIONS_NEW_TOUR)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </div>

      <form onSubmit={handleSubmit}>
        <div data-tour="basic-info">
          <Card title={t('inspections.new.inspectionInformation')} className="mb-6">
            <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                name="systemId"
                value={formData.systemId}
                onChange={handleChange}
                options={systemOptions}
                label={t('inspections.new.system')}
                placeholder={t('inspections.new.selectSystem')}
                required
              />

              {/* Stage Selection (only if stages available) */}
              {availableStages.length > 0 && (
                <Select
                  name="stageId"
                  value={formData.stageId}
                  onChange={handleChange}
                  options={availableStages}
                  label={t('inspections.new.stage')}
                  placeholder={t('inspections.new.stageOptional')}
                />
              )}
            </div>

            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              label={t('inspections.new.date')}
              required
            />
          </div>
        </Card>
        </div>

        {checklistItems.length > 0 && (
          <div data-tour="checklist-items">
            <Card title={t('inspections.new.checklistItems')} className="mb-6">
              <div className="space-y-4">
              {checklistItems.map((ci, index) => (
                <div key={ci.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ci.name}</p>
                      {ci.description && (
                        <p className="text-sm text-gray-500">{ci.description}</p>
                      )}
                    </div>
                    <div className="w-48 ml-4">
                      <Select
                        name={`status-${ci.id}`}
                        value={items[index]?.status || 'NV'}
                        onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                        options={statusOptions}
                      />
                    </div>
                  </div>

                  <Input
                    type="text"
                    name={`comment-${ci.id}`}
                    value={items[index]?.comment || ''}
                    onChange={(e) => handleItemChange(index, 'comment', e.target.value)}
                    placeholder={t('inspections.new.commentOptional')}
                  />
                </div>
              ))}
            </div>
          </Card>
          </div>
        )}

        <Card title={t('inspections.new.photos')} className="mb-6">
          <div className="space-y-4">
            {/* Photo Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById('photo-input')?.click()}
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">{t('inspections.new.clickToUpload')}</p>
              <p className="mt-1 text-xs text-gray-500">{t('inspections.new.fileTypes')}</p>
              <input
                id="photo-input"
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
                      alt={`${t('inspections.new.preview')} ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
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
              <p className="text-sm text-gray-600">{t('inspections.new.photosSelected', { count: photoPreviews.length })}</p>
            )}
          </div>
        </Card>

        <div data-tour="conclusion">
          <Card title={t('inspections.new.conclusion')} className="mb-6">
            <TextArea
              name="conclusion"
              value={formData.conclusion}
              onChange={handleChange}
              label={t('inspections.new.inspectionConclusion')}
              placeholder={t('inspections.new.conclusionPlaceholder')}
              rows={4}
            />

            {/* Send Notification Checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="sendNotification"
                name="sendNotification"
                checked={formData.sendNotification}
                onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                {t('inspections.new.sendNotification')}
              </label>
            </div>
          </Card>
        </div>

        <div data-tour="action-buttons">
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={goBack} disabled={loading}>
              {t('inspections.new.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? t('inspections.new.submitting') : t('inspections.new.submitInspection')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInspectionPage;
