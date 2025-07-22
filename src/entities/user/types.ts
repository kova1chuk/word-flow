import { BaseEntity } from "@/shared/types";

export interface User extends BaseEntity {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    display_name?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  email_confirmed_at?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  uid: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName?: string;
}
