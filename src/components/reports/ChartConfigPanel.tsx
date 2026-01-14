/**
 * Chart Configuration Panel Component
 * UI for configuring chart settings in the report template editor
 */
import React, { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Collapse,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  StackedLineChart as AreaChartIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchMonitoringPointsForChart } from '../../store/slices/monitoringPointSlice';
import type {
  ChartConfig,
  ChartType,
  ChartAggregation,
  ChartParameterConfig,
  MonitoringPointForChart
} from '../../types';
import { DEFAULT_CHART_CONFIG } from '../../types';

export interface ChartConfigPanelProps {
  chartConfig: ChartConfig | undefined;
  onChange: (config: ChartConfig) => void;
  selectedSystemIds: number[];
}

const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
  chartConfig,
  onChange,
  selectedSystemIds
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { monitoringPointsForChart } = useAppSelector(state => state.monitoringPoints);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Initialize with default config if not provided
  const config: ChartConfig = chartConfig || DEFAULT_CHART_CONFIG;

  // Fetch monitoring points when system IDs change
  useEffect(() => {
    const loadMonitoringPoints = async () => {
      setLoading(true);
      try {
        await dispatch(fetchMonitoringPointsForChart(selectedSystemIds));
      } finally {
        setLoading(false);
      }
    };

    if (selectedSystemIds.length > 0) {
      loadMonitoringPoints();
    }
  }, [dispatch, selectedSystemIds]);

  // Handler for updating config
  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates });
  }, [config, onChange]);

  // Handler for parameter selection
  const handleParameterToggle = useCallback((mp: MonitoringPointForChart) => {
    const existingIndex = config.parameters.findIndex(p => p.monitoringPointId === mp.id);

    if (existingIndex >= 0) {
      // Remove parameter
      const newParameters = config.parameters.filter((_, i) => i !== existingIndex);
      updateConfig({ parameters: newParameters });
    } else {
      // Add parameter
      const newParam: ChartParameterConfig = {
        monitoringPointId: mp.id,
        showSpecLimit: mp.hasSpecLimits
      };
      updateConfig({ parameters: [...config.parameters, newParam] });
    }
  }, [config.parameters, updateConfig]);

  // Handler for parameter spec limit toggle
  const handleSpecLimitToggle = useCallback((monitoringPointId: number) => {
    const newParameters = config.parameters.map(p =>
      p.monitoringPointId === monitoringPointId
        ? { ...p, showSpecLimit: !p.showSpecLimit }
        : p
    );
    updateConfig({ parameters: newParameters });
  }, [config.parameters, updateConfig]);

  // Check if a parameter is selected
  const isParameterSelected = (mpId: number) => {
    return config.parameters.some(p => p.monitoringPointId === mpId);
  };

  // Get selected parameter config
  const getParameterConfig = (mpId: number) => {
    return config.parameters.find(p => p.monitoringPointId === mpId);
  };

  if (!config.enabled) {
    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {t('reports.charts.enableToConfig')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Chart Type Selection */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>{t('reports.charts.chartType')}</InputLabel>
        <Select
          value={config.chartType}
          label={t('reports.charts.chartType')}
          onChange={(e) => updateConfig({ chartType: e.target.value as ChartType })}
        >
          <MenuItem value="bar">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChartIcon fontSize="small" />
              {t('reports.charts.types.bar')}
            </Box>
          </MenuItem>
          <MenuItem value="line">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LineChartIcon fontSize="small" />
              {t('reports.charts.types.line')}
            </Box>
          </MenuItem>
          <MenuItem value="area">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AreaChartIcon fontSize="small" />
              {t('reports.charts.types.area')}
            </Box>
          </MenuItem>
        </Select>
      </FormControl>

      {/* Aggregation Selection */}
      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel>{t('reports.charts.aggregation')}</InputLabel>
        <Select
          value={config.aggregation}
          label={t('reports.charts.aggregation')}
          onChange={(e) => updateConfig({ aggregation: e.target.value as ChartAggregation })}
        >
          <MenuItem value="daily">{t('reports.charts.aggregations.daily')}</MenuItem>
          <MenuItem value="weekly">{t('reports.charts.aggregations.weekly')}</MenuItem>
          <MenuItem value="monthly">{t('reports.charts.aggregations.monthly')}</MenuItem>
        </Select>
      </FormControl>

      {/* Parameter Selection */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <Typography variant="subtitle2">
            {t('reports.charts.selectParameters')}
            {config.parameters.length > 0 && (
              <Chip
                size="small"
                label={config.parameters.length}
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : monitoringPointsForChart.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              {t('reports.charts.noParameters')}
            </Alert>
          ) : (
            <List dense sx={{ maxHeight: 200, overflow: 'auto', mt: 1 }}>
              {monitoringPointsForChart.map(mp => (
                <ListItem
                  key={mp.id}
                  sx={{
                    bgcolor: isParameterSelected(mp.id) ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      edge="start"
                      checked={isParameterSelected(mp.id)}
                      onChange={() => handleParameterToggle(mp)}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={mp.name}
                    secondary={
                      <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Typography variant="caption" color="text.secondary">
                          {mp.parameterName} ({mp.unit || '-'})
                        </Typography>
                        {mp.hasSpecLimits && (
                          <Chip
                            size="small"
                            label={t('reports.charts.hasLimits')}
                            color="warning"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        )}
                      </Box>
                    }
                  />
                  {isParameterSelected(mp.id) && mp.hasSpecLimits && (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={getParameterConfig(mp.id)?.showSpecLimit !== false}
                          onChange={() => handleSpecLimitToggle(mp.id)}
                        />
                      }
                      label={
                        <Typography variant="caption">
                          {t('reports.charts.showLimit')}
                        </Typography>
                      }
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Collapse>
      </Box>

      {/* Color Configuration */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {t('reports.charts.colors')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            type="color"
            label={t('reports.charts.primaryColor')}
            value={config.colors?.primary || '#1976d2'}
            onChange={(e) => updateConfig({
              colors: { ...config.colors, primary: e.target.value }
            })}
            sx={{ width: 120 }}
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor: config.colors?.primary || '#1976d2',
                    mr: 1,
                    border: '1px solid #ccc'
                  }}
                />
              )
            }}
          />
          <TextField
            size="small"
            type="color"
            label={t('reports.charts.limitColor')}
            value={config.colors?.specLimitLine || '#dc2626'}
            onChange={(e) => updateConfig({
              colors: { ...config.colors, specLimitLine: e.target.value }
            })}
            sx={{ width: 120 }}
            InputProps={{
              startAdornment: (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    bgcolor: config.colors?.specLimitLine || '#dc2626',
                    mr: 1,
                    border: '1px solid #ccc'
                  }}
                />
              )
            }}
          />
        </Box>
      </Box>

      {/* Display Options */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={config.showLegend !== false}
              onChange={(e) => updateConfig({ showLegend: e.target.checked })}
            />
          }
          label={t('reports.charts.showLegend')}
        />
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={config.showDataLabels !== false}
              onChange={(e) => updateConfig({ showDataLabels: e.target.checked })}
            />
          }
          label={t('reports.charts.showDataLabels')}
        />
      </Box>
    </Box>
  );
};

export default ChartConfigPanel;
