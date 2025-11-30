import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchIncidentById, updateIncidentStatus, addIncidentComment, assignIncident } from '../../store/slices/incidentSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { Card, Badge, Button, Modal, Select, TextArea, Input } from '../../components/common';

const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentIncident } = useAppSelector((state) => state.incidents);
  const { users } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  const { goBack } = useAppNavigation();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolution, setResolution] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchIncidentById(Number(id)));
    }
    dispatch(fetchUsers({}));
  }, [dispatch, id]);

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
        comment: newComment
      }));
      if (addIncidentComment.fulfilled.match(result)) {
        setNewComment('');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="danger">Open</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  if (!currentIncident) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading incident details...</p>
      </div>
    );
  }

  const isManager = user?.role === 'manager';
  const userOptions = users.map(u => ({ value: u.id, label: u.name }));
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
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
        {isManager && (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
              Assign
            </Button>
            <Button variant="primary" onClick={() => setIsStatusOpen(true)}>
              Update Status
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Incident Details" className="lg:col-span-1">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">{getStatusBadge(currentIncident.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Priority</dt>
              <dd className="mt-1">{getPriorityBadge(currentIncident.priority)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Reporter</dt>
              <dd className="mt-1 text-gray-900">{currentIncident.reporter?.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
              <dd className="mt-1 text-gray-900">{currentIncident.assignee?.name || 'Not assigned'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentIncident.createdAt).toLocaleString()}
              </dd>
            </div>
            {currentIncident.resolvedAt && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Resolved At</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(currentIncident.resolvedAt).toLocaleString()}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Description" className="lg:col-span-2">
          <p className="text-gray-700 whitespace-pre-wrap">{currentIncident.description}</p>
          {currentIncident.resolution && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Resolution</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{currentIncident.resolution}</p>
            </div>
          )}
        </Card>
      </div>

      {currentIncident.photos && currentIncident.photos.length > 0 && (
        <Card title="Photos">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  alt="Incident photo"
                  className="w-full h-32 object-cover rounded-lg hover:opacity-75 transition-opacity"
                />
              </a>
            ))}
          </div>
        </Card>
      )}

      <Card title="Comments">
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
            <p className="text-gray-500 text-center py-4">No comments yet</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Input
            type="text"
            name="newComment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 mb-0"
          />
          <Button variant="primary" onClick={handleAddComment}>
            Add
          </Button>
        </div>
      </Card>

      <Modal isOpen={isStatusOpen} onClose={() => setIsStatusOpen(false)} title="Update Status">
        <Select
          name="status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          options={statusOptions}
          label="New Status"
          placeholder="Select status"
        />
        {newStatus === 'resolved' && (
          <TextArea
            name="resolution"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            label="Resolution"
            placeholder="Describe how the incident was resolved"
            rows={4}
          />
        )}
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsStatusOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleStatusUpdate}>
            Update
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Incident">
        <Select
          name="assignedToId"
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          options={userOptions}
          label="Assign To"
          placeholder="Select user"
        />
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default IncidentDetailPage;
