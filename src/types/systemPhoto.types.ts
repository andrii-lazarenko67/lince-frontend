import type { System } from './system.types';
import type { User } from './auth.types';

// EXACT MATCH to backend SystemPhoto model
export interface SystemPhoto {
  id: number;
  systemId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  description: string | null;
  uploadedBy: number;
  createdAt: string;
  updatedAt: string;
  // Associated objects (populated by backend)
  system?: System;
  uploader?: User;
}

export interface UploadSystemPhotoRequest {
  systemId: number;
  photo: File;
  description?: string;
}

export interface UpdateSystemPhotoRequest {
  description?: string;
}

export interface SystemPhotoState {
  photos: SystemPhoto[];
  loading: boolean;
  error: string | null;
}
