import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDocumentById, deleteDocument, uploadNewVersion } from '../../store/slices/librarySlice';
import { Card, Badge, Button, Modal, FileUpload } from '../../components/common';

const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentDocument } = useAppSelector((state) => state.library);
  const { goBack, goToLibrary } = useAppNavigation();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchDocumentById(Number(id)));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id) {
      const result = await dispatch(deleteDocument(Number(id)));
      if (deleteDocument.fulfilled.match(result)) {
        goToLibrary();
      }
    }
  };

  const handleUploadVersion = async () => {
    if (id && newVersionFile) {
      const result = await dispatch(uploadNewVersion({
        id: Number(id),
        file: newVersionFile
      }));
      if (uploadNewVersion.fulfilled.match(result)) {
        setIsVersionOpen(false);
        setNewVersionFile(null);
      }
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'manual':
        return <Badge variant="primary">Manual</Badge>;
      case 'sop':
        return <Badge variant="info">SOP</Badge>;
      case 'datasheet':
        return <Badge variant="warning">Datasheet</Badge>;
      case 'report':
        return <Badge variant="success">Report</Badge>;
      default:
        return <Badge variant="secondary">{category || 'Other'}</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!currentDocument) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading document details...</p>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">{currentDocument.title}</h1>
            <p className="text-gray-500 mt-1">{currentDocument.category || 'Document'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsVersionOpen(true)}>
            Upload New Version
          </Button>
          <a
            href={currentDocument.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Download
          </a>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Document Details">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="mt-1">{getCategoryBadge(currentDocument.category || '')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.version || '1'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Type</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.fileType?.toUpperCase() || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">File Size</dt>
              <dd className="mt-1 text-gray-900">
                {currentDocument.fileSize ? formatFileSize(currentDocument.fileSize) : '-'}
              </dd>
            </div>
            {currentDocument.system && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Related System</dt>
                <dd className="mt-1 text-gray-900">{currentDocument.system.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Uploaded By</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.uploadedBy?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentDocument.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentDocument.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Description" className="lg:col-span-2">
          {currentDocument.description ? (
            <p className="text-gray-700 whitespace-pre-wrap">{currentDocument.description}</p>
          ) : (
            <p className="text-gray-500 italic">No description provided</p>
          )}
        </Card>
      </div>

      {currentDocument.fileType && ['jpg', 'jpeg', 'png', 'gif'].includes(currentDocument.fileType.toLowerCase()) && (
        <Card title="Preview">
          <img
            src={currentDocument.url}
            alt={currentDocument.title}
            className="max-w-full h-auto rounded-lg"
          />
        </Card>
      )}

      {currentDocument.fileType === 'pdf' && (
        <Card title="Preview">
          <iframe
            src={currentDocument.url}
            title={currentDocument.title}
            className="w-full h-96 rounded-lg"
          />
        </Card>
      )}

      <Modal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} title="Upload New Version">
        <p className="text-gray-600 mb-4">
          Upload a new version of this document. The current version ({currentDocument.version || '1'}) will be archived.
        </p>
        <FileUpload
          name="file"
          label="New Document File"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
          onChange={(files) => setNewVersionFile(files[0] || null)}
        />
        {newVersionFile && (
          <p className="text-sm text-gray-500 mt-2">
            Selected: {newVersionFile.name}
          </p>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsVersionOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUploadVersion}>
            Upload
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Document" size="sm">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentDetailPage;
