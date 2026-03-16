import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  Sensors as SensorsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  FiberManualRecord as DotIcon,
  Refresh as RefreshIcon,
  Download as ImportIcon,
  Code as CodeIcon,
  ToggleOn as ActivateIcon,
  ToggleOff as DeactivateIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchIoTDevices,
  createIoTDevice,
  deleteIoTDevice,
  updateIoTDeviceStatus,
  fetchIoTReadings,
  importIoTToLog,
  clearReadings,
  type IoTDevice
} from '../../store/slices/iotSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import axiosInstance from '../../api/axiosInstance';
import { LineChart, type LineChartData } from '../../components/charts';

// ─── Helpers ────────────────────────────────────────────────────────────────

const TIME_RANGES = [1, 6, 24, 48, 168] as const;
type Hours = typeof TIME_RANGES[number];

function formatLastSeen(dateStr: string | null | undefined, never: string): string {
  if (!dateStr) return never;
  const d = new Date(dateStr);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function isOnline(lastSeen: string | null | undefined): boolean {
  if (!lastSeen) return false;
  return (Date.now() - new Date(lastSeen).getTime()) / 1000 < 120;
}

// ─── TabPanel ────────────────────────────────────────────────────────────────

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const IoTPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { devices, readings } = useAppSelector((state) => state.iot);
  const { systems } = useAppSelector((state) => state.systems);

  const [activeTab, setActiveTab] = useState(0);

  // Live tab state
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [hours, setHours] = useState<Hours>(24);
  const [refreshing, setRefreshing] = useState(false);
  const [importDate, setImportDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Devices tab state
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSystemId, setNewSystemId] = useState<number | ''>('');
  const [newMpId, setNewMpId] = useState<number | ''>('');
  const [availableMPs, setAvailableMPs] = useState<{ id: number; name: string; parameterObj?: { name: string }; unitObj?: { abbreviation: string } }[]>([]);
  const [loadingMPs, setLoadingMPs] = useState(false);
  const [addError, setAddError] = useState('');
  const [createdToken, setCreatedToken] = useState<{ deviceId: number; name: string; token: string } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<IoTDevice | null>(null);
  const [guideOpen, setGuideOpen] = useState<IoTDevice | null>(null);
  const [guideTokenVisible, setGuideTokenVisible] = useState(false);

  const rootSystems = systems.filter(s => !s.parentId);

  // Initial load
  useEffect(() => {
    dispatch(fetchIoTDevices());
    dispatch(fetchSystems({}));
  }, [dispatch]);

  // Polling for live readings
  const loadReadings = useCallback(async (device: IoTDevice, h: Hours) => {
    setRefreshing(true);
    try {
      await dispatch(fetchIoTReadings({ deviceId: device.id, hours: h }));
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (activeTab !== 0 || !selectedDevice) {
      if (pollRef.current) clearInterval(pollRef.current);
      dispatch(clearReadings());
      return;
    }
    loadReadings(selectedDevice, hours);
    pollRef.current = setInterval(() => loadReadings(selectedDevice, hours), 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeTab, selectedDevice, hours, loadReadings, dispatch]);

  // Load monitoring points when system changes in add dialog
  useEffect(() => {
    if (!newSystemId) { setAvailableMPs([]); return; }
    setLoadingMPs(true);
    setNewMpId('');
    axiosInstance.get(`/monitoring-points?systemId=${newSystemId}`)
      .then(r => setAvailableMPs(r.data.data || []))
      .catch(() => setAvailableMPs([]))
      .finally(() => setLoadingMPs(false));
  }, [newSystemId]);

  // ── Live Tab handlers ──────────────────────────────────────────────────────

  const handleImport = async () => {
    if (!selectedDevice) return;
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await dispatch(importIoTToLog({ deviceId: selectedDevice.id, date: importDate })).unwrap();
      const unit = selectedDevice.monitoringPoint?.unitObj?.abbreviation || '';
      setImportMsg({
        type: 'success',
        text: t('iot.live.importSuccess', { count: res.readingsCount, value: res.value, unit })
      });
    } catch {
      setImportMsg({ type: 'error', text: t('iot.live.importError') });
    } finally {
      setImporting(false);
    }
  };

  // ── Devices Tab handlers ───────────────────────────────────────────────────

  const handleAdd = async () => {
    if (!newName.trim() || !newSystemId || !newMpId) {
      setAddError(t('iot.errors.requiredFields'));
      return;
    }
    setAddError('');
    try {
      const result = await dispatch(createIoTDevice({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        systemId: newSystemId as number,
        monitoringPointId: newMpId as number
      })).unwrap();
      setCreatedToken({ deviceId: result.id, name: result.name, token: result.token });
      setAddOpen(false);
      setNewName(''); setNewDesc(''); setNewSystemId(''); setNewMpId('');
    } catch {
      setAddError(t('iot.errors.createError'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    await dispatch(deleteIoTDevice(deleteConfirm.id));
    if (selectedDevice?.id === deleteConfirm.id) setSelectedDevice(null);
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (device: IoTDevice) => {
    dispatch(updateIoTDeviceStatus({
      id: device.id,
      status: device.status === 'active' ? 'inactive' : 'active'
    }));
  };

  const handleCopyToken = async (token: string) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } catch { /* ignore */ }
  };

  // ── Chart data ─────────────────────────────────────────────────────────────

  const chartData: LineChartData[] = readings.map(r => ({
    label: new Date(r.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    value: parseFloat(String(r.value))
  }));

  const mp = selectedDevice?.monitoringPoint;
  const unit = mp?.unitObj?.abbreviation || '';
  const minVal = mp?.minValue != null ? parseFloat(String(mp.minValue)) : null;
  const maxVal = mp?.maxValue != null ? parseFloat(String(mp.maxValue)) : null;
  const currentValue = selectedDevice?.lastValue != null ? parseFloat(String(selectedDevice.lastValue)) : null;
  const currentOutOfRange = selectedDevice?.isOutOfRange ?? false;

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <h1 className="text-2xl font-bold text-gray-900">{t('iot.title')}</h1>
          <p className="text-gray-500 mt-1">{t('iot.description')}</p>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<SensorsIcon />} iconPosition="start" label={t('iot.tabs.live')} />
          <Tab icon={<AddIcon />} iconPosition="start" label={t('iot.tabs.devices')} />
        </Tabs>
      </Paper>

      {/* ── Tab 0: Live Dashboard ───────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={0}>
        {devices.length === 0 ? (
          <Card variant="outlined" sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc' }}>
            <SensorsIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {t('iot.live.noDevices')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('iot.live.noDevicesHint')}
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Left: Device list */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: 1 }}>
                {t('iot.devices.title')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {devices.map(device => {
                  const online = isOnline(device.lastSeen);
                  const selected = selectedDevice?.id === device.id;
                  return (
                    <Card
                      key={device.id}
                      variant="outlined"
                      onClick={() => setSelectedDevice(device)}
                      sx={{
                        cursor: 'pointer',
                        border: selected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        bgcolor: selected ? '#eff6ff' : 'white',
                        transition: 'all 0.15s',
                        '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' }
                      }}
                    >
                      <CardContent sx={{ p: '12px 16px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <DotIcon sx={{
                            fontSize: 10,
                            color: device.status === 'inactive' ? '#9ca3af' : online ? '#22c55e' : '#f59e0b'
                          }} />
                          <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1 }}>
                            {device.name}
                          </Typography>
                          {device.isOutOfRange && (
                            <Chip label="⚠" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {device.system?.name} — {device.monitoringPoint?.parameterObj?.name || device.monitoringPoint?.name}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          {currentValue !== null && selected ? (
                            <Typography variant="caption" fontWeight={600} sx={{ color: currentOutOfRange ? '#dc2626' : '#16a34a' }}>
                              {currentValue} {unit}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              {device.lastValue != null ? `${parseFloat(String(device.lastValue))} ${unit}` : '—'}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {formatLastSeen(device.lastSeen, t('iot.live.never'))}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Grid>

            {/* Right: Chart + controls */}
            <Grid item xs={12} md={8}>
              {!selectedDevice ? (
                <Card variant="outlined" sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <SensorsIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">{t('iot.live.selectDevice')}</Typography>
                </Card>
              ) : (
                <Box>
                  {/* Device header */}
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <DotIcon sx={{ fontSize: 12, color: selectedDevice.status === 'inactive' ? '#9ca3af' : isOnline(selectedDevice.lastSeen) ? '#22c55e' : '#f59e0b' }} />
                            <Typography variant="h6" fontWeight={700}>{selectedDevice.name}</Typography>
                            <Chip
                              label={selectedDevice.status === 'inactive' ? t('iot.live.inactive') : isOnline(selectedDevice.lastSeen) ? t('iot.live.online') : t('iot.live.offline')}
                              size="small"
                              color={selectedDevice.status === 'inactive' ? 'default' : isOnline(selectedDevice.lastSeen) ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {selectedDevice.system?.name} › {mp?.parameterObj?.name || mp?.name}
                            {minVal !== null && maxVal !== null && ` | ${t('iot.live.minLimit')}: ${minVal} ${unit} — ${t('iot.live.maxLimit')}: ${maxVal} ${unit}`}
                          </Typography>
                        </Box>

                        {/* Current value badge */}
                        {currentValue !== null && (
                          <Box sx={{
                            px: 2, py: 1,
                            borderRadius: '6px',
                            bgcolor: currentOutOfRange ? '#fef2f2' : '#f0fdf4',
                            border: `2px solid ${currentOutOfRange ? '#fca5a5' : '#86efac'}`,
                            textAlign: 'center'
                          }}>
                            <Typography variant="h5" fontWeight={800} sx={{ color: currentOutOfRange ? '#dc2626' : '#16a34a', lineHeight: 1 }}>
                              {currentValue}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{unit}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: currentOutOfRange ? '#dc2626' : '#16a34a', fontWeight: 600, fontSize: '0.65rem' }}>
                              {currentOutOfRange ? t('iot.live.outOfRange') : t('iot.live.withinRange')}
                            </Typography>
                          </Box>
                        )}

                        <Tooltip title={refreshing ? t('iot.live.refreshing') : t('common.refresh')}>
                          <span>
                            <IconButton onClick={() => loadReadings(selectedDevice, hours)} disabled={refreshing} size="small">
                              <RefreshIcon fontSize="small" sx={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Time range selector */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {TIME_RANGES.map(h => (
                      <Chip
                        key={h}
                        label={t(`iot.live.hours${h}`)}
                        size="small"
                        clickable
                        onClick={() => setHours(h)}
                        color={hours === h ? 'primary' : 'default'}
                        variant={hours === h ? 'filled' : 'outlined'}
                      />
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 'auto' }}>
                      {t('iot.live.autoRefresh')}
                    </Typography>
                  </Box>

                  {/* Line chart */}
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <LineChart
                        data={chartData}
                        title={`${t('iot.live.chartTitle')} — ${mp?.parameterObj?.name || mp?.name || ''} (${unit})`}
                        color={currentOutOfRange ? '#ef4444' : '#3b82f6'}
                        height={240}
                        showStats={chartData.length > 0}
                      />
                    </CardContent>
                  </Card>

                  {/* Import to daily log */}
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImportIcon fontSize="small" color="primary" />
                        {t('iot.live.importToLog')}
                      </Typography>
                      {importMsg && (
                        <Alert severity={importMsg.type} onClose={() => setImportMsg(null)} sx={{ mb: 1.5 }}>
                          {importMsg.text}
                        </Alert>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          type="date"
                          size="small"
                          label={t('iot.live.importDate')}
                          value={importDate}
                          onChange={e => setImportDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 200 }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={importing ? <CircularProgress size={14} /> : <ImportIcon fontSize="small" />}
                          onClick={handleImport}
                          disabled={importing}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          {importing ? t('iot.live.importing') : t('iot.live.importToLog')}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* ── Tab 1: Devices ──────────────────────────────────────────────────── */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            {t('iot.devices.addDevice')}
          </Button>
        </Box>

        {devices.length === 0 ? (
          <Card variant="outlined" sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc' }}>
            <SensorsIcon sx={{ fontSize: 56, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {t('iot.devices.noDevices')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('iot.devices.noDevicesHint')}
            </Typography>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {devices.map(device => (
              <Card key={device.id} variant="outlined">
                <CardContent sx={{ p: '16px 20px !important' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <DotIcon sx={{ fontSize: 10, color: device.status === 'inactive' ? '#9ca3af' : isOnline(device.lastSeen) ? '#22c55e' : '#f59e0b' }} />
                        <Typography variant="subtitle2" fontWeight={700}>{device.name}</Typography>
                        <Chip
                          label={device.status === 'active' ? t('iot.devices.active') : t('iot.devices.inactive')}
                          size="small"
                          color={device.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                        {device.isOutOfRange && (
                          <Chip label={t('iot.live.outOfRange')} size="small" color="error" />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {device.system?.name} › {device.monitoringPoint?.parameterObj?.name || device.monitoringPoint?.name}
                        {device.monitoringPoint?.unitObj?.abbreviation ? ` (${device.monitoringPoint.unitObj.abbreviation})` : ''}
                      </Typography>
                      {device.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {device.description}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {device.lastValue != null && (
                        <Typography variant="body2" fontWeight={600} sx={{ color: device.isOutOfRange ? '#dc2626' : '#16a34a' }}>
                          {parseFloat(String(device.lastValue))} {device.monitoringPoint?.unitObj?.abbreviation || ''}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {formatLastSeen(device.lastSeen, t('iot.live.never'))}
                      </Typography>

                      <Tooltip title={t('iot.devices.connectionGuide')}>
                        <IconButton size="small" onClick={() => { setGuideOpen(device); setGuideTokenVisible(false); }}>
                          <CodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={device.status === 'active' ? t('iot.devices.deactivate') : t('iot.devices.activate')}>
                        <IconButton size="small" onClick={() => handleToggleStatus(device)}>
                          {device.status === 'active' ? <DeactivateIcon fontSize="small" color="warning" /> : <ActivateIcon fontSize="small" color="success" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('iot.devices.delete')}>
                        <IconButton size="small" onClick={() => setDeleteConfirm(device)}>
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </TabPanel>

      {/* ── Add Device Dialog ──────────────────────────────────────────────── */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddError(''); }} maxWidth="sm" fullWidth>
        <DialogTitle>{t('iot.devices.addDevice')}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label={t('iot.devices.name')}
              value={newName}
              onChange={e => setNewName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              size="small"
              label={t('iot.devices.description')}
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
            <FormControl fullWidth size="small" required>
              <InputLabel>{t('iot.devices.system')}</InputLabel>
              <Select
                value={newSystemId}
                label={t('iot.devices.system')}
                onChange={e => setNewSystemId(e.target.value as number)}
              >
                <MenuItem value="">{t('iot.devices.selectSystem')}</MenuItem>
                {rootSystems.map(s => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" required disabled={!newSystemId || loadingMPs}>
              <InputLabel>{t('iot.devices.monitoringPoint')}</InputLabel>
              <Select
                value={newMpId}
                label={t('iot.devices.monitoringPoint')}
                onChange={e => setNewMpId(e.target.value as number)}
              >
                <MenuItem value="">
                  {loadingMPs ? t('iot.devices.loadingPoints') : t('iot.devices.selectMonitoringPoint')}
                </MenuItem>
                {availableMPs.map(mp => (
                  <MenuItem key={mp.id} value={mp.id}>
                    {mp.name}{mp.parameterObj ? ` (${mp.parameterObj.name})` : ''}{mp.unitObj ? ` [${mp.unitObj.abbreviation}]` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {addError && <Alert severity="error">{addError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddOpen(false); setAddError(''); }}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleAdd}>{t('common.create')}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Token reveal Dialog ────────────────────────────────────────────── */}
      <Dialog open={!!createdToken} maxWidth="sm" fullWidth>
        <DialogTitle>{t('iot.devices.token')}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>{t('iot.devices.tokenHint')}</Alert>
          <Box sx={{ bgcolor: '#f1f5f9', borderRadius: '6px', p: 2, fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all', mb: 1 }}>
            {createdToken?.token}
          </Box>
          <Button
            startIcon={copiedToken ? <CheckIcon color="success" /> : <CopyIcon />}
            onClick={() => handleCopyToken(createdToken?.token || '')}
            variant="outlined"
            size="small"
          >
            {copiedToken ? t('iot.devices.tokenCopied') : t('iot.devices.copyToken')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => { setCreatedToken(null); setCopiedToken(false); }}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('iot.devices.delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('iot.devices.deleteConfirm', { name: deleteConfirm?.name || '' })}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Connection Guide Dialog ────────────────────────────────────────── */}
      <Dialog open={!!guideOpen} onClose={() => setGuideOpen(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon color="primary" />
          {t('iot.devices.connectionGuide')} — {guideOpen?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>{t('iot.devices.connectionGuideText')}</Typography>

          <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
            {t('iot.devices.endpoint')}
          </Typography>
          <Box sx={{ bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: '6px', p: 1.5, fontFamily: 'monospace', fontSize: '0.8rem', mb: 2, mt: 0.5 }}>
            POST {apiBase}/api/iot/ingest
          </Box>

          <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
            {t('iot.devices.headers')}
          </Typography>
          <Box sx={{ bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: '6px', p: 1.5, fontFamily: 'monospace', fontSize: '0.8rem', mb: 2, mt: 0.5, whiteSpace: 'pre' }}>
            {`Content-Type: application/json\nX-Device-Token: `}
            {guideTokenVisible ? guideOpen?.token : '••••••••-••••-••••-••••-••••••••••••'}
          </Box>
          <Button size="small" variant="outlined" onClick={() => setGuideTokenVisible(v => !v)} sx={{ mb: 2 }}>
            {guideTokenVisible ? '🙈 Hide' : t('iot.devices.showToken')}
          </Button>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'text.secondary' }}>
            {t('iot.devices.body')}
          </Typography>
          <Box sx={{ bgcolor: '#0f172a', color: '#e2e8f0', borderRadius: '6px', p: 1.5, fontFamily: 'monospace', fontSize: '0.8rem', mb: 2, mt: 0.5, whiteSpace: 'pre' }}>
            {`{\n  "value": 1.20,\n  "recordedAt": "2026-03-13T14:30:00Z"  // optional\n}`}
          </Box>

          <Alert severity="info" sx={{ mt: 1 }}>
            Send readings at any interval. LINCE auto-detects out-of-range values and updates the live dashboard.
            Compatible with ESP32, Arduino, Raspberry Pi, HACH, Prominent, and any HTTP-capable device.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGuideOpen(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IoTPage;
