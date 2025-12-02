import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDocuments, uploadDocument, searchDocuments } from '../../store/slices/librarySlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Input, Select, Table, Badge, Modal, TextArea, FileUpload } from '../../components/common';
import type { Document } from '../../types';

const LibraryPage: React.FC = () => {
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
      alert('Please provide a title, category, and select a file');
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

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (doc: Document) => (
        <span className="font-medium text-gray-900">{doc.title}</span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (doc: Document) => getCategoryBadge(doc.category || '')
    },
    {
      key: 'system',
      header: 'System',
      render: (doc: Document) => doc.system?.name || '-'
    },
    {
      key: 'fileType',
      header: 'Type',
      render: (doc: Document) => doc.fileType?.toUpperCase() || '-'
    },
    {
      key: 'version',
      header: 'Version',
      render: (doc: Document) => doc.version || '1'
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (doc: Document) => new Date(doc.updatedAt).toLocaleDateString()
    }
  ];

  const categoryOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'sop', label: 'SOP' },
    { value: 'datasheet', label: 'Datasheet' },
    { value: 'report', label: 'Report' },
    { value: 'other', label: 'Other' }
  ];

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Library</h1>
          <p className="text-gray-500 mt-1">Manage manuals, SOPs, and documents</p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
          Upload Document
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
              placeholder="Search documents..."
              label="Search"
            />
          </div>

          <Select
            name="category"
            value={categoryFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            options={categoryOptions}
            label="Category"
            placeholder="All Categories"
          />

          <Button variant="primary" onClick={handleSearch}>
            Search
          </Button>
        </div>
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={documents}
          keyExtractor={(doc) => doc.id}
          onRowClick={(doc) => goToDocumentDetail(doc.id)}
          emptyMessage="No documents found. Click 'Upload Document' to add one."
        />
      </Card>

      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document" size="lg">
        <div className="flex flex-col gap-10">
          <Input
            type="text"
            name="title"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            label="Title"
            placeholder="Enter document title"
            required
          />

          <Select
            name="category"
            value={uploadData.category}
            onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
            options={categoryOptions}
            label="Category"
            placeholder="Select category"
          />

          <Select
            name="systemId"
            value={uploadData.systemId}
            onChange={(e) => setUploadData({ ...uploadData, systemId: e.target.value })}
            options={systemOptions}
            label="Related System (Optional)"
            placeholder="Select system"
          />

          <TextArea
            name="description"
            value={uploadData.description}
            onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            label="Description"
            placeholder="Enter document description"
            rows={3}
          />

          <FileUpload
            name="file"
            label="Document File"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            onChange={(files) => setSelectedFile(files[0] || null)}
          />
        </div>

        {selectedFile && (
          <p className="text-sm text-gray-500 mt-2">
            Selected: {selectedFile.name}
          </p>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LibraryPage;
