import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDocumentById, deleteDocument, uploadNewVersion, updateDocument } from '../../store/slices/librarySlice';
import { Card, Badge, Button, Modal, FileUpload, Input } from '../../components/common';

const DocumentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentDocument } = useAppSelector((state) => state.library);
  const { goBack, goToLibrary } = useAppNavigation();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVersionOpen, setIsVersionOpen] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [editedFileName, setEditedFileName] = useState<string>('');
  const [editedTitle, setEditedTitle] = useState<string>('');

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

  const handleOpenEditName = () => {
    setEditedTitle(currentDocument?.title || '');
    setEditedFileName(currentDocument?.fileName || '');
    setIsEditNameOpen(true);
  };

  const handleEditName = async () => {
    if (id && (editedTitle.trim() || editedFileName.trim())) {
      const result = await dispatch(updateDocument({
        id: Number(id),
        data: {
          title: editedTitle.trim() || undefined,
          fileName: editedFileName.trim() || undefined
        }
      }));
      if (updateDocument.fulfilled.match(result)) {
        setIsEditNameOpen(false);
      }
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'manual':
        return <Badge variant="primary">{t('library.categories.manual')}</Badge>;
      case 'sop':
        return <Badge variant="info">{t('library.categories.sop')}</Badge>;
      case 'datasheet':
        return <Badge variant="warning">{t('library.categories.datasheet')}</Badge>;
      case 'report':
        return <Badge variant="success">{t('library.categories.report')}</Badge>;
      default:
        return <Badge variant="secondary">{category || t('library.categories.other')}</Badge>;
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
        <p className="text-gray-500">{t('library.detail.loading')}</p>
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
          <Button variant="outline" onClick={handleOpenEditName}>
            {t('library.detail.editName')}
          </Button>
          <Button variant="outline" onClick={() => setIsVersionOpen(true)}>
            {t('library.detail.uploadNewVersion')}
          </Button>
          <a
            href={currentDocument.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            {t('library.detail.download')}
          </a>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            {t('library.detail.deleteButton')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('library.detail.documentDetails')}>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.category')}</dt>
              <dd className="mt-1">{getCategoryBadge(currentDocument.category || '')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.version')}</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.version || '1'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.fileType')}</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.fileType?.toUpperCase() || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.fileSize')}</dt>
              <dd className="mt-1 text-gray-900">
                {currentDocument.fileSize ? formatFileSize(currentDocument.fileSize) : '-'}
              </dd>
            </div>
            {currentDocument.system && (
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('library.detail.relatedSystem')}</dt>
                <dd className="mt-1 text-gray-900">{currentDocument.system.name}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.uploadedBy')}</dt>
              <dd className="mt-1 text-gray-900">{currentDocument.uploader?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.createdAt')}</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentDocument.createdAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t('library.detail.lastUpdated')}</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentDocument.updatedAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title={t('library.detail.descriptionTitle')} className="lg:col-span-2">
          {currentDocument.description ? (
            <p className="text-gray-700 whitespace-pre-wrap">{currentDocument.description}</p>
          ) : (
            <p className="text-gray-500 italic">{t('library.detail.noDescription')}</p>
          )}
        </Card>
      </div>

      {currentDocument.fileType && ['jpg', 'jpeg', 'png', 'gif'].includes(currentDocument.fileType.toLowerCase()) && (
        <Card title={t('library.detail.preview')}>
          <img
            src={currentDocument.fileUrl}
            alt={currentDocument.title}
            className="max-w-full h-auto rounded-lg"
          />
        </Card>
      )}

      {currentDocument.fileType === 'pdf' && (
        <Card title={t('library.detail.preview')}>
          <iframe
            src={currentDocument.fileUrl}
            title={currentDocument.title}
            className="w-full h-96 rounded-lg"
          />
        </Card>
      )}

      <Modal isOpen={isVersionOpen} onClose={() => setIsVersionOpen(false)} title={t('library.detail.uploadNewVersion')}>
        <p className="text-gray-600 mb-4">
          {t('library.detail.versionUploadMessage', { version: currentDocument.version || '1' })}
        </p>
        <FileUpload
          name="file"
          label={t('library.detail.newDocumentFile')}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
          onChange={(files) => setNewVersionFile(files[0] || null)}
        />
        {newVersionFile && (
          <p className="text-sm text-gray-500 mt-2">
            {t('library.modal.selected')}: {newVersionFile.name}
          </p>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsVersionOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUploadVersion}>
            {t('library.modal.upload')}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isEditNameOpen} onClose={() => setIsEditNameOpen(false)} title={t('library.detail.editNameTitle')}>
        <div className="space-y-4">
          <Input
            type="text"
            name="title"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            label={t('library.detail.documentTitle')}
            placeholder={t('library.detail.documentTitlePlaceholder')}
          />
          <Input
            type="text"
            name="fileName"
            value={editedFileName}
            onChange={(e) => setEditedFileName(e.target.value)}
            label={t('library.detail.fileName')}
            placeholder={t('library.detail.fileNamePlaceholder')}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsEditNameOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleEditName}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('library.detail.deleteModal')} size="sm">
        <p className="text-gray-600 mb-6">
          {t('library.detail.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentDetailPage;
