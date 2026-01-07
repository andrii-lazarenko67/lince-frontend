import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  Star as DefaultIcon,
  StarBorder as SetDefaultIcon,
  Public as GlobalIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchReportTemplates,
  createReportTemplate,
  deleteReportTemplate,
  duplicateReportTemplate,
  setDefaultTemplate
} from '../../store/slices/reportTemplateSlice';
import type { ReportTemplate, CreateReportTemplateRequest } from '../../types';
import { DEFAULT_TEMPLATE_CONFIG } from '../../types/reportTemplate.types';
import ReportTemplateEditor from './ReportTemplateEditor';

const ReportTemplatesTab: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { templates, loading, error } = useAppSelector((state) => state.reportTemplates);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  useEffect(() => {
    dispatch(fetchReportTemplates());
  }, [dispatch]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, template: ReportTemplate) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;

    const data: CreateReportTemplateRequest = {
      name: newTemplateName.trim(),
      description: newTemplateDescription.trim() || undefined,
      config: DEFAULT_TEMPLATE_CONFIG
    };

    const result = await dispatch(createReportTemplate(data));
    if (createReportTemplate.fulfilled.match(result)) {
      setIsCreateDialogOpen(false);
      setNewTemplateName('');
      setNewTemplateDescription('');
      // Open editor for new template
      setSelectedTemplate(result.payload);
      setIsEditorOpen(true);
    }
  };

  const handleEditTemplate = () => {
    handleMenuClose();
    setIsEditorOpen(true);
  };

  const handleDuplicateTemplate = async () => {
    if (!selectedTemplate) return;
    handleMenuClose();
    await dispatch(duplicateReportTemplate({ id: selectedTemplate.id }));
  };

  const handleSetDefault = async () => {
    if (!selectedTemplate) return;
    handleMenuClose();
    await dispatch(setDefaultTemplate(selectedTemplate.id));
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    await dispatch(deleteReportTemplate(selectedTemplate.id));
    setIsDeleteDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  const getBlockCount = (template: ReportTemplate) => {
    return template.config?.blocks?.filter(b => b.enabled).length || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && templates.length === 0) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {t('reports.templates.title')} ({templates.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          {t('reports.templates.create')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {templates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                cursor: 'pointer',
                '&:hover': { boxShadow: 4 },
                border: template.isDefault ? '2px solid' : 'none',
                borderColor: template.isDefault ? 'primary.main' : undefined
              }}
              onClick={() => {
                setSelectedTemplate(template);
                setIsEditorOpen(true);
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" component="div" noWrap sx={{ maxWidth: 180 }}>
                      {template.name}
                    </Typography>
                    {template.isDefault && (
                      <Tooltip title={t('reports.templates.default')}>
                        <DefaultIcon color="primary" fontSize="small" />
                      </Tooltip>
                    )}
                    {template.isGlobal && (
                      <Tooltip title={t('reports.templates.global')}>
                        <GlobalIcon color="secondary" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, template)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, minHeight: 40 }}>
                  {template.description || t('reports.templates.noDescription')}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={t('reports.templates.blocksCount', { count: getBlockCount(template) })}
                    variant="outlined"
                  />
                  {template.client && (
                    <Chip
                      size="small"
                      label={template.client.name}
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  {t('reports.templates.lastUpdated')}: {formatDate(template.updatedAt)}
                </Typography>
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTemplate(template);
                    setIsEditorOpen(true);
                  }}
                >
                  {t('common.edit')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {templates.length === 0 && !loading && (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" gutterBottom>
                {t('reports.templates.empty')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsCreateDialogOpen(true)}
                sx={{ mt: 2 }}
              >
                {t('reports.templates.createFirst')}
              </Button>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handleEditTemplate}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('common.edit')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDuplicateTemplate}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('reports.templates.duplicate')}</ListItemText>
        </MenuItem>
        {selectedTemplate && !selectedTemplate.isDefault && (
          <MenuItem onClick={handleSetDefault}>
            <ListItemIcon>
              <SetDefaultIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('reports.templates.setDefault')}</ListItemText>
          </MenuItem>
        )}
        {selectedTemplate && !selectedTemplate.isGlobal && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>{t('common.delete')}</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('reports.templates.create')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('reports.templates.name')}
            fullWidth
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label={t('reports.templates.descriptionLabel')}
            fullWidth
            multiline
            rows={3}
            value={newTemplateDescription}
            onChange={(e) => setNewTemplateDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={!newTemplateName.trim()}
          >
            {t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>{t('reports.templates.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('reports.templates.deleteConfirmMessage', { name: selectedTemplate?.name })}
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

      {/* Template Editor Dialog */}
      {isEditorOpen && selectedTemplate && (
        <ReportTemplateEditor
          template={selectedTemplate}
          open={isEditorOpen}
          onClose={handleEditorClose}
        />
      )}
    </Box>
  );
};

export default ReportTemplatesTab;
