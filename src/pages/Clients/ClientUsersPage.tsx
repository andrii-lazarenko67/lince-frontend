import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import {
  fetchClientById,
  fetchClientUsers,
  fetchAvailableUsers,
  addUserAccess,
  updateUserAccess,
  removeUserAccess
} from '../../store/slices/clientSlice';
import type { User } from '../../types/auth.types';

const ClientUsersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goBack } = useAppNavigation();
  const { currentClient, loading } = useAppSelector((state) => state.clients);
  const { user } = useAppSelector((state) => state.auth);

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [accessLevel, setAccessLevel] = useState<'view' | 'edit' | 'admin'>('view');
  const [adding, setAdding] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [userNameToDelete, setUserNameToDelete] = useState('');
  const [deleting, setDeleting] = useState(false);

  const clientId = id ? parseInt(id) : 0;

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId));
      dispatch(fetchClientUsers(clientId));
      loadAvailableUsers();
    }
  }, [dispatch, clientId]);

  const loadAvailableUsers = async () => {
    try {
      const result = await dispatch(fetchAvailableUsers(clientId)).unwrap();
      setAvailableUsers(result);
    } catch {
      // Non-critical
    }
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

  const handleAddUser = async () => {
    if (!selectedUser) return;

    setAdding(true);
    try {
      await dispatch(addUserAccess({
        clientId,
        data: { userId: selectedUser.id, accessLevel }
      })).unwrap();
      setSuccess(t('settings.clients.userAdded', 'User added successfully'));
      setAddDialogOpen(false);
      setSelectedUser(null);
      setAccessLevel('view');
      loadAvailableUsers();
    } catch {
      setError(t('settings.clients.errors.addUserFailed', 'Failed to add user'));
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userIdToDelete) return;

    setDeleting(true);
    try {
      await dispatch(removeUserAccess({ clientId, userId: userIdToDelete })).unwrap();
      setSuccess(t('settings.clients.userRemoved', 'User removed successfully'));
      setDeleteDialogOpen(false);
      setUserIdToDelete(null);
      setUserNameToDelete('');
      loadAvailableUsers();
    } catch {
      setError(t('settings.clients.errors.removeUserFailed', 'Failed to remove user'));
    } finally {
      setDeleting(false);
    }
  };

  const handleAccessLevelChange = async (userId: number, newLevel: 'view' | 'edit' | 'admin') => {
    try {
      await dispatch(updateUserAccess({
        clientId,
        userId,
        data: { accessLevel: newLevel }
      })).unwrap();
      setSuccess(t('settings.clients.accessUpdated', 'Access level updated'));
    } catch {
      setError(t('settings.clients.errors.updateAccessFailed', 'Failed to update access level'));
    }
  };

  const clientUsers = currentClient?.userClients || [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={goBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('settings.clients.manageUsers', 'Manage Users')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentClient?.name} - {t('settings.clients.userAccess', 'User Access')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          {t('settings.clients.addUser', 'Add User')}
        </Button>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Users Table */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : clientUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('settings.clients.noUsers', 'No users have access to this client')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddDialogOpen(true)}
              sx={{ mt: 2 }}
            >
              {t('settings.clients.addUser', 'Add User')}
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('users.name', 'Name')}</TableCell>
                  <TableCell>{t('users.email', 'Email')}</TableCell>
                  <TableCell>{t('users.role', 'Role')}</TableCell>
                  <TableCell>{t('settings.clients.accessLevel', 'Access Level')}</TableCell>
                  <TableCell align="right">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientUsers.map((clientUser) => (
                  <TableRow key={clientUser.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {clientUser.user?.name?.charAt(0).toUpperCase() || '?'}
                        </Avatar>
                        <Typography>{clientUser.user?.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{clientUser.user?.email || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={t(`users.roles.${clientUser.user?.role || 'technician'}`)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={clientUser.accessLevel}
                          onChange={(e) => handleAccessLevelChange(clientUser.userId, e.target.value as 'view' | 'edit' | 'admin')}
                          disabled={clientUser.userId === user?.id}
                        >
                          <MenuItem value="view">{t('settings.clients.accessLevels.view', 'View Only')}</MenuItem>
                          <MenuItem value="edit">{t('settings.clients.accessLevels.edit', 'Edit')}</MenuItem>
                          <MenuItem value="admin">{t('settings.clients.accessLevels.admin', 'Admin')}</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      {clientUser.userId !== user?.id && (
                        <IconButton
                          color="error"
                          onClick={() => {
                            setUserIdToDelete(clientUser.userId);
                            setUserNameToDelete(clientUser.user?.name || '');
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('settings.clients.addUser', 'Add User')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Autocomplete
              options={availableUsers}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUser}
              onChange={(_, value) => setSelectedUser(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('settings.clients.selectUser', 'Select User')}
                  placeholder={t('settings.clients.searchUsers', 'Search users...')}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props;
                return (
                  <Box component="li" key={key} {...otherProps}>
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {option.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.email}</Typography>
                    </Box>
                  </Box>
                );
              }}
            />
            <FormControl fullWidth>
              <InputLabel>{t('settings.clients.accessLevel', 'Access Level')}</InputLabel>
              <Select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as 'view' | 'edit' | 'admin')}
                label={t('settings.clients.accessLevel', 'Access Level')}
              >
                <MenuItem value="view">
                  <Box>
                    <Typography>{t('settings.clients.accessLevels.view', 'View Only')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('settings.clients.accessLevels.viewDesc', 'Can only view data')}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="edit">
                  <Box>
                    <Typography>{t('settings.clients.accessLevels.edit', 'Edit')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('settings.clients.accessLevels.editDesc', 'Can create, edit, and delete data')}
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="admin">
                  <Box>
                    <Typography>{t('settings.clients.accessLevels.admin', 'Admin')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('settings.clients.accessLevels.adminDesc', 'Full access including user management')}
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)} disabled={adding}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleAddUser}
            variant="contained"
            disabled={!selectedUser || adding}
          >
            {adding ? <CircularProgress size={20} /> : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('settings.clients.removeUser', 'Remove User')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('settings.clients.removeUserConfirm', 'Are you sure you want to remove {{name}} from this client?', {
              name: userNameToDelete
            })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleRemoveUser}
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

export default ClientUsersPage;
