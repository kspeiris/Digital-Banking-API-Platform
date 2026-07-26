import { auth } from '@/services/auth';
import { API_URLS } from '@/config/api';

const API_URL = API_URLS.transaction;

export interface TransferPayload {
  fromAccountId: string;
  toAccountId?: string;
  beneficiaryId?: string;
  amount: number;
  description?: string;
  transferDate?: string;
  frequency?: string;
}

export interface TransactionItem {
  reference: string;
  date: string;
  description: string;
  type: string;
  amount: number;
  status: string;
}

export interface TransactionPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionHistoryResponse {
  data: TransactionItem[];
  pagination: TransactionPagination;
}

export interface TransactionDetails {
  reference: string;
  senderAccount: string | null;
  receiverAccount: string | null;
  amount: number;
  fee: number;
  status: string;
  createdAt: string;
  description: string;
  type: string;
}

class TransactionService {
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

  public async executeInternalTransfer(data: TransferPayload): Promise<{ transactionReference: string }> {
    const res = await this.request('/internal', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }

  public async executeExternalTransfer(data: TransferPayload): Promise<{ transactionReference: string }> {
    const res = await this.request('/external', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }

  public async scheduleTransfer(data: TransferPayload): Promise<{ success: boolean; message: string }> {
    const res = await this.request('/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }

  public async getHistory(params: {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<TransactionHistoryResponse> {
    const query = new URLSearchParams();
    query.append('page', params.page.toString());
    query.append('limit', params.limit.toString());
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    const res = await this.request(`/?${query.toString()}`);
    return res;
  }

  public async getTransactionDetails(id: string): Promise<TransactionDetails> {
    const res = await this.request(`/${id}`);
    return res.data;
  }

  public async downloadReceipt(id: string, format: 'pdf' | 'json' = 'pdf'): Promise<Blob> {
    const headers = new Headers();
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(`${API_URL}/receipt/${id}?format=${format}`, { headers });
    if (!res.ok) {
      throw new Error(`Failed to download receipt with status ${res.status}`);
    }
    return res.blob();
  }

  public async cancelTransaction(id: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await this.request(`/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return res;
  }

  public async disputeTransaction(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await this.request(`/${id}/dispute`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return res;
  }
}

export const transactionService = new TransactionService();
