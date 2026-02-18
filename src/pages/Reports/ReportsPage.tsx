import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Tabs, Tab, Paper, IconButton, Tooltip } from '@mui/material';
import {
  Description as TemplateIcon,
  Add as GenerateIcon,
  History as HistoryIcon,
  HelpOutline
} from '@mui/icons-material';
import { useTour, useAutoStartTour, REPORTS_WORKFLOW_TOUR } from '../../tours';
import ReportTemplatesTab from './ReportTemplatesTab';
import ReportGeneratorTab from './ReportGeneratorTab';
import ReportHistoryTab from './ReportHistoryTab';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `reports-tab-${index}`,
    'aria-controls': `reports-tabpanel-${index}`,
  };
}

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(REPORTS_WORKFLOW_TOUR);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }} data-tour="reports-header">
          <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-500 mt-1">{t('reports.description')}</p>
        </Box>
        <Tooltip title={isCompleted(REPORTS_WORKFLOW_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(REPORTS_WORKFLOW_TOUR)}
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
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }} data-tour="reports-tabs">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="reports tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<GenerateIcon />}
            iconPosition="start"
            label={t('reports.tabs.generator')}
            {...a11yProps(0)}
          />
          <Tab
            icon={<TemplateIcon />}
            iconPosition="start"
            label={t('reports.tabs.templates')}
            {...a11yProps(1)}
          />
          <Tab
            icon={<HistoryIcon />}
            iconPosition="start"
            label={t('reports.tabs.history')}
            {...a11yProps(2)}
          />
        </Tabs>
      </Paper>

      <TabPanel value={activeTab} index={0}>
        <ReportGeneratorTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ReportTemplatesTab />
      </TabPanel>
      <TabPanel value={activeTab} index={2}>
        <ReportHistoryTab />
      </TabPanel>
    </Box>
  );
};

export default ReportsPage;
