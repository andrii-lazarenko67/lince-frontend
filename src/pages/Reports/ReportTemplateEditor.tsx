import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  DragHandle as DragIcon,
  ExpandMore as ExpandIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks';
import { updateReportTemplate, uploadTemplateLogo, deleteTemplateLogo } from '../../store/slices/reportTemplateSlice';
import type { ReportTemplate, ReportBlock, ReportBranding, ReportBlockType, ChartConfig, OccurrenceCriticalityFilter } from '../../types';
import { DEFAULT_CHART_CONFIG } from '../../types';
import ChartConfigPanel from '../../components/reports/ChartConfigPanel';

const CRITICALITY_OPTIONS: OccurrenceCriticalityFilter[] = ['all', 'critical', 'high', 'medium', 'low'];

interface ReportTemplateEditorProps {
  template: ReportTemplate;
  open: boolean;
  onClose: () => void;
}

const BLOCK_ICONS: Record<ReportBlockType, string> = {
  identification: '1',
  scope: '2',
  systems: '3',
  analyses: '4',
  inspections: '5',
  occurrences: '6',
  conclusion: '7',
  signature: '8',
  attachments: '9'
};

const ReportTemplateEditor: React.FC<ReportTemplateEditorProps> = ({
  template,
  open,
  onClose
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [logo, setLogo] = useState<string | null>(template.logo);
  const [blocks, setBlocks] = useState<ReportBlock[]>(template.config?.blocks || []);
  const [branding, setBranding] = useState<ReportBranding>(template.config?.branding || {
    showLogo: true,
    logoPosition: 'left',
    primaryColor: '#1976d2',
    showHeader: true,
    headerText: 'Technical Report',
    showFooter: true,
    footerText: 'Page {page} of {pages}'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | false>('blocks');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBlockToggle = useCallback((blockType: ReportBlockType) => {
    setBlocks(prev => prev.map(block =>
      block.type === blockType ? { ...block, enabled: !block.enabled } : block
    ));
  }, []);

  const handleBlockOptionChange = useCallback((blockType: ReportBlockType, option: string, value: boolean | string) => {
    setBlocks(prev => prev.map(block =>
      block.type === blockType ? { ...block, [option]: value } : block
    ));
  }, []);

  const handleChartConfigChange = useCallback((chartConfig: ChartConfig) => {
    setBlocks(prev => prev.map(block =>
      block.type === 'analyses' ? { ...block, chartConfig } : block
    ));
  }, []);

  const moveBlock = useCallback((index: number, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= newBlocks.length) return prev;

      // Swap blocks
      [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];

      // Update order numbers
      return newBlocks.map((block, i) => ({ ...block, order: i + 1 }));
    });
  }, []);

  const handleBrandingChange = useCallback((field: keyof ReportBranding, value: string | boolean) => {
    setBranding(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const result = await dispatch(uploadTemplateLogo({ id: template.id, file }));
      if (uploadTemplateLogo.fulfilled.match(result)) {
        setLogo(result.payload.logo);
      }
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogoDelete = async () => {
    setIsUploadingLogo(true);
    try {
      const result = await dispatch(deleteTemplateLogo(template.id));
      if (deleteTemplateLogo.fulfilled.match(result)) {
        setLogo(null);
      }
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await dispatch(updateReportTemplate({
        id: template.id,
        data: {
          name,
          description: description || undefined,
          config: {
            blocks,
            branding
          }
        }
      }));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const getBlockLabel = (blockType: ReportBlockType) => {
    return t(`reports.blocks.${blockType}.title`);
  };

  const getBlockDescription = (blockType: ReportBlockType) => {
    return t(`reports.blocks.${blockType}.description`);
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth container={document.getElementById('modal-root') || undefined}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {t('reports.templates.editTemplate')}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label={t('reports.templates.name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('reports.templates.descriptionLabel')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
        </Box>

        <Accordion
          expanded={expandedSection === 'blocks'}
          onChange={(_, isExpanded) => setExpandedSection(isExpanded ? 'blocks' : false)}
        >
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('reports.templates.reportBlocks')}
            </Typography>
            <Chip
              size="small"
              label={`${blocks.filter(b => b.enabled).length}/${blocks.length}`}
              sx={{ ml: 2 }}
            />
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('reports.templates.blocksHelp')}
            </Typography>

            {sortedBlocks.map((block, index) => (
              <Paper
                key={block.type}
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 1,
                  opacity: block.enabled ? 1 : 0.6,
                  bgcolor: block.enabled ? 'background.paper' : 'action.disabledBackground'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <IconButton
                      size="small"
                      onClick={() => moveBlock(index, 'up')}
                      disabled={index === 0}
                    >
                      <MoveUpIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => moveBlock(index, 'down')}
                      disabled={index === sortedBlocks.length - 1}
                    >
                      <MoveDownIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  <DragIcon color="action" />

                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.875rem'
                    }}
                  >
                    {BLOCK_ICONS[block.type]}
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">{getBlockLabel(block.type)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getBlockDescription(block.type)}
                    </Typography>
                  </Box>

                  <Tooltip title={block.enabled ? t('common.disable') : t('common.enable')}>
                    <IconButton
                      onClick={() => handleBlockToggle(block.type)}
                      color={block.enabled ? 'primary' : 'default'}
                    >
                      {block.enabled ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>

                {block.enabled && (
                  <Box sx={{ mt: 2, ml: 7, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {block.type === 'systems' && (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={block.includePhotos || false}
                            onChange={(e) => handleBlockOptionChange(block.type, 'includePhotos', e.target.checked)}
                            size="small"
                          />
                        }
                        label={t('reports.blocks.options.includePhotos')}
                      />
                    )}
                    {block.type === 'analyses' && (
                      <>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.includeCharts || false}
                              onChange={(e) => {
                                handleBlockOptionChange(block.type, 'includeCharts', e.target.checked);
                                // Initialize chart config when enabling charts
                                if (e.target.checked && !block.chartConfig) {
                                  handleChartConfigChange({ ...DEFAULT_CHART_CONFIG, enabled: true });
                                } else if (!e.target.checked && block.chartConfig) {
                                  handleChartConfigChange({ ...block.chartConfig, enabled: false });
                                }
                              }}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.includeCharts')}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.highlightAlerts || false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'highlightAlerts', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.highlightAlerts')}
                        />

                        {/* Chart Configuration Panel */}
                        {block.includeCharts && (
                          <Box sx={{ width: '100%', mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                              {t('reports.charts.configuration')}
                            </Typography>
                            <ChartConfigPanel
                              chartConfig={block.chartConfig || { ...DEFAULT_CHART_CONFIG, enabled: true }}
                              onChange={handleChartConfigChange}
                              selectedSystemIds={[]}
                            />
                          </Box>
                        )}

                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('reports.blocks.options.analysisViews')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showFieldOverview !== false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showFieldOverview', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.analyses.fieldOverviewTitle')}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showFieldDetailed || false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showFieldDetailed', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.analyses.fieldDetailedTitle')}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showLaboratoryOverview !== false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showLaboratoryOverview', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.analyses.laboratoryOverviewTitle')}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showLaboratoryDetailed || false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showLaboratoryDetailed', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.analyses.laboratoryDetailedTitle')}
                            />
                          </Box>
                        </Box>
                      </>
                    )}
                    {block.type === 'inspections' && (
                      <>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.includePhotos || false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'includePhotos', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.includePhotos')}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.highlightOnlyNonConformities !== false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'highlightOnlyNonConformities', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.highlightOnlyNC')}
                        />
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('reports.blocks.options.inspectionViews')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showInspectionOverview !== false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showInspectionOverview', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.inspections.overviewTitle')}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showInspectionDetailed || false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showInspectionDetailed', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.inspections.detailedTitle')}
                            />
                          </Box>
                        </Box>
                      </>
                    )}
                    {block.type === 'occurrences' && (
                      <>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.includePhotos || false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'includePhotos', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.includePhotos')}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.includeTimeline || false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'includeTimeline', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.includeTimeline')}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.includeComments || false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'includeComments', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.includeComments')}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={block.showOnlyHighestCriticality !== false}
                              onChange={(e) => handleBlockOptionChange(block.type, 'showOnlyHighestCriticality', e.target.checked)}
                              size="small"
                            />
                          }
                          label={t('reports.blocks.options.showOnlyHighestCriticality')}
                        />
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>{t('reports.blocks.options.criticalityFilter')}</InputLabel>
                            <Select
                              value={block.criticalityFilter || 'all'}
                              label={t('reports.blocks.options.criticalityFilter')}
                              onChange={(e) => handleBlockOptionChange(block.type, 'criticalityFilter', e.target.value)}
                            >
                              {CRITICALITY_OPTIONS.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {t(`reports.blocks.occurrences.criticality.${option}`)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Box sx={{ width: '100%', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            {t('reports.blocks.options.occurrenceViews')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showOccurrenceOverview !== false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showOccurrenceOverview', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.occurrences.overviewTitle')}
                            />
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={block.showOccurrenceDetailed || false}
                                  onChange={(e) => handleBlockOptionChange(block.type, 'showOccurrenceDetailed', e.target.checked)}
                                  size="small"
                                />
                              }
                              label={t('reports.blocks.occurrences.detailedTitle')}
                            />
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Paper>
            ))}
          </AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedSection === 'branding'}
          onChange={(_, isExpanded) => setExpandedSection(isExpanded ? 'branding' : false)}
        >
          <AccordionSummary expandIcon={<ExpandIcon />}>
            <Typography variant="subtitle1" fontWeight="bold">
              {t('reports.templates.branding')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Template Logo Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {t('reports.branding.templateLogo')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {logo ? (
                    <Box
                      component="img"
                      src={logo}
                      alt="Template logo"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'contain',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'action.hover'
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {t('reports.branding.noLogo')}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={isUploadingLogo ? <CircularProgress size={16} /> : <UploadIcon />}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      {t('reports.branding.uploadLogo')}
                    </Button>
                    {logo && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={isUploadingLogo ? <CircularProgress size={16} /> : <DeleteIcon />}
                        onClick={handleLogoDelete}
                        disabled={isUploadingLogo}
                      >
                        {t('reports.branding.removeLogo')}
                      </Button>
                    )}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {t('reports.branding.logoHelp')}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={branding.showLogo}
                      onChange={(e) => handleBrandingChange('showLogo', e.target.checked)}
                    />
                  }
                  label={t('reports.branding.showLogo')}
                />
              </Grid>

              {branding.showLogo && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('reports.branding.logoPosition')}</InputLabel>
                    <Select
                      value={branding.logoPosition}
                      label={t('reports.branding.logoPosition')}
                      onChange={(e) => handleBrandingChange('logoPosition', e.target.value)}
                    >
                      <MenuItem value="left">{t('reports.branding.left')}</MenuItem>
                      <MenuItem value="center">{t('reports.branding.center')}</MenuItem>
                      <MenuItem value="right">{t('reports.branding.right')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  type="color"
                  label={t('reports.branding.primaryColor')}
                  value={branding.primaryColor}
                  onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: branding.primaryColor,
                          mr: 1,
                          border: '1px solid #ccc'
                        }}
                      />
                    )
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={branding.showHeader}
                      onChange={(e) => handleBrandingChange('showHeader', e.target.checked)}
                    />
                  }
                  label={t('reports.branding.showHeader')}
                />
              </Grid>

              {branding.showHeader && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('reports.branding.headerText')}
                    value={branding.headerText}
                    onChange={(e) => handleBrandingChange('headerText', e.target.value)}
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={branding.showFooter}
                      onChange={(e) => handleBrandingChange('showFooter', e.target.checked)}
                    />
                  }
                  label={t('reports.branding.showFooter')}
                />
              </Grid>

              {branding.showFooter && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label={t('reports.branding.footerText')}
                    value={branding.footerText}
                    onChange={(e) => handleBrandingChange('footerText', e.target.value)}
                    helperText={t('reports.branding.footerHelp')}
                  />
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!name.trim() || isSaving}
        >
          {isSaving ? t('common.saving') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportTemplateEditor;
