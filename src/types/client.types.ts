export interface Client {
  id: number;
  organizationId: number;
  name: string;
  address: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: number;
    name: string;
    isServiceProvider: boolean;
  };
  systems?: {
    id: number;
    name: string;
    status: string;
  }[];
}

export interface CreateClientRequest {
  name: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
}

export interface UpdateClientRequest {
  name?: string;
  address?: string;
  contact?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  selectedClientId: number | null;
  loading: boolean;
  error: string | null;
}

export interface Organization {
  id: number;
  name: string;
  isServiceProvider: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: {
    id: number;
    name: string;
    email: string;
    role: string;
  }[];
  clients?: Client[];
}

export interface OrganizationState {
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;
}
