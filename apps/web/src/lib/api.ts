const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1')
  : (process.env.API_URL || 'http://localhost:4000') + '/api/v1';

export interface ApiClientError {
  code: string;
  message: string;
  requestId: string;
  details?: any;
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('el_access_token');
      this.refreshToken = localStorage.getItem('el_refresh_token');
    }
  }

  public setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    if (typeof window !== 'undefined') {
      localStorage.setItem('el_access_token', access);
      localStorage.setItem('el_refresh_token', refresh);
    }
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('el_access_token');
      localStorage.removeItem('el_refresh_token');
    }
  }

  public getAccessToken() {
    return this.accessToken;
  }

  public async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/refresh')) {
        // Attempt automatic refresh token rotation
        const refreshed = await this.rotateRefreshToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          const retryRes = await fetch(url, { ...options, headers });
          const retryData = await retryRes.json();
          if (!retryRes.ok) throw retryData.error;
          return retryData.data !== undefined ? retryData.data : retryData;
        }
      }

      const data = await response.json();
      if (!response.ok) {
        throw data.error || { code: 'HTTP_ERROR', message: `Request failed with status ${response.status}`, requestId: 'client' };
      }

      return data.data !== undefined ? data.data : data;
    } catch (err: any) {
      throw err;
    }
  }

  private async rotateRefreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      const body = await res.json();
      if (res.ok && body.data?.tokens) {
        this.setTokens(body.data.tokens.accessToken, body.data.tokens.refreshToken);
        return true;
      }
    } catch (_) {
      this.clearTokens();
    }
    return false;
  }
}

export const api = new ApiService();
