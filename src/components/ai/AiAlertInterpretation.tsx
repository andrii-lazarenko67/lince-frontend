import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Psychology as AiIcon,
  ExpandMore as ExpandIcon,
  Warning as AlertIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../api/aiApi';

interface AlertData {
  parameter: string;
  value: number;
  unit: string;
  limit: number;
  severity: 'low' | 'medium' | 'high';
}

interface AiAlertInterpretationProps {
  alert: AlertData;
  systemType?: string;
  autoLoad?: boolean;
}

export const AiAlertInterpretation: React.FC<AiAlertInterpretationProps> = ({
  alert,
  systemType = 'water treatment system',
  autoLoad = false
}) => {
  const { t, i18n } = useTranslation();
  const [expanded, setExpanded] = useState(autoLoad);
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInterpretation = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.interpretAlert({
        alert,
        systemType,
        language: i18n.language
      });

      setInterpretation(response.data.interpretation);
    } catch (err) {
      console.error('AI Alert Interpretation Error:', err);
      setError(t('ai.errors.interpretationError', 'Failed to interpret alert'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && !interpretation && !loading) {
      loadInterpretation();
    }
  }, [expanded]);

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Card
      sx={{
        mt: 1,
        border: 1,
        borderColor: `${getSeverityColor()}.main`,
        borderLeft: 4
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertIcon color={getSeverityColor()} />
            <Typography variant="subtitle2" fontWeight="bold">
              {t('ai.alerts.interpretation')}
            </Typography>
            <Chip
              label={alert.severity.toUpperCase()}
              color={getSeverityColor()}
              size="small"
            />
          </Box>

          <IconButton
            size="small"
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: '0.3s'
            }}
          >
            <ExpandIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 2 }}>
                {t('ai.alerts.gettingInterpretation')}
              </Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {interpretation && !loading && (
            <Box>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 1,
                  mb: 2
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {interpretation}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                <AiIcon fontSize="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {t('ai.poweredBy', 'Powered by AI')}
                </Typography>
              </Box>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default AiAlertInterpretation;
