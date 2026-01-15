import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchClients, deleteClient } from '../../store/slices/clientSlice';
import type { Client } from '../../types';

const ClientsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goTo } = useAppNavigation();
  const { clients, loading, pagination } = useAppSelector((state) => state.clients);
  const { user } = useAppSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0); // MUI TablePagination uses 0-based index
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch clients with pagination params
  const loadClients = useCallback(() => {
    dispatch(fetchClients({
      search: searchTerm || undefined,
      page: page + 1, // Backend uses 1-based index
      limit: rowsPerPage
    }));
  }, [dispatch, searchTerm, page, rowsPerPage]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Handle page change
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when changing rows per page
  };

  // Handle search with debounce reset to first page
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Redirect if not a service provider
  if (!user?.isServiceProvider) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {t('settings.clients.errors.notServiceProvider', 'This feature is only available for service providers.')}
        </Typography>
      </Box>
    );
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleEdit = () => {
    if (selectedClient) {
      goTo(`/clients/${selectedClient.id}`);
    }
    handleMenuClose();
  };

  const handleManageUsers = () => {
    if (selectedClient) {
      goTo(`/clients/${selectedClient.id}/users`);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedClient) {
      setDeleting(true);
      try {
        await dispatch(deleteClient(selectedClient.id)).unwrap();
        setDeleteDialogOpen(false);
        handleMenuClose();
      } catch {
        // Error handled by slice
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('settings.clients.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settings.clients.subtitle')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => goTo('/clients/new')}
        >
          {t('settings.clients.addClient')}
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('common.search')}
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            )
          }}
          size="small"
        />
      </Paper>

      {/* Clients Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : clients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('settings.clients.noClients')}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {t('settings.clients.emptyMessage')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => goTo('/clients/new')}
            >
              {t('settings.clients.addClient')}
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('settings.clients.name')}</TableCell>
                  <TableCell>{t('settings.clients.contact')}</TableCell>
                  <TableCell>{t('settings.clients.email')}</TableCell>
                  <TableCell>{t('settings.clients.phone')}</TableCell>
                  <TableCell>{t('settings.clients.status')}</TableCell>
                  <TableCell align="right">{t('settings.clients.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => goTo(`/clients/${client.id}`)}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={client.logo || undefined}
                          sx={{ bgcolor: 'primary.main' }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography fontWeight="medium">{client.name}</Typography>
                          {client.address && (
                            <Typography variant="caption" color="text.secondary">
                              {client.address}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{client.contact || '-'}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell>{client.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={client.isActive ? t('settings.clients.active') : t('settings.clients.inactive')}
                        color={client.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, client)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {/* Pagination - always show when there are clients or after search */}
        {!loading && (clients.length > 0 || pagination.total > 0) && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        )}
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.edit')}
        </MenuItem>
        <MenuItem onClick={handleManageUsers}>
          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
          {t('settings.clients.manageUsers', 'Manage Users')}
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          {t('common.delete')}
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} container={document.getElementById('modal-root') || undefined}>
        <DialogTitle>{t('settings.clients.deleteClient')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('settings.clients.deleteConfirm', { name: selectedClient?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientsPage;
