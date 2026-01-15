import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchIncidentById, updateIncidentStatus, addIncidentComment, assignIncident, addIncidentPhotos, fetchAssignableUsers } from '../../store/slices/incidentSlice';
import { Card, Badge, Button, Modal, Select, TextArea, Input } from '../../components/common';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';

interface PhotoPreview {
  file: File;
  preview: string;
}

const IncidentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentIncident, assignableUsers } = useAppSelector((state) => state.incidents);
  const { user } = useAppSelector((state) => state.auth);
  const { goBack } = useAppNavigation();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    if (id) {
      dispatch(fetchIncidentById(Number(id)));
    }
    // Only fetch assignable users if current user has permission (admin/manager)
    if (canManage) {
      dispatch(fetchAssignableUsers());
    }
  }, [dispatch, id, canManage]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, []);

  const handleStatusUpdate = async () => {
    if (id && newStatus) {
      const result = await dispatch(updateIncidentStatus({
        id: Number(id),
        status: newStatus,
        resolution: newStatus === 'resolved' ? resolution : undefined
      }));
      if (updateIncidentStatus.fulfilled.match(result)) {
        setIsStatusOpen(false);
        setNewStatus('');
        setResolution('');
      }
    }
  };

  const handleAssign = async () => {
    if (id && assignedToId) {
      const result = await dispatch(assignIncident({
        id: Number(id),
        assignedToId: Number(assignedToId)
      }));
      if (assignIncident.fulfilled.match(result)) {
        setIsAssignOpen(false);
        setAssignedToId('');
      }
    }
  };

  const handleAddComment = async () => {
    if (id && newComment.trim()) {
      const result = await dispatch(addIncidentComment({
        id: Number(id),
        content: newComment
      }));
      if (addIncidentComment.fulfilled.match(result)) {
        setNewComment('');
      }
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
      alert(t('incidents.detail.photoValidationError'));
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

  const handleAddPhotos = async () => {
    if (id && photoPreviews.length > 0) {
      setIsUploading(true);
      const photos = photoPreviews.map(p => p.file);
      const result = await dispatch(addIncidentPhotos({
        id: Number(id),
        photos
      }));

      setIsUploading(false);
      if (addIncidentPhotos.fulfilled.match(result)) {
        // Cleanup previews
        photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
        setPhotoPreviews([]);
        setIsAddPhotosOpen(false);
        // Refetch incident to get updated photos
        dispatch(fetchIncidentById(Number(id)));
      }
    }
  };

  const handleCloseAddPhotos = () => {
    photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
    setPhotoPreviews([]);
    setIsAddPhotosOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="danger">{t('incidents.detail.statusOpen')}</Badge>;
      case 'in_progress':
        return <Badge variant="warning">{t('incidents.detail.statusInProgress')}</Badge>;
      case 'resolved':
        return <Badge variant="success">{t('incidents.detail.statusResolved')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">{t('incidents.detail.priorityCritical')}</Badge>;
      case 'high':
        return <Badge variant="warning">{t('incidents.detail.priorityHigh')}</Badge>;
      case 'medium':
        return <Badge variant="info">{t('incidents.detail.priorityMedium')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('incidents.detail.priorityLow')}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (!currentIncident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('incidents.detail.loading')}</p>
      </div>
    );
  }

  const userOptions = assignableUsers.map(u => ({ value: u.id, label: u.name }));
  const statusOptions = [
    { value: 'open', label: t('incidents.detail.statusOpen') },
    { value: 'in_progress', label: t('incidents.detail.statusInProgress') },
    { value: 'resolved', label: t('incidents.detail.statusResolved') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentIncident.title}</h1>
            <p className="text-gray-500 mt-1">{currentIncident.system?.name}</p>
          </div>
        </div>
        {canManage && (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
              {t('incidents.detail.assignButton')}
            </Button>
            <Button variant="primary" onClick={() => setIsStatusOpen(true)}>
              {t('incidents.detail.updateStatusButton')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('incidents.detail.detailsCard')} className="lg:col-span-1">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.statusLabel')}</dt>
              <dd className="mt-1">{getStatusBadge(currentIncident.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.priorityLabel')}</dt>
              <dd className="mt-1">{getPriorityBadge(currentIncident.priority)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.reporterLabel')}</dt>
              <dd className="mt-1 text-gray-900">{currentIncident.reporter?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.assignedToLabel')}</dt>
              <dd className="mt-1 text-gray-900">{currentIncident.assignee?.name || t('incidents.detail.notAssigned')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.createdAtLabel')}</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentIncident.createdAt).toLocaleString()}
              </dd>
            </div>
            {currentIncident.resolvedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('incidents.detail.resolvedAtLabel')}</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(currentIncident.resolvedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title={t('incidents.detail.descriptionCard')} className="lg:col-span-2">
          <p className="text-gray-700 whitespace-pre-wrap">{currentIncident.description}</p>
          {currentIncident.resolution && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">{t('incidents.detail.resolutionTitle')}</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{currentIncident.resolution}</p>
            </div>
          )}
        </Card>
      </div>

      <Card
        title={t('incidents.detail.photosCard')}
        headerActions={
          <Button variant="outline" size="sm" onClick={() => setIsAddPhotosOpen(true)}>
            <AddIcon style={{ fontSize: 18, marginRight: 4 }} />
            {t('incidents.detail.addPhotosButton')}
          </Button>
        }
      >
        {currentIncident.photos && currentIncident.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentIncident.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={photo.url}
                  alt={t('incidents.detail.photoAlt')}
                  className="w-full h-32 object-cover rounded-lg hover:opacity-75 transition-opacity"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2">{t('incidents.detail.noPhotos')}</p>
          </div>
        )}
      </Card>

      <Card title={t('incidents.detail.commentsCard')}>
        <div className="space-y-4 mb-4">
          {currentIncident.comments && currentIncident.comments.length > 0 ? (
            currentIncident.comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{comment.user?.name}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">{t('incidents.detail.noComments')}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Input
            type="text"
            name="newComment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('incidents.detail.commentPlaceholder')}
            className="flex-1 mb-0"
          />
          <Button variant="primary" onClick={handleAddComment}>
            {t('incidents.detail.addCommentButton')}
          </Button>
        </div>
      </Card>

      {/* Update Status Modal */}
      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title={t('incidents.detail.updateStatusModalTitle')}>
        <div className="flex flex-col gap-10">
          <Select
            name="status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={statusOptions}
            label={t('incidents.detail.newStatusLabel')}
            placeholder={t('incidents.detail.newStatusPlaceholder')}
          />
          {newStatus === 'resolved' && (
            <TextArea
              name="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              label={t('incidents.detail.resolutionLabel')}
              placeholder={t('incidents.detail.resolutionPlaceholder')}
              rows={4}
            />
          )}
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
              {t('incidents.detail.cancelButton')}
            </Button>
            <Button variant="primary" onClick={handleStatusUpdate}>
              {t('incidents.detail.updateButton')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title={t('incidents.detail.assignModalTitle')}>
        <Select
          name="assignedToId"
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          options={userOptions}
          label={t('incidents.detail.assignToLabel')}
          placeholder={t('incidents.detail.assignToPlaceholder')}
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
            {t('incidents.detail.cancelButton')}
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            {t('incidents.detail.assignModalButton')}
          </Button>
        </div>
      </Modal>

      {/* Add Photos Modal */}
      <Modal isOpen={isAddPhotosOpen} onClose={handleCloseAddPhotos} title={t('incidents.detail.addPhotosModalTitle')}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Photo Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById('incident-add-photo-input')?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">{t('incidents.detail.uploadPrompt')}</p>
            <p className="mt-1 text-xs text-gray-500">{t('incidents.detail.uploadFormats')}</p>
            <input
              id="incident-add-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={handlePhotosChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>

          {/* Photo Previews */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {photoPreviews.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.preview}
                    alt={t('incidents.detail.previewAlt', { index: index + 1 })}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    <CloseIcon style={{ fontSize: 16 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photoPreviews.length > 0 && (
            <p className="text-sm text-gray-600">{t('incidents.detail.photosSelected', { count: photoPreviews.length })}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleCloseAddPhotos} disabled={isUploading}>
            {t('incidents.detail.cancelButton')}
          </Button>
          <Button
            variant="primary"
            onClick={handleAddPhotos}
            disabled={photoPreviews.length === 0 || isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('incidents.detail.uploadingButton')}
              </span>
            ) : (
              t('incidents.detail.uploadPhotosButton')
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetailPage;
