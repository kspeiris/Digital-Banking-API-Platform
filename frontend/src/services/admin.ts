import { auth } from '@/services/auth';
import { API_URLS } from '@/config/api';

const API_URL = API_URLS.admin;

export interface DashboardSummary {
  totalCustomers: number;
  activeAccounts: number;
  todayTransactions: number;
  pendingLoans: number;
  fraudAlerts: number;
  activeCards: number;
  apiRequestsToday: number;
}

export interface FraudAlert {
  id: string;
  userId: string;
  user: string;
  type: string;
  trigger: string;
  risk: string;
  status: string;
  time: string;
  notificationId: string;
}

export interface AdminCustomer {
  customerId: string;
  userId: string;
  name: string;
  email: string;
  status: string;
  kycStatus: string;
  joinDate?: string;
  accounts?: number;
}

export interface SearchCustomersResponse {
  total: number;
  data: AdminCustomer[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  createdAt: string;
  user?: {
    email: string;
  };
}

class AdminService {
  private getAccessToken(): string | null {
    return auth.getAccessToken();
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers = new Headers(options.headers || {});
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401 && token) {
        try {
          const newSession = await auth.refreshAccessToken();
          const newHeaders = new Headers(options.headers || {});
          newHeaders.set('Authorization', `Bearer ${newSession.accessToken}`);
          if (!(options.body instanceof FormData)) {
            newHeaders.set('Content-Type', 'application/json');
          }

          const retryRes = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: newHeaders,
          });

          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({}));
            throw new Error(errData.message || `Request failed with status ${retryRes.status}`);
          }

          return retryRes.json();
        } catch (err) {
          throw err;
        }
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  public async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await this.request('/dashboard');
    return res.data;
  }

  public async searchCustomers(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    kyc?: string;
  }): Promise<{ total: number; data: AdminCustomer[] }> {
    const query = new URLSearchParams();
    query.append('page', params.page.toString());
    query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.kyc) query.append('kyc', params.kyc);

    const res = await this.request(`/customers?${query.toString()}`);
    return res.data;
  }

  public async freezeCustomer(customerId: string, reason: string): Promise<any> {
    return this.request('/customer/freeze', {
      method: 'PUT',
      body: JSON.stringify({ customerId, reason }),
    });
  }

  public async generateReport(params: {
    type: string;
    format: string;
    from?: string;
    to?: string;
  }): Promise<Blob> {
    const query = new URLSearchParams();
    query.append('type', params.type);
    query.append('format', params.format);
    if (params.from) query.append('from', params.from.split('T')[0]);
    if (params.to) query.append('to', params.to.split('T')[0]);

    const headers = new Headers();
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${API_URL}/reports?${query.toString()}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to generate report with status ${res.status}`);
    }
    return res.blob();
  }

  public async getAuditHistory(page: number, limit: number): Promise<{ total: number; data: AuditLog[] }> {
    const res = await this.request(`/audit?page=${page}&limit=${limit}`);
    return res.data;
  }

  public async getTransactions(params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<{ total: number; data: any[] }> {
    const query = new URLSearchParams();
    query.append('page', params.page.toString());
    query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    const res = await this.request(`/transactions?${query.toString()}`);
    return {
      total: res.data?.total || 0,
      data: res.data?.items || [],
    };
  }

  public async getFraudAlerts(): Promise<{ total: number; data: FraudAlert[] }> {
    const res = await this.request('/fraud-alerts');
    return res.data;
  }

  public async freezeByUserId(userId: string, reason: string): Promise<any> {
    return this.request('/customer/freeze-by-user', {
      method: 'PUT',
      body: JSON.stringify({ userId, reason }),
    });
  }

  public async unfreezeByUserId(userId: string, reason?: string): Promise<any> {
    return this.request('/customer/unfreeze-by-user', {
      method: 'PUT',
      body: JSON.stringify({ userId, reason }),
    });
  }

  public async deleteCustomer(customerId: string): Promise<any> {
    return this.request(`/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  public async createCustomer(data: any): Promise<any> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateCustomer(customerId: string, data: any): Promise<any> {
    return this.request(`/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const adminService = new AdminService();
