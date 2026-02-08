import type { ApiResponse, TokenStorage } from '../types';

export interface ApiClientOptions {
  baseUrl: string;
  tokenStorage: TokenStorage;
  /** Whether to send cookies (web) — defaults to false for mobile */
  useCookies?: boolean;
}

export class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private baseUrl: string;
  private tokenStorage: TokenStorage;
  private useCookies: boolean;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.tokenStorage = options.tokenStorage;
    this.useCookies = options.useCookies ?? false;
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        if (this.useCookies) {
          // Web: cookie-based refresh
          const response = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) {
            this.accessToken = null;
            return null;
          }

          const data = await response.json();
          this.accessToken = data.accessToken;
          return data.accessToken;
        } else {
          // Mobile: body-based refresh
          const storedToken = await this.tokenStorage.getRefreshToken();
          if (!storedToken) {
            this.accessToken = null;
            return null;
          }

          const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedToken }),
          });

          if (!response.ok) {
            this.accessToken = null;
            await this.tokenStorage.clearAll();
            return null;
          }

          const data = await response.json();
          this.accessToken = data.accessToken;
          if (data.refreshToken) {
            await this.tokenStorage.setRefreshToken(data.refreshToken);
          }
          return data.accessToken;
        }
      } catch {
        this.accessToken = null;
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    if (this.useCookies) {
      fetchOptions.credentials = 'include';
    }

    try {
      let response = await fetch(url, fetchOptions);

      // If unauthorized, try to refresh token and retry
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const newToken = await this.refreshToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryOptions: RequestInit = { ...options, headers };
          if (this.useCookies) {
            retryOptions.credentials = 'include';
          }
          response = await fetch(url, retryOptions);
        }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T };
      }

      let data: T | undefined;
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          if (response.ok) {
            return { data: undefined as T };
          }
          return { error: 'Invalid response from server' };
        }
      }

      if (!response.ok) {
        return { error: (data as { error?: string })?.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/** Factory to create a configured API client */
export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
