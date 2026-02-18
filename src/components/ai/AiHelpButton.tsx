import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { HelpOutline as HelpIcon, Psychology as AiIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../api/aiApi';

interface AiHelpButtonProps {
  page: string;
  feature?: string;
  variant?: 'icon' | 'button';
  size?: 'small' | 'medium' | 'large';
}

export const AiHelpButton: React.FC<AiHelpButtonProps> = ({
  page,
  feature,
  variant = 'icon',
  size = 'small'
}) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [help, setHelp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getHelp = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.getContextualHelp({
        page,
        feature,
        language: i18n.language
      });

      setHelp(response.data.help);
    } catch (err) {
      console.error('AI Help Error:', err);
      setError(t('ai.help.error', 'Failed to get help'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!help) {
      getHelp();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      {variant === 'icon' ? (
        <Tooltip title={t('ai.help.quickHelp')}>
          <IconButton onClick={handleOpen} size={size} color="primary">
            <HelpIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          startIcon={<AiIcon />}
          onClick={handleOpen}
          size={size}
          variant="outlined"
          color="primary"
        >
          {t('ai.help.getHelp')}
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AiIcon color="primary" />
          {t('ai.help.quickHelp')}
        </DialogTitle>
        <DialogContent>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {help && !loading && (
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {help}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AiHelpButton;
