import React from 'react';
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
  tableLabel = 'Table',
  chartLabel = 'Charts',
  className = ''
}) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, newMode) => newMode && onChange(newMode)}
      size="small"
      className={className}
      sx={{
        bgcolor: 'background.paper',
        '& .MuiToggleButton-root': {
          px: 2,
          py: 1,
          textTransform: 'none',
          fontWeight: 500,
          border: 'none',
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }
        }
      }}
    >
      <ToggleButton value="table">
        <TableChartIcon sx={{ fontSize: 18, mr: 0.5 }} />
        {tableLabel}
      </ToggleButton>
      <ToggleButton value="chart">
        <BarChartIcon sx={{ fontSize: 18, mr: 0.5 }} />
        {chartLabel}
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;
