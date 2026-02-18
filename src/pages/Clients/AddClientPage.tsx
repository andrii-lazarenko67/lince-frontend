import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  IconButton,
  CircularProgress,
  Alert as MuiAlert,
  Avatar,
  Tooltip
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, PhotoCamera as PhotoCameraIcon, Business as BusinessIcon, HelpOutline } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createClient, uploadClientLogo } from '../../store/slices/clientSlice';
import { setSelectedClient } from '../../store/slices/clientSlice';
import { useTour, useAutoStartTour, CLIENTS_ADD_TOUR } from '../../tours';

const AddClientPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { goTo } = useAppNavigation();
  const { user } = useAppSelector((state) => state.auth);

  // Determine if we're in standalone mode (after signup) or within the app layout
  void location.state; // Used for state tracking

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact: '',
    phone: '',
    email: '',
    brandColor: '#1976d2'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(CLIENTS_ADD_TOUR);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setFormError(t('settings.clients.errors.invalidLogoType', 'Logo must be PNG, JPG, or SVG'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFormError(t('settings.clients.errors.logoTooLarge', 'Logo must be less than 2MB'));
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setFormError(t('settings.clients.errors.nameRequired', 'Client name is required'));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await dispatch(createClient(formData));
      if (createClient.fulfilled.match(result)) {
        const clientId = result.payload.id;

        if (logoFile) {
          try {
            await dispatch(uploadClientLogo({ clientId, file: logoFile })).unwrap();
          } catch {
            // Logo upload failed but client created
          }
        }

        dispatch(setSelectedClient(clientId));
        goTo('/clients');
      } else {
        setFormError(t('settings.clients.errors.createFailed', 'Failed to create client'));
      }
    } catch {
      setFormError(t('settings.clients.errors.createFailed', 'Failed to create client'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not a service provider
  if (user && !user.isServiceProvider) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {t('settings.clients.errors.notServiceProvider', 'This feature is only available for service providers.')}
        </Typography>
      </Box>
    );
  }

  // Standalone layout (after signup - when accessed via /add-client route)
  // For now, always show the in-app layout since /clients/new is within MainLayout
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => goTo('/clients')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            {t('settings.clients.addClient', 'Add Client')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('settings.clients.subtitle', 'Manage your clients')}
          </Typography>
        </Box>
        <Tooltip title={isCompleted(CLIENTS_ADD_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(CLIENTS_ADD_TOUR)}
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
      </Box>

      {/* Error Alert */}
      {formError && (
        <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
          {formError}
        </MuiAlert>
      )}

      <Paper sx={{ p: 3 }} data-tour="client-form">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} data-tour="basic-info">
              <TextField
                fullWidth
                label={t('settings.clients.name', 'Client Name')}
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.clients.email', 'Email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('settings.clients.address', 'Address')}
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6} data-tour="contact-info">
              <TextField
                fullWidth
                label={t('settings.clients.contact', 'Contact Person')}
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('settings.clients.phone', 'Phone')}
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                {t('settings.clients.logo', 'Logo')}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
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
                {logoPreview ? (
                  <Avatar src={logoPreview} sx={{ width: 60, height: 60 }} variant="rounded" />
                ) : (
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'grey.200' }} variant="rounded">
                    <BusinessIcon sx={{ fontSize: 30, color: 'grey.400' }} />
                  </Avatar>
                )}
                <Box sx={{ flex: 1 }}>
                  <Button startIcon={<PhotoCameraIcon />} size="small">
                    {logoPreview ? t('settings.clients.changeLogo', 'Change Logo') : t('settings.clients.uploadLogo', 'Upload Logo')}
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block">
                    PNG, JPG, SVG - Max 2MB
                  </Typography>
                </Box>
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLogoChange}
                accept="image/png,image/jpeg,image/svg+xml"
                style={{ display: 'none' }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                {t('settings.clients.brandColor', 'Brand Color')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <input
                  type="color"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  style={{
                    width: 60,
                    height: 40,
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer'
                  }}
                />
                <TextField
                  size="small"
                  name="brandColor"
                  value={formData.brandColor}
                  onChange={handleChange}
                  placeholder="#1976d2"
                  sx={{ width: 120 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => goTo('/clients')}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
                  data-tour="submit-button"
                >
                  {t('settings.clients.addClient', 'Add Client')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddClientPage;
