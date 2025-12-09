import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { TableChart as TableChartIcon, BarChart as BarChartIcon } from '@mui/icons-material';

type ViewMode = 'table' | 'chart';

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  tableLabel?: string;
  chartLabel?: string;
  className?: string;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  value,
  onChange,
  tableLabel,
  chartLabel,
  className = 'w-100'
}) => {
  const { t } = useTranslation();
  const defaultTableLabel = tableLabel || t('common.viewMode.table');
  const defaultChartLabel = chartLabel || t('common.viewMode.charts');
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newMode) => newMode && onChange(newMode)}
      size="small"
      className={className}
      sx={{
        bgcolor: 'white',
        '& .MuiToggleButton-root': {
          px: 2,
          py: 1,
          width: '100%',
          textTransform: 'none',
          fontWeight: 500,
          border: '1px solid',
          borderColor: 'divider',
          color: 'text.secondary',
          '&:not(:first-of-type)': {
            borderLeft: '1px solid',
            borderLeftColor: 'divider',
            marginLeft: '-1px'
          },
          '&:hover': {
            bgcolor: 'action.hover',
            borderColor: 'divider'
          },
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
              borderColor: 'primary.dark'
            }
          }
        }
      }}
    >
      <ToggleButton value="table">
        <TableChartIcon sx={{ fontSize: 18, mr: 0.5 }} />
        {defaultTableLabel}
      </ToggleButton>
      <ToggleButton value="chart">
        <BarChartIcon sx={{ fontSize: 18, mr: 0.5 }} />
        {defaultChartLabel}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;
