export type UserRole = 'technician' | 'manager' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatar: string | null;
  isServiceProvider: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  client?: {
    id: number;
    name: string;
  };
  redirectTo?: 'dashboard' | 'add-client';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  isServiceProvider: boolean;
  companyName?: string;
  phone?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  phone?: string;
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}
