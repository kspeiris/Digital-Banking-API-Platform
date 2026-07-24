import { auth } from '@/services/auth';

const API_URL = 'http://localhost:3003/api/v1/accounts';

export interface Account {
  accountId: string;
  accountNumber: string;
  accountType: string;
  currency: string;
  branch?: string;
  balance: number;
  availableBalance: number;
  status: string;
  createdAt?: string;
}

export interface StatementTransaction {
  reference: string;
  date: string;
  description: string;
  credit: number;
  debit: number;
  balance: number;
}

export interface StatementResponse {
  accountNumber: string;
  fromDate: string;
  toDate: string;
  transactions: StatementTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class AccountService {
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

  public async getAccounts(): Promise<Account[]> {
    const res = await this.request('');
    return res.data;
  }

  public async getAccountDetails(id: string): Promise<Account> {
    const res = await this.request(`/${id}`);
    return res.data;
  }

  public async getAccountBalance(id: string): Promise<{ balance: number; availableBalance: number; currency: string }> {
    const res = await this.request(`/${id}/balance`);
    return res.data;
  }

  public async getAccountStatements(
    id: string,
    params: { from?: string; to?: string; page?: number; limit?: number; format?: 'json' | 'pdf' | 'excel' } = {}
  ): Promise<any> {
    const query = new URLSearchParams();
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.format) query.append('format', params.format);

    const path = `/${id}/statements?${query.toString()}`;

    if (params.format === 'pdf' || params.format === 'excel') {
      const headers = new Headers();
      const token = this.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const res = await fetch(`${API_URL}${path}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to download statement with status ${res.status}`);
      }
      return res.blob();
    }

    const res = await this.request(path);
    return res.data;
  }
}

export const accountService = new AccountService();
