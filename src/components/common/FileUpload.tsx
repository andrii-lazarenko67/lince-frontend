import React, { useRef } from 'react';

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
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          Click to upload or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {multiple ? 'Multiple files allowed' : 'Single file'} - Max {maxSize / (1024 * 1024)}MB
        </p>
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;
