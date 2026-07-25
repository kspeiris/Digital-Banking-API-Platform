const API_URL = 'http://localhost:3010/developer';

export interface DeveloperApi {
  name: string;
  version: string;
  status: string;
}

export interface AnalyticsSummary {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: string;
}

export interface GeneratedKey {
  apiKey: string;
  secret: string;
}

export class DeveloperService {
  private getAccessToken(): string {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No access token found');
    return token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getAccessToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  public async getApis(): Promise<DeveloperApi[]> {
    const res = await this.request('/apis');
    return res.data;
  }

  public async generateApiKey(applicationName: string): Promise<GeneratedKey> {
    const res = await this.request('/key', {
      method: 'POST',
      body: JSON.stringify({ applicationName }),
    });
    return res;
  }

  public async revokeApiKey(apiKey: string): Promise<void> {
    await this.request('/key', {
      method: 'DELETE',
      body: JSON.stringify({ apiKey }),
    });
  }

  public async getAnalytics(): Promise<AnalyticsSummary> {
    const res = await this.request('/analytics');
    return res.data;
  }
}

export const developerService = new DeveloperService();
