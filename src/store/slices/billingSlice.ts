import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import type { BillingState, BillingStatus, Invoice, AdminClientBilling } from '../../types';
import { getApiErrorMessage } from '../../utils/apiMessages';

const initialState: BillingState = {
  status: null,
  invoices: [],
  adminClients: [],
  checkoutUrl: null,
  portalUrl: null,
  loading: false,
  error: null
};

export const fetchBillingStatus = createAsyncThunk(
  'billing/fetchStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: BillingStatus }>('/billing/status');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch billing status'));
    }
  }
);

export const fetchInvoices = createAsyncThunk(
  'billing/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: Invoice[] }>('/billing/invoices');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch invoices'));
    }
  }
);

// Sync invoices from Stripe then return the updated list.
// Use this instead of fetchInvoices when a Stripe event (checkout, plan change)
// may have created invoices that webhooks haven't delivered yet.
export const syncAndFetchInvoices = createAsyncThunk(
  'billing/syncAndFetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ success: boolean; data: Invoice[] }>('/billing/sync-invoices');
      return response.data.data;
    } catch (error: unknown) {
      // Fallback to regular fetch if sync endpoint fails
      try {
        const fallback = await axiosInstance.get<{ success: boolean; data: Invoice[] }>('/billing/invoices');
        return fallback.data.data;
      } catch {
        return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch invoices'));
      }
    }
  }
);

export const changePlan = createAsyncThunk(
  'billing/changePlan',
  async (plan: 'starter' | 'pro', { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/billing/change-plan', { plan });
      // Backend already synced invoices from Stripe; refresh both status and invoices
      dispatch(fetchBillingStatus());
      dispatch(syncAndFetchInvoices());
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to change plan'));
    }
  }
);

export const syncFromSession = createAsyncThunk(
  'billing/syncFromSession',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/billing/sync-session', { sessionId });
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to sync session'));
    }
  }
);

export const createCheckoutSession = createAsyncThunk(
  'billing/createCheckout',
  async (plan: 'starter' | 'pro', { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ success: boolean; data: { url: string; sessionId: string } }>(
        '/billing/create-checkout',
        { plan }
      );
      return response.data.data.url;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to create checkout session'));
    }
  }
);

export const createPortalSession = createAsyncThunk(
  'billing/createPortal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post<{ success: boolean; data: { url: string } }>('/billing/portal');
      return response.data.data.url;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to open billing portal'));
    }
  }
);

export const fetchAdminBillingList = createAsyncThunk(
  'billing/fetchAdminList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get<{ success: boolean; data: AdminClientBilling[] }>('/billing/admin');
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to fetch admin billing list'));
    }
  }
);

export const adminUpdateBilling = createAsyncThunk(
  'billing/adminUpdate',
  async (
    { clientId, plan, subscriptionStatus }: { clientId: number; plan?: string; subscriptionStatus?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.put<{ success: boolean; data: AdminClientBilling }>(
        `/billing/admin/${clientId}`,
        { plan, subscriptionStatus }
      );
      return response.data.data;
    } catch (error: unknown) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update billing'));
    }
  }
);

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {
    clearBillingError: (state) => {
      state.error = null;
    },
    clearCheckoutUrl: (state) => {
      state.checkoutUrl = null;
    },
    clearPortalUrl: (state) => {
      state.portalUrl = null;
    }
  },
  extraReducers: (builder) => {
    // fetchBillingStatus
    builder
      .addCase(fetchBillingStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingStatus.fulfilled, (state, action) => {
        state.status = action.payload;
        state.loading = false;
      })
      .addCase(fetchBillingStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchInvoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
        state.loading = false;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createCheckoutSession
    builder
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.checkoutUrl = action.payload;
        state.loading = false;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createPortalSession
    builder
      .addCase(createPortalSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPortalSession.fulfilled, (state, action) => {
        state.portalUrl = action.payload;
        state.loading = false;
      })
      .addCase(createPortalSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchAdminBillingList
    builder
      .addCase(fetchAdminBillingList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminBillingList.fulfilled, (state, action) => {
        state.adminClients = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminBillingList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // adminUpdateBilling
    builder
      .addCase(adminUpdateBilling.fulfilled, (state, action) => {
        const idx = state.adminClients.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.adminClients[idx] = action.payload;
      })
      .addCase(adminUpdateBilling.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // syncAndFetchInvoices — same shape as fetchInvoices
    builder
      .addCase(syncAndFetchInvoices.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncAndFetchInvoices.fulfilled, (state, action) => {
        state.invoices = action.payload;
        state.loading = false;
      })
      .addCase(syncAndFetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // changePlan
    builder
      .addCase(changePlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePlan.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearBillingError, clearCheckoutUrl, clearPortalUrl } = billingSlice.actions;
export default billingSlice.reducer;
