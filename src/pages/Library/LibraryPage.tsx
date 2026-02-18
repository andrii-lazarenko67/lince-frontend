import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation, usePagination } from '../../hooks';
import { fetchDocuments, uploadDocument } from '../../store/slices/librarySlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Input, Select, Badge, Modal, TextArea, FileUpload, PaginatedTable } from '../../components/common';
import type { Document } from '../../types';
import { useTour, useAutoStartTour, LIBRARY_LIST_TOUR } from '../../tours';
import { IconButton, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

const LibraryPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { documents, pagination, loading } = useAppSelector((state) => state.library);
  const { systems } = useAppSelector((state) => state.systems);
  const { goToDocumentDetail } = useAppNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Use the pagination hook
  const {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage
  } = usePagination();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    description: '',
    systemId: '',
    stageId: ''
  });
  const [customCategory, setCustomCategory] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [availableStages, setAvailableStages] = useState<Array<{ value: number; label: string }>>([]);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(LIBRARY_LIST_TOUR);

  // Load documents with current pagination and filters
  const loadDocuments = useCallback(() => {
    dispatch(fetchDocuments({
      page: apiPage,
      limit: apiLimit,
      category: categoryFilter || undefined,
      search: searchQuery || undefined
    }));
  }, [dispatch, apiPage, apiLimit, categoryFilter, searchQuery]);

  // Initial load and when pagination/filters change
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Load systems once
  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch, selectedClientId]);

  // Filter stages (child systems) when a system is selected
  useEffect(() => {
    if (uploadData.systemId && systems.length > 0) {
      const selectedSystemId = Number(uploadData.systemId);
      const childSystems = systems.filter(s => s.parentId === selectedSystemId);
      setAvailableStages(childSystems.map(s => ({ value: s.id, label: s.name })));
    } else {
      setAvailableStages([]);
      setUploadData(prev => ({ ...prev, stageId: '' }));
    }
  }, [uploadData.systemId, systems]);

  const handleSearch = () => {
    resetPage();
  };

  const handleFilterChange = (category: string) => {
    setCategoryFilter(category);
    resetPage();
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title || !uploadData.category) {
      alert(t('library.validationRequired'));
      return;
    }

    // Validate custom category if "other" is selected
    if (uploadData.category === 'other' && !customCategory.trim()) {
      alert(t('library.customCategoryRequired'));
      return;
    }

    // Use stageId if available, otherwise use systemId
    const finalSystemId = uploadData.stageId
      ? Number(uploadData.stageId)
      : (uploadData.systemId ? Number(uploadData.systemId) : undefined);

    // Prepare data for submission
    const submitData = {
      title: uploadData.title,
      category: uploadData.category === 'other' && customCategory.trim()
        ? customCategory.trim()
        : uploadData.category,
      description: uploadData.description || undefined,
      systemId: finalSystemId,
      file: selectedFile
    };

    const result = await dispatch(uploadDocument(submitData));

    if (uploadDocument.fulfilled.match(result)) {
      setIsUploadOpen(false);
      setUploadData({ title: '', category: '', description: '', systemId: '', stageId: '' });
      setCustomCategory('');
      setSelectedFile(null);
      setAvailableStages([]);
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

  // Only show parent systems (no parentId)
  const systemOptions = systems.filter(s => !s.parentId).map(s => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div data-tour="library-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('library.title')}</h1>
          <p className="text-gray-500 mt-1">{t('library.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={t('common.startTour')} arrow>
            <IconButton
              onClick={() => startTour(LIBRARY_LIST_TOUR)}
              size="small"
              sx={{ color: 'primary.main' }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
          <div data-tour="upload-button">
            <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
              {t('library.uploadDocument')}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4" data-tour="search-filters">
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

      <div data-tour="documents-table">
        <Card noPadding>
          <PaginatedTable
            columns={columns}
            data={documents}
            keyExtractor={(doc: Document) => doc.id}
            onRowClick={(doc: Document) => goToDocumentDetail(doc.id)}
            emptyMessage={t('library.emptyMessage')}
            loading={loading}
            pagination={pagination}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </div>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title={t('library.uploadDocument')} size="lg">
        <div className="flex flex-col gap-10">
          <div data-tour="upload-title">
            <Input
              type="text"
              name="title"
              value={uploadData.title}
              onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              label={t('library.modal.title')}
              placeholder={t('library.modal.titlePlaceholder')}
              required
            />
          </div>

          <div data-tour="upload-category">
            <Select
              name="category"
              value={uploadData.category}
              onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
              options={categoryOptions}
              label={t('library.modal.category')}
              placeholder={t('library.modal.categoryPlaceholder')}
            />
          </div>

          {uploadData.category === 'other' && (
            <Input
              type="text"
              name="customCategory"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              label={t('library.modal.customCategory')}
              placeholder={t('library.modal.customCategoryPlaceholder')}
              required
            />
          )}

          <div data-tour="upload-system">
            <Select
              name="systemId"
              value={uploadData.systemId}
              onChange={(e) => setUploadData({ ...uploadData, systemId: e.target.value, stageId: '' })}
              options={systemOptions}
              label={t('library.modal.relatedSystem')}
              placeholder={t('library.modal.systemPlaceholder')}
            />
          </div>

          {availableStages.length > 0 && (
            <Select
              name="stageId"
              value={uploadData.stageId}
              onChange={(e) => setUploadData({ ...uploadData, stageId: e.target.value })}
              options={availableStages}
              label={t('library.modal.relatedStage')}
              placeholder={t('library.modal.stagePlaceholder')}
            />
          )}

          <div data-tour="upload-description">
            <TextArea
              name="description"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              label={t('library.modal.description')}
              placeholder={t('library.modal.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div data-tour="upload-file">
            <FileUpload
              name="file"
              label={t('library.modal.documentFile')}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={(files) => setSelectedFile(files[0] || null)}
            />
          </div>
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
