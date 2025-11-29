import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchInspectionById, approveInspection } from '../../store/slices/inspectionSlice';
import { Card, Badge, Table, Button, Modal, TextArea } from '../../components/common';
import { InspectionItem } from '../../types';

const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentInspection } = useAppSelector((state) => state.inspections);
  const { user } = useAppSelector((state) => state.auth);
  const { goBack } = useAppNavigation();

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchInspectionById(Number(id)));
    }
  }, [dispatch, id]);

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
      key: 'passed',
      header: 'Result',
      render: (item: InspectionItem) => (
        <Badge variant={item.passed ? 'success' : 'danger'}>
          {item.passed ? 'Passed' : 'Failed'}
        </Badge>
      )
    },
    {
      key: 'value',
      header: 'Value',
      render: (item: InspectionItem) => item.value || '-'
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (item: InspectionItem) => item.notes || '-'
    }
  ];

  if (!currentInspection) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading inspection details...</p>
      </div>
    );
  }

  const passedCount = currentInspection.items?.filter(i => i.passed).length || 0;
  const totalCount = currentInspection.items?.length || 0;
  const isManager = user?.role === 'manager';

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
        {isManager && currentInspection.status === 'pending' && (
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

      {currentInspection.photos && currentInspection.photos.length > 0 && (
        <Card title="Photos">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </Card>
      )}

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
    </div>
  );
};

export default InspectionDetailPage;
