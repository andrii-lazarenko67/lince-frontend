import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../hooks';
import ParametersSection from './ParametersSection';
import UnitsSection from './UnitsSection';
import SystemTypesSection from './SystemTypesSection';
import ProductTypesSection from './ProductTypesSection';
import ClientsSection from './ClientsSection';
import { useTour, useAutoStartTour, SETTINGS_OVERVIEW_TOUR } from '../../tours';
import { IconButton, Tooltip } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';

type TabType = 'parameters' | 'units' | 'systemTypes' | 'productTypes' | 'clients';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const isServiceProvider = user?.isServiceProvider;
  const [activeTab, setActiveTab] = useState<TabType>('parameters');

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(SETTINGS_OVERVIEW_TOUR);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div data-tour="settings-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-500 mt-1">{t('settings.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title={isCompleted(SETTINGS_OVERVIEW_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
            <IconButton
              onClick={() => startTour(SETTINGS_OVERVIEW_TOUR)}
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
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200" data-tour="settings-tabs">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`${
              activeTab === 'parameters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.tabs.parameters')}
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`${
              activeTab === 'units'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.tabs.units')}
          </button>
          <button
            onClick={() => setActiveTab('systemTypes')}
            className={`${
              activeTab === 'systemTypes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.tabs.systemTypes')}
          </button>
          <button
            onClick={() => setActiveTab('productTypes')}
            className={`${
              activeTab === 'productTypes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('settings.tabs.productTypes')}
          </button>
          {isServiceProvider && (
            <button
              onClick={() => setActiveTab('clients')}
              className={`${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {t('settings.tabs.clients')}
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'parameters' && <ParametersSection />}
      {activeTab === 'units' && <UnitsSection />}
      {activeTab === 'systemTypes' && <SystemTypesSection />}
      {activeTab === 'productTypes' && <ProductTypesSection />}
      {activeTab === 'clients' && <ClientsSection />}
    </div>
  );
};

export default SettingsPage;
