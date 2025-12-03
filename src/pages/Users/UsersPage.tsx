import React from 'react';
import { useAppSelector } from '../../hooks';
import { ExportDropdown } from '../../components/common';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import UsersList from './UsersList';

const UsersPage: React.FC = () => {
  const { users } = useAppSelector((state) => state.users);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'technician': return 'Technician';
      default: return role;
    }
  };

  const getExportData = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Last Login', 'Created', 'Updated'];
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || '-',
      getRoleLabel(user.role),
      user.isActive ? 'Active' : 'Inactive',
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never',
      new Date(user.createdAt).toLocaleString(),
      new Date(user.updatedAt).toLocaleString()
    ]);
    return { headers, rows };
  };

  const getExportMetadata = () => [
    { label: 'Total Users', value: String(users.length) },
    { label: 'Active Users', value: String(users.filter(u => u.isActive).length) },
    { label: 'Inactive Users', value: String(users.filter(u => !u.isActive).length) },
    { label: 'Admins', value: String(users.filter(u => u.role === 'admin').length) },
    { label: 'Managers', value: String(users.filter(u => u.role === 'manager').length) },
    { label: 'Technicians', value: String(users.filter(u => u.role === 'technician').length) },
    { label: 'Generated', value: new Date().toLocaleString() }
  ];

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Users Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata()
      },
      [{ title: `Users (${users.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Users Report',
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata()
      },
      [{ title: `Users (${users.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Users Report',
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata()
      },
      [{ title: 'USERS', headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users and permissions</p>
        </div>
        <ExportDropdown
          onExportPDF={handleExportPDF}
          onExportHTML={handleExportHTML}
          onExportCSV={handleExportCSV}
          disabled={users.length === 0}
        />
      </div>

      <UsersList />
    </div>
  );
};

export default UsersPage;
