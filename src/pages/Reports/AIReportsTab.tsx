import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Fade
} from '@mui/material';
import {
  AutoAwesome as AiIcon,
  ContentCopy as CopyIcon,
  Refresh as RefreshIcon,
  Send as SendIcon,
  BarChart as DataIcon,
  CheckCircle as CheckIcon,
  PictureAsPdf as PdfIcon,
  Description as WordIcon
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import axiosInstance from '../../api/axiosInstance';

const AIReportsTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);

  // Configuration state
  const [selectedSystemIds, setSelectedSystemIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [prompt, setPrompt] = useState('');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [refining, setRefining] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const rootSystems = useMemo(() => systems.filter(s => !s.parentId), [systems]);

  const presets = [
    t('reports.aiReports.preset1'),
    t('reports.aiReports.preset2'),
    t('reports.aiReports.preset3'),
    t('reports.aiReports.preset4'),
    t('reports.aiReports.preset5'),
  ];

  const canGenerate = selectedSystemIds.length > 0 && startDate && endDate && prompt.trim().length > 0;

  const doGenerate = async (customPrompt: string, isRefinement = false) => {
    if (isRefinement) {
      setRefining(true);
    } else {
      setLoading(true);
      setReport('');
    }
    setError('');

    const finalPrompt = isRefinement
      ? `${t('reports.aiReports.refinementContext')}\n\n---\n${report}\n---\n\n${t('reports.aiReports.refinementInstruction')}: ${customPrompt}`
      : customPrompt;

    try {
      const response = await axiosInstance.post('/ai/advanced-report', {
        prompt: finalPrompt,
        systemIds: selectedSystemIds,
        period: { startDate, endDate },
        language: i18next.language?.startsWith('pt') ? 'pt' : 'en'
      });
      const generated = response.data?.data?.report || '';
      setReport(generated);
      if (isRefinement) {
        setRefinementPrompt('');
      }
      // Scroll to report
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {
      setError(t('reports.aiReports.error'));
    } finally {
      setLoading(false);
      setRefining(false);
    }
  };

  const handleGenerate = () => doGenerate(prompt);
  const handleRefine = () => { if (refinementPrompt.trim()) doGenerate(refinementPrompt, true); };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    const addPage = () => {
      doc.addPage();
      y = margin;
    };

    const checkY = (needed: number) => {
      if (y + needed > doc.internal.pageSize.getHeight() - margin) addPage();
    };

    const lines = report.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        checkY(12);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text(line.slice(2), margin, y);
        y += 8;
      } else if (line.startsWith('## ')) {
        checkY(10);
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 95);
        doc.text(line.slice(3), margin, y);
        y += 7;
      } else if (line.startsWith('### ')) {
        checkY(8);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235);
        doc.text(line.slice(4), margin, y);
        y += 6;
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        const wrapped = doc.splitTextToSize('• ' + line.slice(2), maxWidth - 4);
        checkY(wrapped.length * 5);
        doc.text(wrapped, margin + 3, y);
        y += wrapped.length * 5;
      } else if (line.startsWith('---')) {
        checkY(4);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
      } else if (line.trim() === '') {
        y += 3;
      } else {
        const isBoldLine = line.startsWith('**') && line.endsWith('**');
        doc.setFontSize(10);
        doc.setFont('helvetica', isBoldLine ? 'bold' : 'normal');
        doc.setTextColor(50, 50, 50);
        const text = isBoldLine ? line.slice(2, -2) : line;
        const wrapped = doc.splitTextToSize(text, maxWidth);
        checkY(wrapped.length * 5);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 5;
      }
    }

    doc.save('ai-report.pdf');
  };

  const handleExportWord = async () => {
    setExportingWord(true);
    try {
      const filename = `ai-report-${startDate}-${endDate}`;
      const response = await axiosInstance.post('/ai/export-word', { text: report, filename }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      // silent fail
    } finally {
      setExportingWord(false);
    }
  };

  // Render report with basic markdown-like formatting
  const renderReport = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('# ')) {
        return <Typography key={i} variant="h5" fontWeight={700} sx={{ mt: 2, mb: 1, color: '#1e3a5f' }}>{line.slice(2)}</Typography>;
      }
      if (line.startsWith('## ')) {
        return <Typography key={i} variant="h6" fontWeight={600} sx={{ mt: 2, mb: 0.5, color: '#1e3a5f' }}>{line.slice(3)}</Typography>;
      }
      if (line.startsWith('### ')) {
        return <Typography key={i} variant="subtitle1" fontWeight={600} sx={{ mt: 1.5, mb: 0.5, color: '#2563eb' }}>{line.slice(4)}</Typography>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <Typography key={i} variant="body1" fontWeight={600} sx={{ mt: 1 }}>{line.slice(2, -2)}</Typography>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <Box key={i} sx={{ display: 'flex', gap: 1, pl: 2, mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">•</Typography>
            <Typography variant="body2">{line.slice(2)}</Typography>
          </Box>
        );
      }
      if (line.startsWith('---') || line.startsWith('===')) {
        return <Divider key={i} sx={{ my: 1.5 }} />;
      }
      if (line.trim() === '') {
        return <Box key={i} sx={{ height: 8 }} />;
      }
      // Highlight out-of-spec lines
      const isOutOfSpec = line.includes('⚠') || line.toUpperCase().includes('OUT OF SPEC') || line.toUpperCase().includes('FORA DA ESPECIFICAÇÃO');
      return (
        <Typography
          key={i}
          variant="body2"
          sx={{
            mb: 0.25,
            color: isOutOfSpec ? '#dc2626' : 'text.primary',
            fontWeight: isOutOfSpec ? 500 : 400
          }}
        >
          {line}
        </Typography>
      );
    });
  };

  return (
    <Box>
      {/* Header banner */}
      <Box sx={{
        mb: 3,
        p: 3,
        borderRadius: 2,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #0ea5e9 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <AiIcon sx={{ fontSize: 40, opacity: 0.9 }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>{t('reports.aiReports.title')}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            {t('reports.aiReports.subtitle')}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left: Configuration */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DataIcon fontSize="small" color="primary" />
                {t('reports.aiReports.configTitle')}
              </Typography>

              {/* System selector */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>{t('reports.aiReports.selectSystems')}</InputLabel>
                <Select
                  multiple
                  value={selectedSystemIds}
                  onChange={(e) => setSelectedSystemIds(e.target.value as number[])}
                  label={t('reports.aiReports.selectSystems')}
                  renderValue={(selected) =>
                    rootSystems
                      .filter(s => (selected as number[]).includes(s.id))
                      .map(s => s.name)
                      .join(', ')
                  }
                >
                  {rootSystems.map(system => (
                    <MenuItem key={system.id} value={system.id}>
                      {system.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date range */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label={t('reports.aiReports.startDate')}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label={t('reports.aiReports.endDate')}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Prompt */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('reports.aiReports.promptLabel')}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {t('reports.aiReports.presetsLabel')}:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {presets.map((preset) => (
                  <Chip
                    key={preset}
                    label={preset}
                    size="small"
                    clickable
                    onClick={() => setPrompt(preset)}
                    color={prompt === preset ? 'primary' : 'default'}
                    variant={prompt === preset ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.68rem', cursor: 'pointer' }}
                  />
                ))}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={5}
                label={t('reports.aiReports.promptPlaceholder')}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('reports.aiReports.promptExample')}
                size="small"
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                sx={{
                  bgcolor: '#1d4ed8',
                  '&:hover': { bgcolor: '#1e40af' },
                  fontWeight: 600,
                  py: 1.25
                }}
              >
                {loading ? t('reports.aiReports.generating') : t('reports.aiReports.generate')}
              </Button>

              {!canGenerate && !loading && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                  {t('reports.aiReports.selectToEnable')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Result */}
        <Grid item xs={12} md={7}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Card variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1" fontWeight={500}>{t('reports.aiReports.analyzing')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('reports.aiReports.analyzingHint')}
              </Typography>
            </Card>
          )}

          {!loading && report && (
            <Fade in>
              <Box ref={reportRef}>
                <Card variant="outlined">
                  {/* Report toolbar */}
                  <Box sx={{
                    px: 2.5, py: 1.5,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    borderBottom: '1px solid', borderColor: 'divider',
                    bgcolor: '#f8fafc'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AiIcon sx={{ fontSize: 18, color: '#1d4ed8' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="#1e3a5f">
                        {t('reports.aiReports.reportReady')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={copied ? t('reports.aiReports.copied') : t('reports.aiReports.copy')}>
                        <IconButton size="small" onClick={handleCopy}>
                          {copied ? <CheckIcon fontSize="small" color="success" /> : <CopyIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('reports.aiReports.exportPdf')}>
                        <IconButton size="small" onClick={handleExportPdf}>
                          <PdfIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={exportingWord ? t('reports.aiReports.exporting') : t('reports.aiReports.exportWord')}>
                        <span>
                          <IconButton size="small" onClick={handleExportWord} disabled={exportingWord}>
                            {exportingWord
                              ? <CircularProgress size={16} />
                              : <WordIcon fontSize="small" sx={{ color: '#1d6fd4' }} />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title={t('reports.aiReports.regenerate')}>
                        <IconButton size="small" onClick={handleGenerate} disabled={loading}>
                          <RefreshIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Report content */}
                  <CardContent sx={{ maxHeight: 520, overflowY: 'auto', px: 3, py: 2.5 }}>
                    {renderReport(report)}
                  </CardContent>
                </Card>

                {/* Refinement */}
                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AiIcon fontSize="small" color="primary" />
                      {t('reports.aiReports.refineTitle')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      {t('reports.aiReports.refineHint')}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={refinementPrompt}
                        onChange={(e) => setRefinementPrompt(e.target.value)}
                        placeholder={t('reports.aiReports.refinePlaceholder')}
                        disabled={refining}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRefine(); } }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleRefine}
                        disabled={refining || !refinementPrompt.trim()}
                        startIcon={refining ? <CircularProgress size={14} /> : <SendIcon fontSize="small" />}
                        sx={{ whiteSpace: 'nowrap', minWidth: 100 }}
                      >
                        {refining ? t('reports.aiReports.refining') : t('reports.aiReports.refine')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {!loading && !report && !error && (
            <Card variant="outlined" sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc' }}>
              <AiIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                {t('reports.aiReports.emptyState')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t('reports.aiReports.emptyStateHint')}
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIReportsTab;
