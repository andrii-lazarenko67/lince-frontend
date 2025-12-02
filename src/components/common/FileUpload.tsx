import React, { useRef } from 'react';
import { Box, Typography, FormHelperText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface FileUploadProps {
  name: string;
  label?: string;
  accept?: string;
  multiple?: boolean;
  onChange: (files: File[]) => void;
  error?: string;
  className?: string;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  name,
  label,
  accept = '*',
  multiple = false,
  onChange,
  error,
  className = '',
  maxSize = 10 * 1024 * 1024
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      alert(`Some files exceed the maximum size of ${maxSize / (1024 * 1024)}MB`);
    }

    onChange(validFiles);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => file.size <= maxSize);

    if (validFiles.length !== files.length) {
      alert(`Some files exceed the maximum size of ${maxSize / (1024 * 1024)}MB`);
    }

    onChange(validFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Box className={className} mb={2}>
      {label && (
        <Typography variant="body2" fontWeight="medium" color="text.secondary" mb={1}>
          {label}
        </Typography>
      )}
      <Box
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: error ? 'error.main' : 'grey.300',
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.3s',
          '&:hover': {
            borderColor: 'primary.main'
          }
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Click to upload or drag and drop
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {multiple ? 'Multiple files allowed' : 'Single file'} - Max {maxSize / (1024 * 1024)}MB
        </Typography>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Box>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
};

export default FileUpload;
