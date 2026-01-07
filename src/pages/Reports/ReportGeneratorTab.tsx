import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Description as TemplateIcon,
  DateRange as DateIcon,
  Water as SystemIcon,
  Preview as PreviewIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchReportTemplates, fetchDefaultTemplate } from '../../store/slices/reportTemplateSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { generateReport, uploadReportPdf } from '../../store/slices/generatedReportSlice';
import { ReportPdfViewer } from '../../components/reports/pdf';
import type { ReportData } from '../../components/reports/pdf';
import type { ReportTemplate, GeneratedReportPeriod } from '../../types';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';

const ReportGeneratorTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { templates, currentTemplate } = useAppSelector((state) => state.reportTemplates);
  const { systems } = useAppSelector((state) => state.systems);
  const { generating, error, currentReport, reportData } = useAppSelector((state) => state.generatedReports);
  const { currentClient } = useAppSelector((state) => state.clients);
  const { user } = useAppSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [reportName, setReportName] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
  const [includeOnlyAlerts, setIncludeOnlyAlerts] = useState(false);
  const [includePhotos, setIncludePhotos] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get root systems (no parentId)
  const rootSystems = systems.filter(s => !s.parentId);

  useEffect(() => {
    dispatch(fetchReportTemplates());
    dispatch(fetchSystems({}));
    dispatch(fetchDefaultTemplate());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select default template
    if (currentTemplate && !selectedTemplateId) {
      setSelectedTemplateId(currentTemplate.id);
    }
  }, [currentTemplate, selectedTemplateId]);

  useEffect(() => {
    // Set default dates based on period type
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (periodType) {
      case 'daily':
        start = today;
        end = today;
        break;
      case 'weekly':
        start.setDate(today.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'custom':
        // Keep existing dates
        return;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [periodType]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSystemToggle = (systemId: number) => {
    setSelectedSystemIds(prev =>
      prev.includes(systemId)
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  };

  const handleSelectAllSystems = () => {
    if (selectedSystemIds.length === rootSystems.length) {
      setSelectedSystemIds([]);
    } else {
      setSelectedSystemIds(rootSystems.map(s => s.id));
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplateId) return;

    const period: GeneratedReportPeriod = {
      type: periodType,
      startDate,
      endDate
    };

    const name = reportName || `${t('reports.generator.reportPrefix')} ${new Date().toLocaleDateString()}`;

    const result = await dispatch(generateReport({
      templateId: selectedTemplateId,
      name,
      systemIds: selectedSystemIds,
      period,
      filters: {
        includeOnlyAlerts,
        includePhotos,
        includeCharts
      }
    }));

    if (generateReport.fulfilled.match(result)) {
      setGenerationComplete(true);
      setActiveStep(5);
    }
  };

  const getSelectedTemplate = (): ReportTemplate | undefined => {
    return templates.find(t => t.id === selectedTemplateId);
  };

  // Handle PDF upload to Cloudinary
  const handlePdfUpload = useCallback(async (pdfBlob: Blob) => {
    if (!currentReport) return;

    setUploading(true);
    try {
      await dispatch(uploadReportPdf({ id: currentReport.id, pdfBlob }));
    } finally {
      setUploading(false);
    }
  }, [currentReport, dispatch]);

  // Transform reportData to ReportData format for PDF viewer
  const getPdfReportData = useCallback((): ReportData | null => {
    if (!reportData || !currentReport) return null;

    // Define client with explicit types to get around Client not having logo/brandColor
    const clientInfo = currentClient as {
      id?: number;
      name?: string;
      address?: string;
      contact?: string;
      phone?: string;
      email?: string;
      logo?: string;
      brandColor?: string;
    } | null;

    // Calculate totals from logs
    const logs = reportData.dailyLogs as Array<{ entries?: Array<{ isOutOfRange?: boolean }> }>;
    const totalReadings = logs?.reduce((sum, log) => sum + (log.entries?.length || 0), 0) || 0;
    const outOfRangeCount = logs?.reduce((sum, log) =>
      sum + (log.entries?.filter(e => e.isOutOfRange).length || 0), 0) || 0;

    return {
      client: {
        id: clientInfo?.id || 0,
        name: clientInfo?.name || '',
        address: clientInfo?.address || '',
        contact: clientInfo?.contact || '',
        phone: clientInfo?.phone || '',
        email: clientInfo?.email || '',
        logo: clientInfo?.logo || '',
        brandColor: clientInfo?.brandColor || ''
      },
      period: {
        type: periodType,
        startDate,
        endDate
      },
      systems: (reportData.systems || []) as ReportData['systems'],
      dailyLogs: (reportData.dailyLogs || []) as ReportData['dailyLogs'],
      inspections: (reportData.inspections || []) as ReportData['inspections'],
      incidents: (reportData.incidents || []) as ReportData['incidents'],
      summary: {
        totalSystems: (reportData.systems as unknown[])?.length || 0,
        totalReadings,
        outOfRangeCount,
        totalInspections: (reportData.inspections as unknown[])?.length || 0,
        totalIncidents: (reportData.incidents as unknown[])?.length || 0,
        openIncidents: (reportData.incidents as Array<{ status?: string }>)?.filter(i => i.status === 'open').length || 0
      },
      generatedAt: reportData.generatedAt || new Date().toISOString(),
      generatedBy: {
        id: user?.id || 0,
        name: user?.name || ''
      }
    };
  }, [reportData, currentReport, currentClient, periodType, startDate, endDate, user]);

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!selectedTemplateId;
      case 1:
        return !!startDate && !!endDate;
      case 2:
        return selectedSystemIds.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const steps = [
    {
      label: t('reports.generator.steps.template'),
      icon: <TemplateIcon />
    },
    {
      label: t('reports.generator.steps.period'),
      icon: <DateIcon />
    },
    {
      label: t('reports.generator.steps.systems'),
      icon: <SystemIcon />
    },
    {
      label: t('reports.generator.steps.options'),
      icon: <PreviewIcon />
    },
    {
      label: t('reports.generator.steps.preview'),
      icon: <PreviewIcon />
    },
    {
      label: t('reports.generator.steps.generate'),
      icon: <PdfIcon />
    }
  ];

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} orientation="vertical">
        {/* Step 1: Select Template */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 0 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 0 ? <CheckIcon fontSize="small" /> : <TemplateIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[0].label}
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.generator.selectTemplateHelp')}
              </Typography>

              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border: selectedTemplateId === template.id ? 2 : 1,
                        borderColor: selectedTemplateId === template.id ? 'primary.main' : 'divider',
                        '&:hover': { borderColor: 'primary.light' }
                      }}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {template.name}
                          </Typography>
                          {template.isDefault && (
                            <Chip size="small" label={t('reports.templates.default')} color="primary" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {template.description || t('reports.templates.noDescription')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          {t('reports.templates.blocksCount', {
                            count: template.config?.blocks?.filter(b => b.enabled).length || 0
                          })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed(0)}
              >
                {t('common.next')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 2: Select Period */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 1 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 1 ? <CheckIcon fontSize="small" /> : <DateIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[1].label}
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.generator.selectPeriodHelp')}
              </Typography>

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>{t('reports.generator.periodType')}</InputLabel>
                <Select
                  value={periodType}
                  label={t('reports.generator.periodType')}
                  onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                >
                  <MenuItem value="daily">{t('reports.generator.periods.daily')}</MenuItem>
                  <MenuItem value="weekly">{t('reports.generator.periods.weekly')}</MenuItem>
                  <MenuItem value="monthly">{t('reports.generator.periods.monthly')}</MenuItem>
                  <MenuItem value="custom">{t('reports.generator.periods.custom')}</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('reports.generator.startDate')}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label={t('reports.generator.endDate')}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed(1)}
              >
                {t('common.next')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 3: Select Systems */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 2 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 2 ? <CheckIcon fontSize="small" /> : <SystemIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[2].label}
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.generator.selectSystemsHelp')}
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedSystemIds.length === rootSystems.length && rootSystems.length > 0}
                      indeterminate={selectedSystemIds.length > 0 && selectedSystemIds.length < rootSystems.length}
                      onChange={handleSelectAllSystems}
                    />
                  }
                  label={<Typography fontWeight="bold">{t('reports.generator.selectAll')}</Typography>}
                />
                <Divider sx={{ my: 1 }} />
                {rootSystems.map((system) => (
                  <FormControlLabel
                    key={system.id}
                    control={
                      <Checkbox
                        checked={selectedSystemIds.includes(system.id)}
                        onChange={() => handleSystemToggle(system.id)}
                      />
                    }
                    label={system.name}
                    sx={{ ml: 2 }}
                  />
                ))}
              </FormGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed(2)}
              >
                {t('common.next')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 4: Configure Options */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 3 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 3 ? <CheckIcon fontSize="small" /> : <PreviewIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[3].label}
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.generator.configureOptionsHelp', 'Configure what to include in the report')}
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeOnlyAlerts}
                      onChange={(e) => setIncludeOnlyAlerts(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includeOnlyAlerts', 'Include only items with alerts/non-compliant')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includePhotos}
                      onChange={(e) => setIncludePhotos(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includePhotos', 'Include photos')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includeCharts', 'Include charts')}
                />
              </FormGroup>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed(3)}
              >
                {t('common.next')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 5: Preview & Generate */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 4 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 4 ? <CheckIcon fontSize="small" /> : <PreviewIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[4].label}
          </StepLabel>
          <StepContent>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                {t('reports.generator.summary')}
              </Typography>

              <TextField
                fullWidth
                label={t('reports.generator.reportName')}
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder={`${t('reports.generator.reportPrefix')} ${new Date().toLocaleDateString()}`}
                sx={{ mb: 2 }}
              />

              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <TemplateIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('reports.generator.template')}
                    secondary={getSelectedTemplate()?.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DateIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('reports.generator.period')}
                    secondary={`${startDate} - ${endDate} (${t(`reports.generator.periods.${periodType || 'custom'}`)})`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SystemIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={t('reports.generator.selectedSystems')}
                    secondary={
                      rootSystems
                        .filter(s => selectedSystemIds.includes(s.id))
                        .map(s => s.name)
                        .join(', ') || t('reports.generator.noSystems')
                    }
                  />
                </ListItem>
              </List>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                {t('reports.generator.includedBlocks')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {getSelectedTemplate()?.config?.blocks
                  ?.filter(b => b.enabled)
                  ?.sort((a, b) => a.order - b.order)
                  ?.map(block => (
                    <Chip
                      key={block.type}
                      size="small"
                      label={t(`reports.blocks.${block.type}.title`)}
                      variant="outlined"
                    />
                  ))
                }
              </Box>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                {t('reports.generator.options.title', 'Options')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {includeOnlyAlerts && (
                  <Chip size="small" label={t('reports.generator.options.onlyAlerts', 'Alerts Only')} color="warning" />
                )}
                {includePhotos && (
                  <Chip size="small" label={t('reports.generator.options.photos', 'Photos')} color="info" />
                )}
                {includeCharts && (
                  <Chip size="small" label={t('reports.generator.options.charts', 'Charts')} color="success" />
                )}
              </Box>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                {t('common.back')}
              </Button>
              <Button
                variant="contained"
                onClick={handleGenerate}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={16} /> : <PdfIcon />}
              >
                {generating ? t('reports.generator.generating') : t('reports.generator.generate')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 6: Complete */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: generationComplete ? 'success.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PdfIcon fontSize="small" />
              </Box>
            )}
          >
            {steps[5].label}
          </StepLabel>
          <StepContent>
            {generationComplete && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {t('reports.generator.complete')}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('reports.generator.completeHelp')}
            </Typography>

            {/* PDF Preview and Actions */}
            {currentReport && reportData && getPdfReportData() && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                  {currentReport.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <ReportPdfViewer
                    reportName={currentReport.name}
                    config={getSelectedTemplate()?.config || currentReport.config}
                    data={getPdfReportData()!}
                    onUpload={handlePdfUpload}
                    showPreviewButton
                    showDownloadButton
                    showUploadButton={!currentReport.pdfUrl}
                  />
                  {uploading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">{t('common.uploading')}</Typography>
                    </Box>
                  )}
                  {currentReport.pdfUrl && (
                    <Chip
                      icon={<CheckIcon />}
                      label={t('reports.history.pdf')}
                      color="success"
                      size="small"
                    />
                  )}
                </Box>
              </Paper>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  setActiveStep(0);
                  setGenerationComplete(false);
                  setSelectedSystemIds([]);
                  setReportName('');
                  setIncludeOnlyAlerts(false);
                  setIncludePhotos(true);
                  setIncludeCharts(true);
                }}
              >
                {t('reports.generator.createAnother')}
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
};

export default ReportGeneratorTab;
