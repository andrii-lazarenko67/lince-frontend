import React, { useState, useCallback } from 'react';
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
  Chip
} from '@mui/material';
import {
  DragHandle as DragIcon,
  ExpandMore as ExpandIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowUpward as MoveUpIcon,
  ArrowDownward as MoveDownIcon
} from '@mui/icons-material';
import { useAppDispatch } from '../../hooks';
import { updateReportTemplate } from '../../store/slices/reportTemplateSlice';
import type { ReportTemplate, ReportBlock, ReportBranding, ReportBlockType } from '../../types';

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
  const [expandedSection, setExpandedSection] = useState<string | false>('blocks');

  const handleBlockToggle = useCallback((blockType: ReportBlockType) => {
    setBlocks(prev => prev.map(block =>
      block.type === blockType ? { ...block, enabled: !block.enabled } : block
    ));
  }, []);

  const handleBlockOptionChange = useCallback((blockType: ReportBlockType, option: string, value: boolean) => {
    setBlocks(prev => prev.map(block =>
      block.type === blockType ? { ...block, [option]: value } : block
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
                              onChange={(e) => handleBlockOptionChange(block.type, 'includeCharts', e.target.checked)}
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
                      </>
                    )}
                    {block.type === 'inspections' && (
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
                    {block.type === 'occurrences' && (
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
