/**
 * Report PDF Viewer Component
 * Provides preview and download functionality for PDF reports
 */
import React, { useState, useCallback } from 'react';
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';
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
  Alert
} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ReportPdfDocument } from './ReportPdfDocument';
import type { ReportPdfProps, ReportData } from './ReportPdfDocument';
import type { ReportTemplateConfig } from '../../../types';

interface ReportPdfViewerProps {
  reportName: string;
  config: ReportTemplateConfig;
  data: ReportData;
  onUpload?: (pdfBlob: Blob) => Promise<void>;
  showPreviewButton?: boolean;
  showDownloadButton?: boolean;
  showUploadButton?: boolean;
}

export const ReportPdfViewer: React.FC<ReportPdfViewerProps> = ({
  reportName,
  config,
  data,
  onUpload,
  showPreviewButton = true,
  showDownloadButton = true,
  showUploadButton = true
}) => {
  const { t } = useTranslation('reports');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const documentProps: ReportPdfProps = {
    reportName,
    config,
    data,
    t
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

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {showPreviewButton && (
        <Tooltip title={t('reports.history.pdf')}>
          <IconButton onClick={handleOpenPreview} color="primary">
            <PreviewIcon />
          </IconButton>
        </Tooltip>
      )}

      {showDownloadButton && (
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
