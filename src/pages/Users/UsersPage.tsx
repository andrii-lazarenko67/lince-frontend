import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import { ExportDropdown } from '../../components/common';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import UsersList from './UsersList';
import { useTour, useAutoStartTour, USERS_TOUR } from '../../tours';
import { IconButton, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();
  const { users } = useAppSelector((state) => state.users);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(USERS_TOUR);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return t('users.roles.admin');
      case 'manager': return t('users.roles.manager');
      case 'technician': return t('users.roles.technician');
      default: return role;
    }
  };

  const getExportData = () => {
    const headers = [t('users.export.id'), t('users.export.name'), t('users.export.email'), t('users.export.phone'), t('users.export.role'), t('users.export.status'), t('users.export.lastLogin'), t('users.export.created'), t('users.export.updated')];
    const rows = users.map(user => [
      user.id,
      user.name,
      user.email,
      user.phone || '-',
      getRoleLabel(user.role),
      user.isActive ? t('users.status.active') : t('users.status.inactive'),
      user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t('users.export.never'),
      new Date(user.createdAt).toLocaleString(),
      new Date(user.updatedAt).toLocaleString()
    ]);
    return { headers, rows };
  };

  const getExportMetadata = () => [
    { label: t('users.export.totalUsers'), value: String(users.length) },
    { label: t('users.export.activeUsers'), value: String(users.filter(u => u.isActive).length) },
    { label: t('users.export.inactiveUsers'), value: String(users.filter(u => !u.isActive).length) },
    { label: t('users.export.admins'), value: String(users.filter(u => u.role === 'admin').length) },
    { label: t('users.export.managers'), value: String(users.filter(u => u.role === 'manager').length) },
    { label: t('users.export.technicians'), value: String(users.filter(u => u.role === 'technician').length) },
    { label: t('users.export.generated'), value: new Date().toLocaleString() }
  ];

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: t('users.export.title'),
        subtitle: t('users.export.subtitle'),
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata(),
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
      },
      [{ title: `${t('users.export.users')} (${users.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('users.export.title'),
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata()
      },
      [{ title: `${t('users.export.users')} (${users.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('users.export.title'),
        filename: `users-${new Date().toISOString().split('T')[0]}`,
        metadata: getExportMetadata()
      },
      [{ title: t('users.export.usersUpper'), headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div data-tour="users-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('users.title')}</h1>
          <p className="text-gray-500 mt-1">{t('users.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={isCompleted(USERS_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
            <IconButton
              onClick={() => startTour(USERS_TOUR)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark'
                }
              }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
          <div data-tour="export-dropdown">
            <ExportDropdown
              onExportPDF={handleExportPDF}
              onExportHTML={handleExportHTML}
              onExportCSV={handleExportCSV}
              disabled={users.length === 0}
            />
          </div>
        </div>
      </div>

      <UsersList />
    </div>
  );
};

export default UsersPage;
