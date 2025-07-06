// Common types used across the application

export interface BaseEntity {
  id: string;
  createdAt: string; // ISO string for Redux serialization
  updatedAt?: string; // ISO string for Redux serialization
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: "success" | "error" | "loading";
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// UI Types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

// Theme Types
export type Theme = "light" | "dark";

export interface ThemeConfig {
  theme: Theme;
  systemPreference: boolean;
}
