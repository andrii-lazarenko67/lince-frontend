import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchIncidents } from '../../store/slices/incidentSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, Table, Badge } from '../../components/common';
import { Incident } from '../../types';

const IncidentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { incidents } = useAppSelector((state) => state.incidents);
  const { goToNewIncident, goToIncidentDetail } = useAppNavigation();

  const [filters, setFilters] = useState({
    systemId: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems());
    dispatch(fetchIncidents({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchIncidents({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', status: '', priority: '', startDate: '', endDate: '' });
    dispatch(fetchIncidents({}));
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

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (incident: Incident) => (
        <span className="font-medium text-gray-900">{incident.title}</span>
      )
    },
    {
      key: 'system',
      header: 'System',
      render: (incident: Incident) => incident.system?.name || '-'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (incident: Incident) => getPriorityBadge(incident.priority)
    },
    {
      key: 'status',
      header: 'Status',
      render: (incident: Incident) => getStatusBadge(incident.status)
    },
    {
      key: 'reporter',
      header: 'Reporter',
      render: (incident: Incident) => incident.reporter?.name || '-'
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (incident: Incident) => new Date(incident.createdAt).toLocaleString()
    }
  ];

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];
  const priorityOptions = [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 mt-1">Track and manage system incidents</p>
        </div>
        <Button variant="primary" onClick={goToNewIncident}>
          Report Incident
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <Select
            name="systemId"
            value={filters.systemId}
            onChange={(e) => setFilters({ ...filters, systemId: e.target.value })}
            options={systemOptions}
            label="System"
            placeholder="All Systems"
          />

          <Select
            name="status"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={statusOptions}
            label="Status"
            placeholder="All Statuses"
          />

          <Select
            name="priority"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            options={priorityOptions}
            label="Priority"
            placeholder="All Priorities"
          />

          <Input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            label="Start Date"
          />

          <Input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            label="End Date"
          />

          <div className="flex space-x-2">
            <Button variant="primary" onClick={handleApplyFilters}>
              Apply
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>
      </div>

      <Card noPadding>
        <Table
          columns={columns}
          data={incidents}
          keyExtractor={(incident) => incident.id}
          onRowClick={(incident) => goToIncidentDetail(incident.id)}
          emptyMessage="No incidents found. Click 'Report Incident' to create one."
        />
      </Card>
    </div>
  );
};

export default IncidentsPage;
