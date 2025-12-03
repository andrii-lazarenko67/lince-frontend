import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchInspectionById, approveInspection, addInspectionPhotos } from '../../store/slices/inspectionSlice';
import { Card, Badge, Table, Button, Modal, TextArea } from '../../components/common';
import { Close as CloseIcon, Add as AddIcon } from '@mui/icons-material';
import type { InspectionItem } from '../../types';

interface PhotoPreview {
  file: File;
  preview: string;
}

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentInspection } = useAppSelector((state) => state.inspections);
  const { user } = useAppSelector((state) => state.auth);
  const { goBack } = useAppNavigation();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchInspectionById(Number(id)));
    }
  }, [dispatch, id]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
    };
  }, []);

  const handleApprove = async () => {
    if (id) {
      const result = await dispatch(approveInspection({
        id: Number(id),
        managerNotes: managerNotes || undefined
      }));
      if (approveInspection.fulfilled.match(result)) {
        setIsApproveOpen(false);
        setManagerNotes('');
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

  const handleAddPhotos = async () => {
    if (id && photoPreviews.length > 0) {
      setIsUploading(true);
      const photos = photoPreviews.map(p => p.file);
      const result = await dispatch(addInspectionPhotos({
        id: Number(id),
        photos
      }));

      setIsUploading(false);
      if (addInspectionPhotos.fulfilled.match(result)) {
        // Cleanup previews
        photoPreviews.forEach(p => URL.revokeObjectURL(p.preview));
        setPhotoPreviews([]);
        setIsAddPhotosOpen(false);
        // Refetch inspection to get updated photos
        dispatch(fetchInspectionById(Number(id)));
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
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const itemColumns = [
    {
      key: 'name',
      header: 'Item',
      render: (item: InspectionItem) => (
        <span className="font-medium text-gray-900">
          {item.checklistItem?.name || '-'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Result',
      render: (item: InspectionItem) => {
        const variant = item.status === 'pass' ? 'success' : item.status === 'fail' ? 'danger' : 'secondary';
        const label = item.status === 'pass' ? 'Passed' : item.status === 'fail' ? 'Failed' : 'N/A';
        return <Badge variant={variant}>{label}</Badge>;
      }
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (item: InspectionItem) => item.comment || '-'
    }
  ];

  if (!currentInspection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading inspection details...</p>
      </div>
    );
  }

  const passedCount = currentInspection.items?.filter(i => i.status === 'pass').length || 0;
  const totalCount = currentInspection.items?.length || 0;
  const canManage = user?.role === 'manager' || user?.role === 'admin';

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
            <h1 className="text-2xl font-bold text-gray-900">Inspection Details</h1>
            <p className="text-gray-500 mt-1">
              {new Date(currentInspection.date).toLocaleDateString()} - {currentInspection.system?.name}
            </p>
          </div>
        </div>
        {canManage && currentInspection.status === 'pending' && (
          <Button variant="success" onClick={() => setIsApproveOpen(true)}>
            Approve Inspection
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Inspection Information" className="lg:col-span-1">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">System</dt>
              <dd className="mt-1 text-gray-900">{currentInspection.system?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentInspection.date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Inspector</dt>
              <dd className="mt-1 text-gray-900">{currentInspection.user?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">{getStatusBadge(currentInspection.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Results</dt>
              <dd className="mt-1 text-gray-900">{passedCount}/{totalCount} items passed</dd>
            </div>
            {currentInspection.conclusion && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Conclusion</dt>
                <dd className="mt-1 text-gray-900">{currentInspection.conclusion}</dd>
              </div>
            )}
            {currentInspection.managerNotes && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Manager Notes</dt>
                <dd className="mt-1 text-gray-900">{currentInspection.managerNotes}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Checklist Items" className="lg:col-span-2" noPadding>
          <Table
            columns={itemColumns}
            data={currentInspection.items || []}
            keyExtractor={(item) => item.id}
            emptyMessage="No checklist items for this inspection."
          />
        </Card>
      </div>

      <Card
        title="Photos"
        headerActions={
          <Button variant="outline" size="sm" onClick={() => setIsAddPhotosOpen(true)}>
            <AddIcon style={{ fontSize: 18, marginRight: 4 }} />
            Add Photos
          </Button>
        }
      >
        {currentInspection.photos && currentInspection.photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentInspection.photos.map((photo) => (
              <a
                key={photo.id}
                href={photo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={photo.url}
                  alt="Inspection photo"
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
            <p className="mt-2">No photos attached to this inspection</p>
          </div>
        )}
      </Card>

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Approve Inspection">
        <TextArea
          name="managerNotes"
          value={managerNotes}
          onChange={(e) => setManagerNotes(e.target.value)}
          label="Manager Notes (Optional)"
          placeholder="Add any notes for this inspection"
          rows={4}
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleApprove}>
            Approve
          </Button>
        </div>
      </Modal>

      {/* Add Photos Modal */}
      <Modal isOpen={isAddPhotosOpen} onClose={handleCloseAddPhotos} title="Add Photos">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Photo Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById('add-photo-input')?.click()}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">Click to upload photos</p>
            <p className="mt-1 text-xs text-gray-500">JPEG, PNG, GIF, WEBP up to 10MB each</p>
            <input
              id="add-photo-input"
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
                    alt={`Preview ${index + 1}`}
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
            <p className="text-sm text-gray-600">{photoPreviews.length} photo(s) selected</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={handleCloseAddPhotos} disabled={isUploading}>
            Cancel
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
                Uploading...
              </span>
            ) : (
              'Upload Photos'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default InspectionDetailPage;
