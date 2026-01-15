import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { Product, ProductType, ProductState, ProductUsage, CreateProductRequest, UpdateProductRequest, FetchProductsParams, ProductPagination } from '../../types';
import { setLoading } from './uiSlice';
import { fetchUnreadCount } from './notificationSlice';
import { getApiErrorMessage } from '../../utils/apiMessages';
import { updatePaginationAfterCreate, updatePaginationAfterDelete } from '../../utils/paginationHelpers';

interface RecordUsageRequest {
  systemId?: number;
  quantity: number;
  notes?: string;
  type?: 'in' | 'out';
  date?: string;
}

interface FetchProductsResponse {
  success: boolean;
  data: Product[];
  pagination: ProductPagination;
}

const initialState: ProductState = {
  products: [],
  productTypes: [],
  currentProduct: null,
  usages: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null
};

export const fetchProductTypes = createAsyncThunk(
  'products/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: ProductType[] }>('/products/types');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch product types'));
    }
  }
);

export const createProductType = createAsyncThunk(
  'products/createType',
  async (data: { name: string; description?: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: ProductType }>('/products/types', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create product type'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateProductType = createAsyncThunk(
  'products/updateType',
  async ({ id, data }: { id: number; data: { name?: string; description?: string } }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: ProductType }>(`/products/types/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update product type'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteProductType = createAsyncThunk(
  'products/deleteType',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/products/types/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete product type'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: FetchProductsParams = {}, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<FetchProductsResponse>('/products', { params });
      return {
        products: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch products'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: Product }>(`/products/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch product'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async (data: CreateProductRequest, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.post<{ success: boolean; data: Product }>('/products', data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create product'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, data }: { id: number; data: UpdateProductRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update product'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const recordProductUsage = createAsyncThunk(
  'products/recordUsage',
  async ({ id, data }: { id: number; data: RecordUsageRequest }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      // Default type to 'out' for recording usage (consumption)
      const requestData = { ...data, type: data.type || 'out' };
      const response = await axiosInstance.post<{ success: boolean; data: ProductUsage }>(`/products/${id}/usage`, requestData);

      // Refresh notification count (low stock may trigger notification)
      dispatch(fetchUnreadCount());

      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to record usage'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchProductUsageHistory = createAsyncThunk(
  'products/fetchUsageHistory',
  async ({ id, params }: { id: number; params?: { startDate?: string; endDate?: string } }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get<{ success: boolean; data: ProductUsage[] }>(`/products/${id}/usages`, { params });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch usage history'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, quantity, type, notes }: { id: number; quantity: number; type: 'add' | 'remove'; notes?: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.put<{ success: boolean; data: Product }>(`/products/${id}/stock`, { quantity, type, notes });
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update stock'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: number, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to delete product'));
    } finally {
      dispatch(setLoading(false));
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearUsages: (state) => {
      state.usages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductTypes.fulfilled, (state, action) => {
        state.productTypes = action.payload;
        state.error = null;
      })
      .addCase(createProductType.fulfilled, (state, action) => {
        state.productTypes.push(action.payload);
        state.error = null;
      })
      .addCase(updateProductType.fulfilled, (state, action) => {
        const index = state.productTypes.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.productTypes[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteProductType.fulfilled, (state, action) => {
        state.productTypes = state.productTypes.filter(t => t.id !== action.payload);
        state.error = null;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.pagination = updatePaginationAfterCreate(state.pagination);
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(recordProductUsage.fulfilled, (state, action) => {
        state.usages.unshift(action.payload);
        const usageType = action.payload.type;
        const quantity = parseFloat(action.payload.quantity.toString());

        // Update product stock in the products list
        const product = state.products.find(p => p.id === action.payload.productId);
        if (product) {
          if (usageType === 'in') {
            product.currentStock = parseFloat(product.currentStock.toString()) + quantity;
          } else {
            product.currentStock = parseFloat(product.currentStock.toString()) - quantity;
          }
        }

        // Update current product stock if viewing the same product
        if (state.currentProduct?.id === action.payload.productId) {
          if (usageType === 'in') {
            state.currentProduct.currentStock = parseFloat(state.currentProduct.currentStock.toString()) + quantity;
          } else {
            state.currentProduct.currentStock = parseFloat(state.currentProduct.currentStock.toString()) - quantity;
          }
        }
        state.error = null;
      })
      .addCase(fetchProductUsageHistory.fulfilled, (state, action) => {
        state.usages = action.payload;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?.id === action.payload.id) {
          state.currentProduct = action.payload;
        }
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.pagination = updatePaginationAfterDelete(state.pagination);
        state.error = null;
      });
  }
});

export const { clearError, clearCurrentProduct, clearUsages } = productSlice.actions;
export default productSlice.reducer;
