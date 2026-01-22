import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
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
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Description as TemplateIcon,
  DateRange as DateIcon,
  Water as SystemIcon,
  Preview as PreviewIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon,
  AutoAwesome as AiIcon,
  Edit as EditIcon,
  Description as WordIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchReportTemplates, fetchDefaultTemplate } from '../../store/slices/reportTemplateSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints } from '../../store/slices/monitoringPointSlice';
import { generateReport, uploadReportPdf, downloadReportWord } from '../../store/slices/generatedReportSlice';
import { ReportPdfViewer } from '../../components/reports/pdf';
import type { ReportData } from '../../components/reports/pdf';
import type { ReportTemplate, GeneratedReportPeriod, MonitoringPoint } from '../../types';

type PeriodType = 'daily' | 'weekly' | 'monthly' | 'custom';

const ReportGeneratorTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { templates, currentTemplate } = useAppSelector((state) => state.reportTemplates);
  const { systems } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { generating, error, currentReport, reportData } = useAppSelector((state) => state.generatedReports);
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
  const [selectedMonitoringPointIds, setSelectedMonitoringPointIds] = useState<number[]>([]);
  const [availableMonitoringPoints, setAvailableMonitoringPoints] = useState<MonitoringPoint[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [conclusionText, setConclusionText] = useState('');
  const [generatingConclusion, setGeneratingConclusion] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureRole, setSignatureRole] = useState('');
  const [signatureRegistration, setSignatureRegistration] = useState('');

  // Get root systems (no parentId)
  const rootSystems = systems.filter(s => !s.parentId);

  useEffect(() => {
    dispatch(fetchReportTemplates());
    dispatch(fetchSystems({}));
    dispatch(fetchDefaultTemplate());
    dispatch(fetchMonitoringPoints({}));
  }, [dispatch]);

  // Update available monitoring points when selected systems change
  useEffect(() => {
    if (selectedSystemIds.length > 0) {
      // Filter monitoring points for selected systems
      const filtered = monitoringPoints.filter(mp => selectedSystemIds.includes(mp.systemId));
      setAvailableMonitoringPoints(filtered);

      // Clear selections that are no longer valid
      setSelectedMonitoringPointIds(prev => prev.filter(id => filtered.some(mp => mp.id === id)));
    } else {
      setAvailableMonitoringPoints([]);
      setSelectedMonitoringPointIds([]);
    }
  }, [selectedSystemIds, monitoringPoints]);

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

  const handleMonitoringPointToggle = (mpId: number) => {
    setSelectedMonitoringPointIds(prev =>
      prev.includes(mpId)
        ? prev.filter(id => id !== mpId)
        : [...prev, mpId]
    );
  };

  const handleSelectAllMonitoringPoints = () => {
    if (selectedMonitoringPointIds.length === availableMonitoringPoints.length) {
      setSelectedMonitoringPointIds([]);
    } else {
      setSelectedMonitoringPointIds(availableMonitoringPoints.map(mp => mp.id));
    }
  };

  // Generate AI-assisted conclusion based on report data
  const handleGenerateAiConclusion = async () => {
    setGeneratingConclusion(true);
    try {
      // Build a summary of the report data for AI assistance
      const selectedSystems = rootSystems.filter(s => selectedSystemIds.includes(s.id));
      const systemNames = selectedSystems.map(s => s.name).join(', ');

      // Create a basic template-based conclusion as AI suggestion
      const periodLabel = t(`reports.generator.periods.${periodType}`).toLowerCase();
      const systemCount = selectedSystemIds.length;

      // Generate a professional conclusion template using i18n
      const aiSuggestion = t('reports.generator.conclusion.aiSuggestion', {
        periodLabel,
        systemCount,
        systemNames,
        startDate: new Date(startDate).toLocaleDateString(),
        endDate: new Date(endDate).toLocaleDateString()
      });

      setConclusionText(aiSuggestion);
    } catch (error) {
      console.error('Error generating AI conclusion:', error);
    } finally {
      setGeneratingConclusion(false);
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

    // Build signature object if any field is filled
    const signature = (signatureName || signatureRole || signatureRegistration) ? {
      name: signatureName || user?.name || '',
      role: signatureRole,
      registration: signatureRegistration
    } : undefined;

    const result = await dispatch(generateReport({
      templateId: selectedTemplateId,
      name,
      systemIds: selectedSystemIds,
      period,
      filters: {
        includeOnlyAlerts,
        includePhotos,
        includeCharts,
        selectedMonitoringPointIds: selectedMonitoringPointIds.length > 0 ? selectedMonitoringPointIds : undefined
      },
      conclusion: conclusionText || undefined,
      signature
    }));


    if (generateReport.fulfilled.match(result)) {
      setGenerationComplete(true);
      setActiveStep(6);
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

  // Handle Word document download
  const handleDownloadWord = useCallback(async () => {
    if (!currentReport) return;

    setDownloadingWord(true);
    try {
      await dispatch(downloadReportWord({
        id: currentReport.id,
        reportName: currentReport.name,
        language: i18next.language
      }));
    } finally {
      setDownloadingWord(false);
    }
  }, [currentReport, dispatch]);

  // Transform reportData to ReportData format for PDF viewer
  const getPdfReportData = useCallback((): ReportData | null => {
    if (!reportData || !currentReport) return null;

    // Use client data from reportData (returned by backend generate endpoint)
    // This contains all client fields: id, name, address, contact, phone, email, logo, brandColor
    const clientFromReport = reportData.client as {
      id?: number;
      name?: string;
      address?: string;
      contact?: string;
      phone?: string;
      email?: string;
      logo?: string;
      brandColor?: string;
    } | undefined;

    // Calculate totals from logs
    const logs = reportData.dailyLogs as Array<{ entries?: Array<{ isOutOfRange?: boolean }> }>;
    const totalReadings = logs?.reduce((sum, log) => sum + (log.entries?.length || 0), 0) || 0;
    const outOfRangeCount = logs?.reduce((sum, log) =>
      sum + (log.entries?.filter(e => e.isOutOfRange).length || 0), 0) || 0;

    // Use generatedBy from reportData if available (backend returns this)
    const generatedByFromReport = reportData.generatedBy as { id?: number; name?: string } | undefined;

    return {
      client: {
        id: clientFromReport?.id || 0,
        name: clientFromReport?.name || '',
        address: clientFromReport?.address || '',
        contact: clientFromReport?.contact || '',
        phone: clientFromReport?.phone || '',
        email: clientFromReport?.email || '',
        logo: clientFromReport?.logo || '',
        brandColor: clientFromReport?.brandColor || ''
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
      conclusion: reportData.conclusion || conclusionText || undefined,
      signature: reportData.signature || (signatureName || signatureRole || signatureRegistration ? {
        name: signatureName || user?.name || '',
        role: signatureRole,
        registration: signatureRegistration
      } : undefined),
      generatedAt: reportData.generatedAt || new Date().toISOString(),
      generatedBy: {
        id: generatedByFromReport?.id || user?.id || 0,
        name: generatedByFromReport?.name || user?.name || ''
      },
      isServiceProvider: user?.isServiceProvider || false
    };
  }, [reportData, currentReport, periodType, startDate, endDate, user, conclusionText, signatureName, signatureRole, signatureRegistration]);

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
      case 4:
        return true; // Conclusion step - optional content
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
      label: t('reports.generator.steps.conclusion'),
      icon: <EditIcon />
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
                {t('reports.generator.configureOptionsHelp')}
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeOnlyAlerts}
                      onChange={(e) => setIncludeOnlyAlerts(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includeOnlyAlerts')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includePhotos}
                      onChange={(e) => setIncludePhotos(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includePhotos')}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                    />
                  }
                  label={t('reports.generator.options.includeCharts')}
                />
              </FormGroup>

              {/* Chart Parameter Selection */}
              {includeCharts && availableMonitoringPoints.length > 0 && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>
                    {t('reports.generator.options.selectParameters')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('reports.generator.options.selectParametersHelp')}
                  </Typography>

                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedMonitoringPointIds.length === availableMonitoringPoints.length && availableMonitoringPoints.length > 0}
                          indeterminate={selectedMonitoringPointIds.length > 0 && selectedMonitoringPointIds.length < availableMonitoringPoints.length}
                          onChange={handleSelectAllMonitoringPoints}
                        />
                      }
                      label={<Typography fontWeight="bold">{t('reports.generator.selectAll')}</Typography>}
                    />
                    <Divider sx={{ my: 1 }} />
                    {availableMonitoringPoints.map((mp) => {
                      const systemName = systems.find(s => s.id === mp.systemId)?.name || '';
                      const parameterName = mp.parameterObj?.name || mp.name;
                      const unit = mp.unitObj?.abbreviation || '';
                      const label = `${parameterName} (${systemName})${unit ? ` - ${unit}` : ''}`;

                      return (
                        <FormControlLabel
                          key={mp.id}
                          control={
                            <Checkbox
                              checked={selectedMonitoringPointIds.includes(mp.id)}
                              onChange={() => handleMonitoringPointToggle(mp.id)}
                            />
                          }
                          label={label}
                          sx={{ ml: 2 }}
                        />
                      );
                    })}
                  </FormGroup>

                  {selectedMonitoringPointIds.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {t('reports.generator.options.noParametersSelected')}
                    </Alert>
                  )}
                </Box>
              )}
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

        {/* Step 5: Conclusion & Signature */}
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
                {activeStep > 4 ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[4].label}
          </StepLabel>
          <StepContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('reports.generator.conclusion.help')}
              </Typography>

              {/* AI Assistance Button */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={generatingConclusion ? <CircularProgress size={16} /> : <AiIcon />}
                  onClick={handleGenerateAiConclusion}
                  disabled={generatingConclusion}
                  size="small"
                >
                  {generatingConclusion
                    ? t('reports.generator.conclusion.generating')
                    : t('reports.generator.conclusion.aiAssist')
                  }
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {t('reports.generator.conclusion.aiHint')}
                </Typography>
              </Box>

              {/* Conclusion Text Area */}
              <TextField
                fullWidth
                multiline
                rows={6}
                label={t('reports.generator.conclusion.label')}
                value={conclusionText}
                onChange={(e) => setConclusionText(e.target.value)}
                placeholder={t('reports.generator.conclusion.placeholder')}
                helperText={t('reports.generator.conclusion.helperText')}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 2 }} />

              {/* Signature Section */}
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                {t('reports.generator.signature.title')}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('reports.generator.signature.name')}
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder={user?.name || ''}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('reports.generator.signature.role')}
                    value={signatureRole}
                    onChange={(e) => setSignatureRole(e.target.value)}
                    placeholder={t('reports.generator.signature.rolePlaceholder')}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label={t('reports.generator.signature.registration')}
                    value={signatureRegistration}
                    onChange={(e) => setSignatureRegistration(e.target.value)}
                    placeholder={t('reports.generator.signature.registrationPlaceholder')}
                    size="small"
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
                disabled={!canProceed(4)}
              >
                {t('common.next')}
              </Button>
            </Box>
          </StepContent>
        </Step>

        {/* Step 6: Preview & Generate */}
        <Step>
          <StepLabel
            StepIconComponent={() => (
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: activeStep >= 5 ? 'primary.main' : 'grey.400',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {activeStep > 5 ? <CheckIcon fontSize="small" /> : <PreviewIcon fontSize="small" />}
              </Box>
            )}
          >
            {steps[5].label}
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

        {/* Step 7: Complete */}
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
            {steps[6].label}
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
                    chartData={reportData?.chartData ?? null}
                    onUpload={handlePdfUpload}
                    showPreviewButton
                    showDownloadButton
                    showUploadButton={!currentReport.pdfUrl}
                    templateLogo={getSelectedTemplate()?.logo}
                  />
                  {/* Word Document Download Button */}
                  <Tooltip title={t('reports.history.downloadWord')}>
                    <IconButton
                      color="primary"
                      onClick={handleDownloadWord}
                      disabled={downloadingWord}
                    >
                      {downloadingWord ? <CircularProgress size={20} /> : <WordIcon />}
                    </IconButton>
                  </Tooltip>
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
                  setConclusionText('');
                  setSignatureName('');
                  setSignatureRole('');
                  setSignatureRegistration('');
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
