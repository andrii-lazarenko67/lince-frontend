export type SubscriptionPlan = 'starter' | 'pro' | 'enterprise' | 'none';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'none';
export type InvoiceStatus = 'paid' | 'open' | 'void' | 'uncollectible';

export interface BillingStatus {
  plan: SubscriptionPlan;
  planName: string;
  status: SubscriptionStatus;
  hasAccess: boolean;
  isTrialing: boolean;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  isOwner: boolean;
}

export interface Invoice {
  id: number;
  clientId: number;
  stripeInvoiceId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  plan: SubscriptionPlan;
  pdfUrl: string | null;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  createdAt: string;
}

export interface AdminClientBilling {
  id: number;
  name: string;
  email: string;
  plan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
}

export interface BillingState {
  status: BillingStatus | null;
  invoices: Invoice[];
  adminClients: AdminClientBilling[];
  checkoutUrl: string | null;
  portalUrl: string | null;
  loading: boolean;
  error: string | null;
}
