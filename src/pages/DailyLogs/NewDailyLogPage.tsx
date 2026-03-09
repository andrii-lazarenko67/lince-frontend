import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { createDailyLog } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints } from '../../store/slices/monitoringPointSlice';
import { Card, Button, Select, Input, TextArea } from '../../components/common';
import type { RecordType, TimeMode } from '../../types';
import { useTour, useAutoStartTour, DAILY_LOGS_NEW_TOUR } from '../../tours';
import { HelpOutline, AutoAwesome, CheckCircle, UploadFile } from '@mui/icons-material';
import { IconButton, Tooltip, CircularProgress, Chip } from '@mui/material';
import axiosInstance from '../../api/axiosInstance';

interface EntryValue {
  monitoringPointId: number;
  value: string;
  notes: string;
}

const NewDailyLogPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { loading } = useAppSelector((state) => state.ui);
  const { goBack, goToDailyLogs } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(DAILY_LOGS_NEW_TOUR);

  const [recordType, setRecordType] = useState<RecordType>('field');
  const [formData, setFormData] = useState({
    systemId: '',
    stageId: '',
    date: new Date().toISOString().split('T')[0],
    period: '',
    time: '',
    timeMode: 'manual' as TimeMode,
    timeEnabled: false,
    laboratory: '',
    collectionDate: new Date().toISOString().split('T')[0],
    collectionTime: '',
    collectionTimeMode: 'manual' as TimeMode,
    collectionTimeEnabled: false,
    notes: '',
    sendNotification: false
  });
  const [entries, setEntries] = useState<EntryValue[]>([]);
  const [availableStages, setAvailableStages] = useState<Array<{ value: number; label: string }>>([]);

  // AI lab report extraction
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ found: string[]; notFound: string[] } | null>(null);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  // Filter stages (child systems) when a system is selected
  useEffect(() => {
    if (formData.systemId && systems.length > 0) {
      const selectedSystemId = Number(formData.systemId);
      const childSystems = systems.filter(s => s.parentId === selectedSystemId);
      setAvailableStages(childSystems.map(s => ({ value: s.id, label: s.name })));

      // Reset stage selection when system changes
      setFormData(prev => ({ ...prev, stageId: '' }));

      // Fetch monitoring points for the selected system (or stage if selected)
      dispatch(fetchMonitoringPoints({ systemId: selectedSystemId }));
    } else {
      setAvailableStages([]);
    }
  }, [formData.systemId, systems, dispatch]);

  // Fetch monitoring points when stage changes
  useEffect(() => {
    if (formData.stageId) {
      dispatch(fetchMonitoringPoints({ systemId: Number(formData.stageId) }));
    } else if (formData.systemId) {
      dispatch(fetchMonitoringPoints({ systemId: Number(formData.systemId) }));
    }
  }, [formData.stageId, formData.systemId, dispatch]);

  useEffect(() => {
    if (monitoringPoints.length > 0) {
      setEntries(monitoringPoints.map(mp => ({
        monitoringPointId: mp.id,
        value: '',
        notes: ''
      })));
    } else {
      setEntries([]);
    }
  }, [monitoringPoints]);

  // Auto-fill time when time mode is 'auto'
  useEffect(() => {
    if (formData.timeEnabled && formData.timeMode === 'auto') {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFormData(prev => ({ ...prev, time: `${hours}:${minutes}` }));
    }
  }, [formData.timeMode, formData.timeEnabled]);

  // Auto-fill collection time when collection time mode is 'auto'
  useEffect(() => {
    if (formData.collectionTimeEnabled && formData.collectionTimeMode === 'auto') {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setFormData(prev => ({ ...prev, collectionTime: `${hours}:${minutes}` }));
    }
  }, [formData.collectionTimeMode, formData.collectionTimeEnabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEntryChange = (index: number, field: 'value' | 'notes', value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const handleAiExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (monitoringPoints.length === 0) {
      setAiError(t('dailyLogs.new.ai.noMonitoringPoints'));
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    setAiError('');
    try {
      const formPayload = new FormData();
      formPayload.append('file', file);
      formPayload.append('monitoringPoints', JSON.stringify(
        monitoringPoints.map(mp => ({
          id: mp.id,
          parameterName: mp.parameterObj?.name || mp.name,
          name: mp.name,
          unit: mp.unitObj?.abbreviation || ''
        }))
      ));
      formPayload.append('language', i18n.language?.startsWith('pt') ? 'pt' : 'en');

      const response = await axiosInstance.post('/ai/extract-lab-report', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const { values, found, notFound } = response.data;
      // Auto-fill entries with extracted values
      setEntries(prev => prev.map(entry => {
        const extracted = values[String(entry.monitoringPointId)];
        if (extracted !== undefined && extracted !== null) {
          return { ...entry, value: String(extracted) };
        }
        return entry;
      }));
      setAiResult({ found: found || [], notFound: notFound || [] });
    } catch (err: unknown) {
      setAiError(t('dailyLogs.new.ai.error'));
    } finally {
      setAiLoading(false);
      // Reset file input so same file can be re-uploaded if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.systemId) {
      alert(t('dailyLogs.new.selectSystem'));
      return;
    }

    if (recordType === 'laboratory' && !formData.laboratory) {
      alert(t('dailyLogs.new.enterLaboratory'));
      return;
    }

    const validEntries = entries.filter(e => e.value !== '').map(e => ({
      monitoringPointId: e.monitoringPointId,
      value: parseFloat(e.value),
      notes: e.notes || undefined
    }));

    if (validEntries.length === 0) {
      alert(t('dailyLogs.new.enterOneValue'));
      return;
    }

    const result = await dispatch(createDailyLog({
      systemId: Number(formData.systemId),
      stageId: formData.stageId ? Number(formData.stageId) : undefined,
      recordType,
      date: formData.date,
      period: formData.period || undefined,
      time: formData.timeEnabled ? formData.time : undefined,
      timeMode: formData.timeEnabled ? formData.timeMode : undefined,
      laboratory: recordType === 'laboratory' ? formData.laboratory : undefined,
      collectionDate: recordType === 'laboratory' ? formData.collectionDate : undefined,
      collectionTime: recordType === 'laboratory' && formData.collectionTimeEnabled ? formData.collectionTime : undefined,
      collectionTimeMode: recordType === 'laboratory' && formData.collectionTimeEnabled ? formData.collectionTimeMode : undefined,
      notes: formData.notes || undefined,
      entries: validEntries,
      sendNotification: formData.sendNotification
    }));

    if (createDailyLog.fulfilled.match(result)) {
      goToDailyLogs();
    }
  };

  const systemOptions = systems.filter(s => !s.parentId).map(s => ({ value: s.id, label: s.name }));
  const recordTypeOptions = [
    { value: 'field', label: t('dailyLogs.new.fieldRecord') },
    { value: 'laboratory', label: t('dailyLogs.new.laboratoryRecord') }
  ];
  const timeModeOptions = [
    { value: 'manual', label: t('dailyLogs.new.manual') },
    { value: 'auto', label: t('dailyLogs.new.automatic') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1" data-tour="new-log-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('dailyLogs.new.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dailyLogs.new.description', { type: recordType === 'field' ? t('dailyLogs.new.fieldAnalyses') : t('dailyLogs.new.laboratoryAnalyses') })}</p>
        </div>
        <Tooltip title={isCompleted(DAILY_LOGS_NEW_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(DAILY_LOGS_NEW_TOUR)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex justify-end space-x-3 mb-6" data-tour="action-buttons">
          <Button type="button" variant="danger" onClick={goBack} disabled={loading}>
            {t('dailyLogs.new.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('dailyLogs.new.saving') : t('dailyLogs.new.saveRecord')}
          </Button>
        </div>

        {/* Record Type Selection */}
        <div data-tour="record-type">
          <Card title={t('dailyLogs.new.recordType')}>
            <div className="flex flex-col gap-6">
              <Select
                name="recordType"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as RecordType)}
                options={recordTypeOptions}
                label={t('dailyLogs.new.recordType')}
                required
              />
              <p className="text-sm text-gray-600">
                {recordType === 'field'
                  ? t('dailyLogs.new.fieldRecordInfo')
                  : t('dailyLogs.new.laboratoryRecordInfo')}
              </p>

              {/* AI Lab Report Extraction */}
              <div className="border border-blue-100 bg-blue-50 rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AutoAwesome sx={{ fontSize: 18, color: '#3b82f6' }} />
                    <span className="text-sm font-medium text-blue-700">{t('dailyLogs.new.ai.title')}</span>
                  </div>
                  <Tooltip title={t('dailyLogs.new.ai.uploadTooltip')}>
                    <span>
                      <button
                        type="button"
                        disabled={aiLoading || monitoringPoints.length === 0}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-semibold rounded transition-colors"
                      >
                        {aiLoading
                          ? <CircularProgress size={12} sx={{ color: 'white' }} />
                          : <UploadFile sx={{ fontSize: 14 }} />
                        }
                        {aiLoading ? t('dailyLogs.new.ai.analyzing') : t('dailyLogs.new.ai.uploadButton')}
                      </button>
                    </span>
                  </Tooltip>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleAiExtract}
                  />
                </div>
                <p className="text-xs text-blue-600">{t('dailyLogs.new.ai.description')}</p>

                {aiError && (
                  <p className="mt-2 text-xs text-red-600">{aiError}</p>
                )}

                {aiResult && (
                  <div className="mt-3 flex flex-col gap-2">
                    {aiResult.found.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <CheckCircle sx={{ fontSize: 14, color: '#10b981' }} />
                        <span className="text-xs text-gray-600 mr-1">{t('dailyLogs.new.ai.found')}:</span>
                        {aiResult.found.map((name) => (
                          <Chip key={name} label={name} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#d1fae5', color: '#065f46' }} />
                        ))}
                      </div>
                    )}
                    {aiResult.notFound.length > 0 && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-xs text-gray-400 mr-1">{t('dailyLogs.new.ai.notFound')}:</span>
                        {aiResult.notFound.map((name) => (
                          <Chip key={name} label={name} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#f3f4f6', color: '#6b7280' }} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Record Information */}
        <div data-tour="system-selection">
          <Card title={t('dailyLogs.new.recordInformation')} className="mt-6">
            <div className="flex flex-col gap-6">
              {/* System Selection */}
              <Select
                name="systemId"
                value={formData.systemId}
                onChange={handleChange}
                options={systemOptions}
                label={t('dailyLogs.new.system')}
                placeholder={t('dailyLogs.new.selectSystem')}
                required
              />

              {/* Stage Selection (only if stages available) */}
              {availableStages.length > 0 && (
                <Select
                  name="stageId"
                  value={formData.stageId}
                  onChange={handleChange}
                  options={availableStages}
                  label={t('dailyLogs.new.stage')}
                  placeholder={t('dailyLogs.new.stageOptional')}
                />
              )}

              {/* Date and Period */}
              <div data-tour="date-period">
                <div className="flex flex-col gap-6">
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    label={recordType === 'field' ? t('dailyLogs.new.date') : t('dailyLogs.new.recordDate')}
                    required
                  />

                  <Input
                    type="text"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    label={t('dailyLogs.new.period')}
                    placeholder={t('dailyLogs.new.periodPlaceholder')}
                  />
                </div>
              </div>

            {/* Time (Optional) */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="timeEnabled"
                  checked={formData.timeEnabled}
                  onChange={(e) => setFormData({ ...formData, timeEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="timeEnabled" className="ml-2 block text-sm text-gray-700">
                  {t('dailyLogs.new.recordTime')}
                </label>
              </div>
              {formData.timeEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    name="timeMode"
                    value={formData.timeMode}
                    onChange={handleChange}
                    options={timeModeOptions}
                    label={t('dailyLogs.new.timeMode')}
                  />
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    label={t('dailyLogs.new.time')}
                    disabled={formData.timeMode === 'auto'}
                  />
                </div>
              )}
            </div>

            {/* Laboratory-specific fields */}
            {recordType === 'laboratory' && (
              <>
                <Input
                  type="text"
                  name="laboratory"
                  value={formData.laboratory}
                  onChange={handleChange}
                  label={t('dailyLogs.new.laboratory')}
                  placeholder={t('dailyLogs.new.laboratoryPlaceholder')}
                  required
                />

                <Input
                  type="date"
                  name="collectionDate"
                  value={formData.collectionDate}
                  onChange={handleChange}
                  label={t('dailyLogs.new.collectionDate')}
                  required
                />

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="collectionTimeEnabled"
                      checked={formData.collectionTimeEnabled}
                      onChange={(e) => setFormData({ ...formData, collectionTimeEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="collectionTimeEnabled" className="ml-2 block text-sm text-gray-700">
                      {t('dailyLogs.new.recordCollectionTime')}
                    </label>
                  </div>
                  {formData.collectionTimeEnabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        name="collectionTimeMode"
                        value={formData.collectionTimeMode}
                        onChange={handleChange}
                        options={timeModeOptions}
                        label={t('dailyLogs.new.collectionTimeMode')}
                      />
                      <Input
                        type="time"
                        name="collectionTime"
                        value={formData.collectionTime}
                        onChange={handleChange}
                        label={t('dailyLogs.new.collectionTime')}
                        disabled={formData.collectionTimeMode === 'auto'}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            <TextArea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              label={t('dailyLogs.new.generalNotes')}
              placeholder={t('dailyLogs.new.generalNotesPlaceholder')}
              rows={3}
            />

            {/* Send Notification Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="sendNotification"
                name="sendNotification"
                checked={formData.sendNotification}
                onChange={(e) => setFormData({ ...formData, sendNotification: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendNotification" className="ml-2 block text-sm text-gray-700">
                {t('dailyLogs.new.sendNotification')}
              </label>
            </div>
          </div>
        </Card>
        </div>

        {/* Monitoring Values */}
        {monitoringPoints.length > 0 && (
          <div data-tour="monitoring-values">
            <Card title={t('dailyLogs.new.monitoringValues')} className="mt-6">
              <div className="space-y-4">
                {monitoringPoints.map((mp, index) => (
                  <div key={mp.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">{mp.name}</p>
                      <p className="text-xs text-gray-500">
                        {mp.parameterObj?.name || '-'}
                        {mp.unitObj ? ` (${mp.unitObj.abbreviation})` : ` (${t('dailyLogs.new.na')})`}
                        {' | '}
                        {mp.minValue !== null && mp.maxValue !== null ? (
                          <span>{t('dailyLogs.new.range')}: {mp.minValue} - {mp.maxValue}</span>
                        ) : (
                          <span className="text-gray-400">{t('dailyLogs.new.range')}: {t('dailyLogs.new.na')}</span>
                        )}
                      </p>
                    </div>

                    <Input
                      type="number"
                      name={`value-${mp.id}`}
                      value={entries[index]?.value || ''}
                      onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                      placeholder={t('dailyLogs.new.enterValue', { name: mp.parameterObj?.name || t('dailyLogs.new.value') })}
                      step="0.01"
                    />

                    <Input
                      type="text"
                      name={`notes-${mp.id}`}
                      value={entries[index]?.notes || ''}
                      onChange={(e) => handleEntryChange(index, 'notes', e.target.value)}
                      placeholder={t('dailyLogs.new.notesOptional')}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {formData.systemId && monitoringPoints.length === 0 && (
          <Card className="mt-6">
            <p className="text-gray-500 text-center py-8">
              {t('dailyLogs.new.noMonitoringPoints', { type: formData.stageId ? t('dailyLogs.new.stageType') : t('dailyLogs.new.systemType') })}
            </p>
          </Card>
        )}

        {/* Bottom action buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="danger" onClick={goBack} disabled={loading}>
            {t('dailyLogs.new.cancel')}
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('dailyLogs.new.saving') : t('dailyLogs.new.saveRecord')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewDailyLogPage;
