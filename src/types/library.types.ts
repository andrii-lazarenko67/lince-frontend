import type { User } from './auth.types';
import type { System } from './system.types';

export interface Document {
  id: number;
  title: string;
  description: string | null;
  category: string;
  systemId: number | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  publicId: string | null;
  uploadedBy: number;
  version: number;
  isActive: boolean;
  system?: System;
  uploader?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
  description?: string;
  category: string;
  systemId?: number;
  file: File;
}

export interface UpdateDocumentRequest {
  title?: string;
  description?: string;
  category?: string;
  systemId?: number;
  fileName?: string;
}

export interface FetchDocumentsParams {
  page?: number;
  limit?: number;
  category?: string;
  systemId?: number;
  search?: string;
}

export interface LibraryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LibraryState {
  documents: Document[];
  currentDocument: Document | null;
  pagination: LibraryPagination;
  loading: boolean;
  error: string | null;
}
