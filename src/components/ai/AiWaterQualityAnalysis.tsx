import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { Psychology as AiIcon, Science as AnalysisIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../api/aiApi';

interface Measurement {
  parameter: string;
  value: number;
  unit: string;
  isOutOfRange?: boolean;
}

interface AiWaterQualityAnalysisProps {
  measurements: Measurement[];
  systemType?: string;
}

export const AiWaterQualityAnalysis: React.FC<AiWaterQualityAnalysisProps> = ({
  measurements,
  systemType = 'water treatment system'
}) => {
  const { t, i18n } = useTranslation();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const response = await aiApi.analyzeWaterQuality({
        measurements,
        systemType,
        language: i18n.language
      });

      setAnalysis(response.data.analysis);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError(t('ai.errors.analysisError', 'Failed to analyze water quality'));
    } finally {
      setAnalyzing(false);
    }
  };

  const hasAlerts = measurements.some(m => m.isOutOfRange);

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AnalysisIcon color="primary" />
            <Typography variant="h6">
              {t('ai.analysis.title', 'AI Water Quality Analysis')}
            </Typography>
            {hasAlerts && (
              <Chip label={t('common.alert')} color="warning" size="small" />
            )}
          </Box>

          <Button
            startIcon={analyzing ? <CircularProgress size={16} /> : <AiIcon />}
            onClick={handleAnalyze}
            disabled={analyzing || measurements.length === 0}
            variant="contained"
            size="small"
          >
            {analyzing ? t('ai.suggestions.analyzing') : t('ai.analysis.analyze', 'Analyze')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {analysis && (
          <Box>
            <Divider sx={{ mb: 2 }} />
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
                borderLeft: 4,
                borderColor: hasAlerts ? 'warning.main' : 'success.main'
              }}
            >
              {analysis}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1, textAlign: 'right' }}
            >
              {t('ai.poweredBy', 'Powered by AI')}
            </Typography>
          </Box>
        )}

        {!analysis && !analyzing && (
          <Typography variant="body2" color="text.secondary">
            {t('ai.analysis.hint', 'Click "Analyze" to get AI-powered insights about water quality')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AiWaterQualityAnalysis;
