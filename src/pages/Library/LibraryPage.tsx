import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDocuments, uploadDocument, searchDocuments } from '../../store/slices/librarySlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Input, Select, Table, Badge, Modal, TextArea, FileUpload } from '../../components/common';
import type { Document } from '../../types';

const LibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { documents } = useAppSelector((state) => state.library);
  const { systems } = useAppSelector((state) => state.systems);
  const { goToDocumentDetail } = useAppNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    description: '',
    systemId: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchDocuments({}));
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      dispatch(searchDocuments(searchQuery));
    } else {
      dispatch(fetchDocuments({ category: categoryFilter || undefined }));
    }
  };

  const handleFilterChange = (category: string) => {
    setCategoryFilter(category);
    dispatch(fetchDocuments({ category: category || undefined }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title || !uploadData.category) {
      alert(t('library.validationRequired'));
      return;
    }

    const result = await dispatch(uploadDocument({
      title: uploadData.title,
      category: uploadData.category,
      description: uploadData.description || undefined,
      systemId: uploadData.systemId ? Number(uploadData.systemId) : undefined,
      file: selectedFile
    }));

    if (uploadDocument.fulfilled.match(result)) {
      setIsUploadOpen(false);
      setUploadData({ title: '', category: '', description: '', systemId: '' });
      setSelectedFile(null);
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

  const columns = [
    {
      key: 'title',
      header: t('library.table.title'),
      render: (doc: Document) => (
        <span className="font-medium text-gray-900">{doc.title}</span>
      )
    },
    {
      key: 'category',
      header: t('library.table.category'),
      render: (doc: Document) => getCategoryBadge(doc.category || '')
    },
    {
      key: 'system',
      header: t('library.table.system'),
      render: (doc: Document) => doc.system?.name || '-'
    },
    {
      key: 'fileType',
      header: t('library.table.type'),
      render: (doc: Document) => doc.fileType?.toUpperCase() || '-'
    },
    {
      key: 'version',
      header: t('library.table.version'),
      render: (doc: Document) => doc.version || '1'
    },
    {
      key: 'updatedAt',
      header: t('library.table.lastUpdated'),
      render: (doc: Document) => new Date(doc.updatedAt).toLocaleDateString()
    }
  ];

  const categoryOptions = [
    { value: 'manual', label: t('library.categories.manual') },
    { value: 'sop', label: t('library.categories.sop') },
    { value: 'datasheet', label: t('library.categories.datasheet') },
    { value: 'report', label: t('library.categories.report') },
    { value: 'other', label: t('library.categories.other') }
  ];

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('library.title')}</h1>
          <p className="text-gray-500 mt-1">{t('library.description')}</p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
          {t('library.uploadDocument')}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <Input
              type="text"
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('library.searchPlaceholder')}
              label={t('library.search')}
            />
          </div>

          <Select
            name="category"
            value={categoryFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            options={categoryOptions}
            label={t('library.categoryLabel')}
            placeholder={t('library.allCategories')}
          />

          <Button variant="primary" onClick={handleSearch}>
            {t('library.searchButton')}
          </Button>
        </div>
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={documents}
          keyExtractor={(doc) => doc.id}
          onRowClick={(doc) => goToDocumentDetail(doc.id)}
          emptyMessage={t('library.emptyMessage')}
        />
      </Card>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title={t('library.uploadDocument')} size="lg">
        <div className="flex flex-col gap-10">
          <Input
            type="text"
            name="title"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            label={t('library.modal.title')}
            placeholder={t('library.modal.titlePlaceholder')}
            required
          />

          <Select
            name="category"
            value={uploadData.category}
            onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
            options={categoryOptions}
            label={t('library.modal.category')}
            placeholder={t('library.modal.categoryPlaceholder')}
          />

          <Select
            name="systemId"
            value={uploadData.systemId}
            onChange={(e) => setUploadData({ ...uploadData, systemId: e.target.value })}
            options={systemOptions}
            label={t('library.modal.relatedSystem')}
            placeholder={t('library.modal.systemPlaceholder')}
          />

          <TextArea
            name="description"
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            label={t('library.modal.description')}
            placeholder={t('library.modal.descriptionPlaceholder')}
            rows={3}
          />

          <FileUpload
            name="file"
            label={t('library.modal.documentFile')}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            onChange={(files) => setSelectedFile(files[0] || null)}
          />
        </div>

        {selectedFile && (
          <p className="text-sm text-gray-500 mt-2">
            {t('library.modal.selected')}: {selectedFile.name}
          </p>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            {t('library.modal.upload')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryPage;
