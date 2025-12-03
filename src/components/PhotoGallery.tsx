import React, { useEffect, useState } from 'react';
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
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ systemId, systemName }) => {
  const dispatch = useAppDispatch();
  const { photos, loading, error } = useAppSelector((state) => state.systemPhotos);

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
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card
        title={`Photo Gallery - ${systemName}`}
        headerActions={
          <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
            Upload Photo
          </Button>
        }
      >
        {loading && photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Loading photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No photos uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
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
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-900 truncate" title={photo.originalName}>
                    {photo.originalName}
                  </p>
                  {photo.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2" title={photo.description}>
                      {photo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{formatFileSize(photo.fileSize)}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenEdit(photo)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(photo)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(photo.createdAt).toLocaleDateString()}
                  </p>
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
        title="Upload Photo"
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photo
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
                Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
              </p>
            )}
          </div>

          <TextArea
            name="description"
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            label="Description (Optional)"
            rows={3}
            placeholder="Add a description for this photo"
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
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={loading || !uploadData.file}>
            Upload
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
        title="Edit Photo Description"
      >
        <TextArea
          name="description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          label="Description"
          rows={3}
          placeholder="Add a description for this photo"
        />

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditOpen(false);
              setSelectedPhoto(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateDescription} disabled={loading}>
            Update
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
        title="Delete Photo"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this photo? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedPhoto(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
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
        title={selectedPhoto?.originalName || 'Photo'}
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
                <h4 className="text-sm font-medium text-gray-700">Description:</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedPhoto.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">File size:</span>
                <span className="ml-2 text-gray-900">{formatFileSize(selectedPhoto.fileSize)}</span>
              </div>
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </span>
              </div>
              {selectedPhoto.uploader && (
                <div className="col-span-2">
                  <span className="text-gray-500">Uploaded by:</span>
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
