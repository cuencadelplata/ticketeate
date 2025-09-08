export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime?: number;
  environment?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
}
