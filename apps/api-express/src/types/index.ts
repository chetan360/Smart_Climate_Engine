export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  version: string;
  services: Record<string, "up" | "down">;
  timestamp: string;
}
