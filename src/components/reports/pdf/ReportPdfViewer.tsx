/**
 * Report PDF Viewer Component
 * Provides preview and download functionality for PDF reports
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Buffer } from 'buffer';
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';

// Polyfill Buffer for @react-pdf/renderer - only loaded when PDF is used
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
  Typography
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ReportPdfDocument } from './ReportPdfDocument';
import { ChartImageBatchGenerator } from './ChartImageGenerator';
import type { ReportPdfProps, ReportData } from './ReportPdfDocument';
import type { ReportTemplateConfig, ReportChartData, ChartConfig } from '../../../types';
import { DEFAULT_CHART_CONFIG } from '../../../types';

interface ReportPdfViewerProps {
  reportName: string;
  config: ReportTemplateConfig;
  data: ReportData;
  chartData?: ReportChartData | null;
  onUpload?: (pdfBlob: Blob) => Promise<void>;
  showPreviewButton?: boolean;
  showDownloadButton?: boolean;
  showUploadButton?: boolean;
  templateLogo?: string | null;
}

export const ReportPdfViewer: React.FC<ReportPdfViewerProps> = ({
  reportName,
  config,
  data,
  chartData,
  onUpload,
  showPreviewButton = true,
  showDownloadButton = true,
  showUploadButton = true,
  templateLogo
}) => {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // State for generated chart images
  const [fieldChartImages, setFieldChartImages] = useState<Map<number, string>>(new Map());
  const [laboratoryChartImages, setLaboratoryChartImages] = useState<Map<number, string>>(new Map());
  const [chartsGenerating, setChartsGenerating] = useState(false);
  const [chartsReady, setChartsReady] = useState(false);

  // Determine if charts should be generated
  const analysesBlock = config.blocks?.find(b => b.type === 'analyses');
  const shouldGenerateCharts = analysesBlock?.includeCharts && chartData &&
    (chartData.fieldCharts.length > 0 || chartData.laboratoryCharts.length > 0);

  // Get chart config from analyses block - support both old and new config structure
  // Use fieldChartConfig for field charts, laboratoryChartConfig for lab charts
  // Also check if chartData has the configs embedded from backend
  const fieldChartConfig: ChartConfig = chartData?.fieldChartConfig || analysesBlock?.fieldChartConfig || analysesBlock?.chartConfig || DEFAULT_CHART_CONFIG;
  const laboratoryChartConfig: ChartConfig = chartData?.laboratoryChartConfig || analysesBlock?.laboratoryChartConfig || analysesBlock?.chartConfig || DEFAULT_CHART_CONFIG;

  // Handle chart images generation
  const handleFieldChartsGenerated = useCallback((images: Map<number, string>) => {
    setFieldChartImages(images);
  }, []);

  const handleLaboratoryChartsGenerated = useCallback((images: Map<number, string>) => {
    setLaboratoryChartImages(images);
  }, []);

  // Check if all charts are ready
  useEffect(() => {
    if (!shouldGenerateCharts) {
      setChartsReady(true);
      return;
    }

    const fieldCount = chartData?.fieldCharts.length || 0;
    const labCount = chartData?.laboratoryCharts.length || 0;

    const fieldReady = fieldCount === 0 || fieldChartImages.size === fieldCount;
    const labReady = labCount === 0 || laboratoryChartImages.size === labCount;

    if (fieldReady && labReady) {
      setChartsReady(true);
      setChartsGenerating(false);
    }
  }, [shouldGenerateCharts, chartData, fieldChartImages.size, laboratoryChartImages.size]);

  // Start chart generation when component mounts
  useEffect(() => {
    if (shouldGenerateCharts && !chartsReady) {
      setChartsGenerating(true);
    }
  }, [shouldGenerateCharts, chartsReady]);

  // Build report data with chart images
  const dataWithCharts: ReportData = useMemo(() => {
    if (!shouldGenerateCharts || !chartsReady) {
      return data;
    }

    return {
      ...data,
      chartImages: {
        field: fieldChartImages.size > 0 ? fieldChartImages : undefined,
        laboratory: laboratoryChartImages.size > 0 ? laboratoryChartImages : undefined
      }
    };
  }, [data, shouldGenerateCharts, chartsReady, fieldChartImages, laboratoryChartImages]);

  const documentProps: ReportPdfProps = {
    reportName,
    config,
    data: dataWithCharts,
    t,
    templateLogo
  };

  const handleOpenPreview = useCallback(() => {
    setPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!onUpload) return;

    setUploading(true);
    setUploadError(null);

    try {
      // Generate PDF blob
      const pdfBlob = await pdf(<ReportPdfDocument {...documentProps} />).toBlob();
      await onUpload(pdfBlob);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [documentProps, onUpload]);

  const filename = `${reportName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

  // Show loading state while charts are generating
  const isLoading = Boolean(shouldGenerateCharts) && !chartsReady;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Hidden chart generators - use separate configs for field and laboratory charts */}
      {shouldGenerateCharts && chartData && chartsGenerating && (
        <>
          {chartData.fieldCharts.length > 0 && (
            <ChartImageBatchGenerator
              chartSeriesList={chartData.fieldCharts}
              chartConfig={fieldChartConfig}
              onAllImagesGenerated={handleFieldChartsGenerated}
            />
          )}
          {chartData.laboratoryCharts.length > 0 && (
            <ChartImageBatchGenerator
              chartSeriesList={chartData.laboratoryCharts}
              chartConfig={laboratoryChartConfig}
              onAllImagesGenerated={handleLaboratoryChartsGenerated}
            />
          )}
        </>
      )}

      {/* Loading indicator while generating charts */}
      {isLoading && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={14} />
          {t('reports.charts.generating')}
        </Typography>
      )}

      {showPreviewButton && (
        <Tooltip title={t('reports.history.pdf')}>
          <span>
            <IconButton onClick={handleOpenPreview} color="primary" disabled={isLoading}>
              <PreviewIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {showDownloadButton && !isLoading && (
        <PDFDownloadLink
          document={<ReportPdfDocument {...documentProps} />}
          fileName={filename}
          style={{ textDecoration: 'none' }}
        >
          {({ loading }) =>
            loading ? (
              <IconButton disabled>
                <CircularProgress size={20} />
              </IconButton>
            ) : (
              <Tooltip title={t('reports.history.downloadPdf')}>
                <IconButton color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )
          }
        </PDFDownloadLink>
      )}

      {showUploadButton && onUpload && (
        <Tooltip title={uploading ? t('common.uploading') : t('common.upload')}>
          <span>
            <IconButton
              onClick={handleUpload}
              disabled={uploading}
              color="primary"
            >
              {uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            </IconButton>
          </span>
        </Tooltip>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ ml: 1 }}>
          {uploadError}
        </Alert>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        container={document.getElementById('modal-root') || undefined}
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {reportName}
          <IconButton onClick={handleClosePreview}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <PDFViewer width="100%" height="100%" showToolbar>
            <ReportPdfDocument {...documentProps} />
          </PDFViewer>
        </DialogContent>
        <DialogActions>
          <PDFDownloadLink
            document={<ReportPdfDocument {...documentProps} />}
            fileName={filename}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <DownloadIcon />}
                disabled={loading}
              >
                {t('reports.history.download')}
              </Button>
            )}
          </PDFDownloadLink>
          <Button onClick={handleClosePreview}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/**
 * Generate PDF as Blob for upload
 */
export async function generatePdfBlob(props: ReportPdfProps): Promise<Blob> {
  const pdfInstance = pdf(<ReportPdfDocument {...props} />);
  return await pdfInstance.toBlob();
}

/**
 * Download PDF directly
 */
export async function downloadPdf(props: ReportPdfProps, filename: string): Promise<void> {
  const blob = await generatePdfBlob(props);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default ReportPdfViewer;
