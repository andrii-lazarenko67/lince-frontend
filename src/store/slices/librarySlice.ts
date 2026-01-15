import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Document, LibraryState, CreateDocumentRequest, UpdateDocumentRequest, FetchDocumentsParams, LibraryPagination } from '../../types';
import { setLoading } from './uiSlice';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface FetchDocumentsResponse {
  success: boolean;
  data: Document[];
  pagination: LibraryPagination;
}

const initialState: LibraryState = {
  documents: [],
  currentDocument: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchDocuments = createAsyncThunk(
  'library/fetchAll',
  async (params: FetchDocumentsParams = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<FetchDocumentsResponse>('/library', { params });
      return {
        documents: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch documents');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'library/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Document }>(`/library/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'library/upload',
  async (data: CreateDocumentRequest & { file: File }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('file', data.file);
      if (data.category) formData.append('category', data.category);
      if (data.description) formData.append('description', data.description);
      if (data.systemId) formData.append('systemId', data.systemId.toString());

      const response = await axiosInstance.post<{ success: boolean; data: Document }>('/library', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to upload document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateDocument = createAsyncThunk(
  'library/update',
  async ({ id, data }: { id: number; data: UpdateDocumentRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Document }>(`/library/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to update document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const uploadNewVersion = createAsyncThunk(
  'library/uploadVersion',
  async ({ id, file }: { id: number; file: File }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post<{ success: boolean; data: Document }>(`/library/${id}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to upload new version');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'library/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/library/${id}`);
      return id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to delete document');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'library/search',
  async (query: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Document[] }>('/library/search', { params: { q: query } });
      return response.data.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Failed to search documents');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload.documents;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
        state.pagination = updatePaginationAfterCreate(state.pagination);
        state.error = null;
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        state.error = null;
      })
      .addCase(uploadNewVersion.fulfilled, (state, action) => {
        const index = state.documents.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(d => d.id !== action.payload);
        state.pagination = updatePaginationAfterDelete(state.pagination);
        state.error = null;
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.documents = action.payload;
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentDocument } = librarySlice.actions;
export default librarySlice.reducer;
