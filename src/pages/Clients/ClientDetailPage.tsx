import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  HelpOutline
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchClientById, updateClient, clearCurrentClient, fetchClientStats, uploadClientLogo } from '../../store/slices/clientSlice';
import { useTour, useAutoStartTour, CLIENTS_DETAIL_TOUR } from '../../tours';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { goBack, goTo } = useAppNavigation();
  const { currentClient, currentClientStats, loading } = useAppSelector((state) => state.clients);
  const { user } = useAppSelector((state) => state.auth);

  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    phone: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(CLIENTS_DETAIL_TOUR);

  useEffect(() => {
    if (id) {
      dispatch(fetchClientById(parseInt(id)));
      dispatch(fetchClientStats(parseInt(id)));
    }
    return () => {
      dispatch(clearCurrentClient());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (currentClient) {
      setFormData({
        name: currentClient.name || '',
        address: currentClient.address || '',
        contact: currentClient.contact || '',
        phone: currentClient.phone || '',
        email: currentClient.email || ''
      });
    }
  }, [currentClient]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError(t('settings.clients.errors.nameRequired'));
      return;
    }

    setSaving(true);
    try {
      await dispatch(updateClient({ id: parseInt(id!), data: formData })).unwrap();
      setSuccess(t('settings.clients.updated'));
    } catch {
      setError(t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError(t('settings.clients.errors.invalidLogoType', 'Logo must be PNG, JPG, or SVG'));
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError(t('settings.clients.errors.logoTooLarge', 'Logo must be less than 2MB'));
      return;
    }

    setUploadingLogo(true);
    try {
      await dispatch(uploadClientLogo({ clientId: parseInt(id!), file })).unwrap();
      setSuccess(t('settings.clients.logoUpdated', 'Logo updated successfully'));
    } catch {
      setError(t('settings.clients.errors.logoUploadFailed', 'Failed to upload logo'));
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading && !currentClient) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!currentClient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t('settings.clients.errors.notFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }} data-tour="client-header">
        <IconButton onClick={goBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {currentClient.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settings.clients.editClient')}
          </Typography>
        </Box>
        <Tooltip title={isCompleted(CLIENTS_DETAIL_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(CLIENTS_DETAIL_TOUR)}
            sx={{
              color: 'primary.main',
              mr: 1,
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
        <Button
          variant="outlined"
          onClick={() => goTo(`/clients/${id}/users`)}
          data-tour="manage-users"
        >
          {t('settings.clients.manageUsers', 'Manage Users')}
        </Button>
      </Box>

      {/* Alerts */}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Stats Cards */}
      {currentClientStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">{currentClientStats.systems}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('systems.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">{currentClientStats.dailyLogs}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('dailyLogs.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">{currentClientStats.inspections}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('inspections.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">{currentClientStats.incidents}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('incidents.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">{currentClientStats.products}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('products.title')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ p: 3 }} data-tour="client-info">
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
          <Tab label={t('settings.clients.details', 'Details')} />
          <Tab label={t('settings.clients.branding', 'Branding')} />
        </Tabs>

        <Divider />

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.clients.name')}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.clients.email')}
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('settings.clients.address')}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.clients.contact')}
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('settings.clients.phone')}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={saving}
                    data-tour="edit-button"
                  >
                    {t('common.save')}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {t('settings.clients.logo', 'Logo')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={handleLogoClick}
              >
                {uploadingLogo ? (
                  <CircularProgress />
                ) : currentClient.logo ? (
                  <Avatar
                    src={currentClient.logo}
                    sx={{ width: 120, height: 120, mb: 2 }}
                    variant="rounded"
                  />
                ) : (
                  <Avatar
                    sx={{ width: 120, height: 120, mb: 2, bgcolor: 'grey.200' }}
                    variant="rounded"
                  >
                    <BusinessIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                  </Avatar>
                )}
                <Button
                  startIcon={<PhotoCameraIcon />}
                  disabled={uploadingLogo}
                >
                  {currentClient.logo
                    ? t('settings.clients.changeLogo', 'Change Logo')
                    : t('settings.clients.uploadLogo', 'Upload Logo')}
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  PNG, JPG, SVG - Max 2MB
                </Typography>
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/png,image/jpeg,image/svg+xml"
                style={{ display: 'none' }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {t('settings.clients.brandColor', 'Brand Color')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.clients.brandColorHelp', 'This color will be used in reports and exports.')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="color"
                  value={currentClient.brandColor || '#1976d2'}
                  onChange={async (e) => {
                    try {
                      await dispatch(updateClient({
                        id: parseInt(id!),
                        data: { brandColor: e.target.value }
                      })).unwrap();
                    } catch {
                      // Error handled
                    }
                  }}
                  style={{
                    width: 60,
                    height: 40,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {currentClient.brandColor || '#1976d2'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ClientDetailPage;
