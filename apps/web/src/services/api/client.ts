// Single-domain deploy: the API is served from /api on this same origin, so the
// production default needs no build-time variable (and no rebuild if the domain
// changes). Dev still points at the separate backend on :3001.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async refreshToken(): Promise<string | null> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
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
    const url = `${API_URL}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // If unauthorized, try to refresh token and retry
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const newToken = await this.refreshToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });
        } else {
          // Refresh failed — session is fully expired; notify the app
          window.dispatchEvent(new CustomEvent('session-expired'));
        }
      }

      // Handle 204 No Content (common for DELETE)
      if (response.status === 204) {
        return { data: undefined as T };
      }

      // Try to parse JSON, but handle empty responses
      let data: T | undefined;
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // If JSON parsing fails and response is ok, return undefined
          if (response.ok) {
            return { data: undefined as T };
          }
          return { error: 'Invalid response from server' };
        }
      }

      if (!response.ok) {
        // The approval gate refuses every write by an unreviewed vendor or
        // planner. Buttons are disabled where we know to disable them; this
        // is the backstop, so an ungated action cannot fail with a bare
        // "Request failed" that never mentions approval.
        if (response.status === 403 && (data as { approvalStatus?: string })?.approvalStatus) {
          notifyApprovalBlocked((data as { error?: string })?.error || 'Your account is awaiting approval.');
        }
        return {
          error: (data as { error?: string })?.error || 'Request failed',
          status: response.status,
        };
      }

      return { data, status: response.status };
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

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Surfaces an approval refusal once, not per failed request — one page action
 * can fan out into several writes, and a stack of identical toasts explaining
 * the same block helps nobody.
 */
let lastApprovalNotice = 0;
function notifyApprovalBlocked(message: string) {
  const now = Date.now();
  if (now - lastApprovalNotice < 4000) return;
  lastApprovalNotice = now;
  void import('sonner').then(({ toast }) => {
    toast.warning('Awaiting approval', { description: message });
  });
}

export const apiClient = new ApiClient();
export default apiClient;
