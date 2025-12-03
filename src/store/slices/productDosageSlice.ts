import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type {
  ProductDosage,
  CreateProductDosageRequest,
  UpdateProductDosageRequest,
  ProductDosageState
} from '../../types/productDosage.types';

// Initial state with proper TypeScript types - EXACT MATCH
const initialState: ProductDosageState = {
  dosages: [],
  loading: false,
  error: null
};

// Async thunks - following RULE: all backend calls via Redux middleware

// Fetch all dosages with optional filters
export const fetchProductDosages = createAsyncThunk<
  ProductDosage[],
  { productId?: number; systemId?: number; startDate?: string; endDate?: string } | undefined
>(
  'productDosages/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.productId) params.append('productId', filters.productId.toString());
      if (filters.systemId) params.append('systemId', filters.systemId.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await axiosInstance.get(`/product-dosages?${params}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product dosages');
    }
  }
);

// Fetch dosages by product ID
export const fetchDosagesByProduct = createAsyncThunk<ProductDosage[], number>(
  'productDosages/fetchByProduct',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/product-dosages/product/${productId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch product dosages');
    }
  }
);

// Create product dosage
export const createProductDosage = createAsyncThunk<ProductDosage, CreateProductDosageRequest>(
  'productDosages/create',
  async (dosageData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/product-dosages', dosageData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product dosage');
    }
  }
);

// Update product dosage
export const updateProductDosage = createAsyncThunk<
  ProductDosage,
  { id: number; data: UpdateProductDosageRequest }
>(
  'productDosages/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/product-dosages/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product dosage');
    }
  }
);

// Delete product dosage
export const deleteProductDosage = createAsyncThunk<number, number>(
  'productDosages/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/product-dosages/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product dosage');
    }
  }
);

// Slice with reducers
const productDosageSlice = createSlice({
  name: 'productDosages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDosages: (state) => {
      state.dosages = [];
    }
  },
  extraReducers: (builder) => {
    // Fetch all dosages
    builder
      .addCase(fetchProductDosages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDosages.fulfilled, (state, action) => {
        state.loading = false;
        state.dosages = action.payload;
      })
      .addCase(fetchProductDosages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch dosages by product
    builder
      .addCase(fetchDosagesByProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDosagesByProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.dosages = action.payload;
      })
      .addCase(fetchDosagesByProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create dosage
    builder
      .addCase(createProductDosage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProductDosage.fulfilled, (state, action) => {
        state.loading = false;
        state.dosages.unshift(action.payload); // Add to beginning (most recent)
      })
      .addCase(createProductDosage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update dosage
    builder
      .addCase(updateProductDosage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProductDosage.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.dosages.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.dosages[index] = action.payload;
        }
      })
      .addCase(updateProductDosage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete dosage
    builder
      .addCase(deleteProductDosage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProductDosage.fulfilled, (state, action) => {
        state.loading = false;
        state.dosages = state.dosages.filter(d => d.id !== action.payload);
      })
      .addCase(deleteProductDosage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearDosages } = productDosageSlice.actions;
export default productDosageSlice.reducer;
