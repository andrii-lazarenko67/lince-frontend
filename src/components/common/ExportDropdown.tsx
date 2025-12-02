import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ExportDropdownProps {
  onExportPDF: () => void;
  onExportHTML: () => void;
  onExportCSV: () => void;
  disabled?: boolean;
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({
  onExportPDF,
  onExportHTML,
  onExportCSV,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (exportFn: () => void) => {
    exportFn();
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleClick}
        disabled={disabled}
        startIcon={<FileDownloadIcon />}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleExport(onExportPDF)}>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Export PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport(onExportHTML)}>
          <ListItemIcon>
            <CodeIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Export HTML</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport(onExportCSV)}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Export CSV</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportDropdown;
