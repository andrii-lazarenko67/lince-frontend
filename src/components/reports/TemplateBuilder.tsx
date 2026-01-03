import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchReportTemplates,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
  setDefaultTemplate
} from '../../store/slices/reportTemplateSlice';
import type { ReportTemplate, ReportModuleConfig, ReportTemplateConfig, ReportModuleId } from '../../types';
import { DEFAULT_TEMPLATE_CONFIG } from '../../types/reportTemplate.types';

interface TemplateBuilderProps {
  onSelectTemplate?: (template: ReportTemplate | null) => void;
  showSelector?: boolean;
}

const MODULE_ICONS: Record<ReportModuleId, string> = {
  systems: '🏭',
  dailyLogs: '📋',
  inspections: '🔍',
  incidents: '⚠️',
  products: '📦'
};

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ onSelectTemplate, showSelector = true }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { templates, loading } = useAppSelector((state) => state.reportTemplates);

  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ReportTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false
  });
  const [moduleConfig, setModuleConfig] = useState<ReportModuleConfig[]>(DEFAULT_TEMPLATE_CONFIG.modules);

  useEffect(() => {
    dispatch(fetchReportTemplates());
  }, [dispatch]);

  useEffect(() => {
    // Auto-select default template
    const defaultTemplate = templates.find(t => t.isDefault);
    if (defaultTemplate && !selectedTemplateId) {
      setSelectedTemplateId(defaultTemplate.id);
      onSelectTemplate?.(defaultTemplate);
    }
  }, [templates, selectedTemplateId, onSelectTemplate]);

  const handleOpenModal = (template?: ReportTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || '',
        isDefault: template.isDefault
      });
      setModuleConfig(template.config.modules);
    } else {
      setEditingTemplate(null);
      setFormData({ name: '', description: '', isDefault: false });
      setModuleConfig(DEFAULT_TEMPLATE_CONFIG.modules);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const handleModuleToggle = (moduleId: ReportModuleId) => {
    setModuleConfig(prev => prev.map(m =>
      m.id === moduleId ? { ...m, enabled: !m.enabled } : m
    ));
  };

  const handleMoveModule = (moduleId: ReportModuleId, direction: 'up' | 'down') => {
    const currentIndex = moduleConfig.findIndex(m => m.id === moduleId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= moduleConfig.length) return;

    const newConfig = [...moduleConfig];
    [newConfig[currentIndex], newConfig[newIndex]] = [newConfig[newIndex], newConfig[currentIndex]];

    // Update order values
    newConfig.forEach((m, idx) => {
      m.order = idx + 1;
    });

    setModuleConfig(newConfig);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const config: ReportTemplateConfig = {
      modules: moduleConfig,
      settings: {
        showSummary: true,
        showCharts: true
      }
    };

    if (editingTemplate) {
      await dispatch(updateReportTemplate({
        id: editingTemplate.id,
        data: { ...formData, config }
      }));
    } else {
      await dispatch(createReportTemplate({ ...formData, config }));
    }
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await dispatch(deleteReportTemplate(deleteConfirm.id));
      setDeleteConfirm(null);
      if (selectedTemplateId === deleteConfirm.id) {
        setSelectedTemplateId(null);
        onSelectTemplate?.(null);
      }
    }
  };

  const handleSetDefault = async (template: ReportTemplate) => {
    await dispatch(setDefaultTemplate(template.id));
  };

  const handleSelectTemplate = (templateId: number | null) => {
    setSelectedTemplateId(templateId);
    const template = templateId ? templates.find(t => t.id === templateId) : null;
    onSelectTemplate?.(template || null);
  };

  return (
    <div className="space-y-4">
      {/* Template Selector */}
      {showSelector && (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('templates.selectTemplate')}
            </label>
            <select
              value={selectedTemplateId || ''}
              onChange={(e) => handleSelectTemplate(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('templates.selectTemplate')}...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} {template.isDefault ? `(${t('templates.defaultTemplate')})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-6"
          >
            {t('templates.createTemplate')}
          </button>
        </div>
      )}

      {/* Template List */}
      {templates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-medium text-gray-700">{t('templates.manageTemplates')}</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {templates.map((template) => (
              <li key={template.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      {template.isDefault && (
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {t('templates.defaultTemplate')}
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500">{template.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {template.config.modules
                        .filter(m => m.enabled)
                        .sort((a, b) => a.order - b.order)
                        .map(m => (
                          <span key={m.id} className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {MODULE_ICONS[m.id]} {t(`templates.modules.${m.id}`)}
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!template.isDefault && (
                    <button
                      onClick={() => handleSetDefault(template)}
                      className="text-sm text-gray-600 hover:text-blue-600"
                    >
                      {t('templates.setAsDefault')}
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal(template)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {t('common.edit')}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(template)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {templates.length === 0 && !loading && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('templates.noTemplates')}</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('templates.createTemplate')}
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseModal}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingTemplate ? t('templates.editTemplate') : t('templates.createTemplate')}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('templates.templateName')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('templates.templateNamePlaceholder')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('templates.templateDescription')}
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={t('templates.templateDescriptionPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('templates.selectModules')}
                  </label>
                  <div className="space-y-2">
                    {moduleConfig
                      .sort((a, b) => a.order - b.order)
                      .map((module, index) => (
                        <div
                          key={module.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            module.enabled ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={module.enabled}
                              onChange={() => handleModuleToggle(module.id)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-lg">{MODULE_ICONS[module.id]}</span>
                            <span className={module.enabled ? 'text-gray-900' : 'text-gray-500'}>
                              {t(`templates.modules.${module.id}`)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveModule(module.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveModule(module.id, 'down')}
                              disabled={index === moduleConfig.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{t('templates.dragToReorder')}</p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    {t('templates.setAsDefault')}
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('templates.saveTemplate')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-semibold mb-2">{t('templates.deleteTemplate')}</h3>
              <p className="text-gray-600 mb-4">
                {t('common.deleteConfirm', { name: deleteConfirm.name })}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;
