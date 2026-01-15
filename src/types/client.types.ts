export interface Client {
  id: number;
  ownerId: number;
  name: string;
  address: string | null;
  contact: string | null;
  phone: string | null;
  email: string | null;
  logo: string | null;
  brandColor: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: number;
    name: string;
    email: string;
    isServiceProvider: boolean;
  };
  systems?: {
    id: number;
    name: string;
    status: string;
  }[];
  userClients?: UserClient[];
}

export interface UserClient {
  id: number;
  userId: number;
  clientId: number;
  accessLevel: 'view' | 'edit' | 'admin';
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
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
  logo?: string | null;
  brandColor?: string | null;
  isActive?: boolean;
}

export interface ClientStats {
  systems: number;
  dailyLogs: number;
  inspections: number;
  incidents: number;
  products: number;
}

export interface ClientPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FetchClientsParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ClientState {
  clients: Client[];
  currentClient: Client | null;
  currentClientStats: ClientStats | null;
  selectedClientId: number | null;
  pagination: ClientPagination;
  loading: boolean;
  error: string | null;
}

export interface AddUserAccessRequest {
  userId: number;
  accessLevel: 'view' | 'edit' | 'admin';
}

export interface UpdateUserAccessRequest {
  accessLevel: 'view' | 'edit' | 'admin';
}
