import { API_URLS } from '@/config/api';
import { auth } from '@/services/auth';

const API_URL = API_URLS.developer;

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
    const token = auth.getAccessToken();
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

  public async listApiKeys(): Promise<Array<{ id: string; apiKey: string; applicationName: string; status: string; createdAt: string }>> {
    const res = await this.request('/keys');
    return res.data;
  }

  public async updateApiKey(apiKey: string, applicationName: string): Promise<any> {
    return this.request('/key', {
      method: 'PUT',
      body: JSON.stringify({ apiKey, applicationName }),
    });
  }
}

export const developerService = new DeveloperService();
