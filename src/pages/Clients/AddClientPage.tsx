import React, { useState } from 'react';
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
  Alert as MuiAlert
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createClient } from '../../store/slices/clientSlice';
import { setSelectedClient } from '../../store/slices/clientSlice';

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
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
        // Set the newly created client as selected
        dispatch(setSelectedClient(result.payload.id));
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
      </Box>

      {/* Error Alert */}
      {formError && (
        <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setFormError('')}>
          {formError}
        </MuiAlert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
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
