import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchPhotosBySystem,
  uploadSystemPhoto,
  updateSystemPhoto,
  deleteSystemPhoto,
  clearError
} from '../store/slices/systemPhotoSlice';
import { Card, Button, Modal, TextArea } from './common';
import type { SystemPhoto } from '../types/systemPhoto.types';

interface PhotoGalleryProps {
  systemId: number;
  systemName: string;
  className?: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ systemId, systemName, className }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { photos, error } = useAppSelector((state) => state.systemPhotos);
  const { loading } = useAppSelector((state) => state.ui);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<SystemPhoto | null>(null);
  const [uploadData, setUploadData] = useState<{ file: File | null; description: string }>({
    file: null,
    description: ''
  });
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    dispatch(fetchPhotosBySystem(systemId));
  }, [dispatch, systemId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!uploadData.file) {
      alert('Please select a file');
      return;
    }

    const result = await dispatch(uploadSystemPhoto({
      systemId,
      photo: uploadData.file,
      description: uploadData.description || undefined
    }));

    if (uploadSystemPhoto.fulfilled.match(result)) {
      setIsUploadOpen(false);
      setUploadData({ file: null, description: '' });
      dispatch(fetchPhotosBySystem(systemId));
    }
  };

  const handleOpenEdit = (photo: SystemPhoto) => {
    setSelectedPhoto(photo);
    setEditDescription(photo.description || '');
    setIsEditOpen(true);
  };

  const handleUpdateDescription = async () => {
    if (!selectedPhoto) return;

    const result = await dispatch(updateSystemPhoto({
      id: selectedPhoto.id,
      data: { description: editDescription || undefined }
    }));

    if (updateSystemPhoto.fulfilled.match(result)) {
      setIsEditOpen(false);
      setSelectedPhoto(null);
      dispatch(fetchPhotosBySystem(systemId));
    }
  };

  const handleOpenDelete = (photo: SystemPhoto) => {
    setSelectedPhoto(photo);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedPhoto) return;

    const result = await dispatch(deleteSystemPhoto(selectedPhoto.id));

    if (deleteSystemPhoto.fulfilled.match(result)) {
      setIsDeleteOpen(false);
      setSelectedPhoto(null);
      dispatch(fetchPhotosBySystem(systemId));
    }
  };

  const handleViewPhoto = (photo: SystemPhoto) => {
    setSelectedPhoto(photo);
    setIsViewOpen(true);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card
        title={`${t('photoGallery.title')} - ${systemName}`}
        headerActions={
          <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
            {t('photoGallery.uploadPhoto')}
          </Button>
        }
      >
        {loading && photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('photoGallery.loadingPhotos')}</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">{t('photoGallery.noPhotos')}</div>
        ) : (
          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto p-1">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group bg-white border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="aspect-square cursor-pointer overflow-hidden bg-gray-100"
                  onClick={() => handleViewPhoto(photo)}
                >
                  <img
                    src={photo.url}
                    alt={photo.description || photo.originalName}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-1.5">
                  <p className="text-xs font-medium text-gray-900 truncate" title={photo.originalName}>
                    {photo.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-gray-500">{formatFileSize(photo.fileSize)}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenEdit(photo)}
                        className="text-blue-600 hover:text-blue-800 text-[10px]"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleOpenDelete(photo)}
                        className="text-red-600 hover:text-red-800 text-[10px]"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setUploadData({ file: null, description: '' });
        }}
        title={t('photoGallery.uploadPhoto')}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('photoGallery.selectPhoto')}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            {uploadData.file && (
              <p className="mt-2 text-sm text-gray-600">
                {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
              </p>
            )}
          </div>

          <TextArea
            name="description"
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            label={`${t('common.description')} (${t('common.optional')})`}
            rows={3}
            placeholder={t('common.description')}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsUploadOpen(false);
              setUploadData({ file: null, description: '' });
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={loading || !uploadData.file}>
            {t('common.add')}
          </Button>
        </div>
      </Modal>

      {/* Edit Description Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedPhoto(null);
        }}
        title={t('photoGallery.editDescription')}
      >
        <TextArea
          name="description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          label={t('common.description')}
          rows={3}
          placeholder={t('common.description')}
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditOpen(false);
              setSelectedPhoto(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUpdateDescription} disabled={loading}>
            {t('common.update')}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedPhoto(null);
        }}
        title={t('photoGallery.deletePhoto')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('photoGallery.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedPhoto(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>

      {/* View Photo Modal */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedPhoto(null);
        }}
        title={selectedPhoto?.originalName || t('photoGallery.title')}
        size="lg"
      >
        {selectedPhoto && (
          <div className="space-y-4">
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.description || selectedPhoto.originalName}
              className="w-full rounded-lg"
            />
            {selectedPhoto.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">{t('common.description')}:</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedPhoto.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">{t('common.type')}:</span>
                <span className="ml-2 text-gray-900">{formatFileSize(selectedPhoto.fileSize)}</span>
              </div>
              <div>
                <span className="text-gray-500">{t('common.date')}:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedPhoto.uploader && (
                <div className="col-span-2">
                  <span className="text-gray-500">{t('common.name')}:</span>
                  <span className="ml-2 text-gray-900">{selectedPhoto.uploader.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PhotoGallery;
