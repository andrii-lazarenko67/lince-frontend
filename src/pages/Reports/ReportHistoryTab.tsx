import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { downloadFromUrl } from '../../utils/downloadFile';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  Chip,
  TextField,
  Grid,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  CloudOff as NoPdfIcon,
  Description as WordIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchGeneratedReports,
  deleteGeneratedReport,
  downloadReportPdf,
  downloadReportWord
} from '../../store/slices/generatedReportSlice';
import type { GeneratedReport } from '../../types';

const ReportHistoryTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { reports, loading, error } = useAppSelector((state) => state.generatedReports);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReport, setSelectedReport] = useState<GeneratedReport | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchGeneratedReports({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchGeneratedReports({
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined
    }));
  };

  const handleApplyFilters = () => {
    dispatch(fetchGeneratedReports({
      startDate: startDateFilter || undefined,
      endDate: endDateFilter || undefined
    }));
  };

  const handleClearFilters = () => {
    setStartDateFilter('');
    setEndDateFilter('');
    dispatch(fetchGeneratedReports({}));
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, report: GeneratedReport) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDownload = async () => {
    if (!selectedReport) return;
    handleMenuClose();

    const result = await dispatch(downloadReportPdf(selectedReport.id));
    if (downloadReportPdf.fulfilled.match(result) && result.payload.url) {
      // Use cross-platform download utility (works on mobile)
      const filename = `${selectedReport.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await downloadFromUrl(result.payload.url, filename);
    }
  };

  const handleDownloadWord = async () => {
    if (!selectedReport) return;
    handleMenuClose();

    await dispatch(downloadReportWord({
      id: selectedReport.id,
      reportName: selectedReport.name,
      language: i18next.language
    }));
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReport) return;
    await dispatch(deleteGeneratedReport(selectedReport.id));
    setIsDeleteDialogOpen(false);
    setSelectedReport(null);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPeriodLabel = (report: GeneratedReport) => {
    const { period } = report;
    return `${formatDate(period.startDate)} - ${formatDate(period.endDate)}`;
  };

  const paginatedReports = reports.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && reports.length === 0) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <div data-tour="history-filters">
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="action" />
            <Typography variant="subtitle2">{t('reports.history.filters')}</Typography>
          </Box>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label={t('reports.history.startDate')}
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                fullWidth
                type="date"
                size="small"
                label={t('reports.history.endDate')}
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" onClick={handleApplyFilters}>
                  {t('common.apply')}
                </Button>
                <Button variant="outlined" onClick={handleClearFilters}>
                  {t('common.clear')}
                </Button>
                <div data-tour="refresh-button">
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                  >
                    {t('common.refresh')}
                  </Button>
                </div>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </div>

      {/* Reports Table */}
      <div data-tour="history-table">
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('reports.history.name')}</TableCell>
                <TableCell>{t('reports.history.period')}</TableCell>
                <TableCell>{t('reports.history.template')}</TableCell>
                <TableCell>{t('reports.history.systems')}</TableCell>
                <TableCell>{t('reports.history.generatedAt')}</TableCell>
                <TableCell>{t('reports.history.download')}</TableCell>
                <TableCell align="right">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {report.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        size="small"
                        label={t(`reports.generator.periods.${report.period?.type || 'custom'}`)}
                        variant="outlined"
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {getPeriodLabel(report)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {report.template?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.systemIds?.length || 0} {t('reports.history.systemsCount')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDateTime(report.generatedAt)}
                    </Typography>
                    {report.user && (
                      <Typography variant="caption" color="text.secondary">
                        {t('reports.history.by')} {report.user.name}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {report.pdfUrl ? (
                        <Tooltip title={t('reports.history.downloadPdf')}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              const filename = `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
                              downloadFromUrl(report.pdfUrl!, filename);
                            }}
                          >
                            <PdfIcon />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title={t('reports.history.noPdf')}>
                          <span>
                            <IconButton size="small" disabled>
                              <NoPdfIcon color="disabled" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip title={t('reports.history.downloadWord')}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => dispatch(downloadReportWord({ id: report.id, reportName: report.name, language: i18next.language }))}
                        >
                          <WordIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, report)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {reports.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {t('reports.history.empty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={reports.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage={t('common.rowsPerPage')}
          />
        </TableContainer>
      </div>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedReport?.pdfUrl && (
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <PdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('reports.history.downloadPdf')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleDownloadWord}>
          <ListItemIcon>
            <WordIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>{t('reports.history.downloadWord')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('common.delete')}</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} container={document.getElementById('modal-root') || undefined}>
        <DialogTitle>{t('reports.history.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('reports.history.deleteConfirmMessage', { name: selectedReport?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportHistoryTab;
