import { auth } from '@/services/auth';
import { API_URLS } from '@/config/api';

const API_URL = API_URLS.beneficiary;

export interface Beneficiary {
  beneficiaryId: string;
  nickname: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  favorite: boolean;
}

class BeneficiaryService {
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

  public async getBeneficiaries(): Promise<Beneficiary[]> {
    const res = await this.request('');
    return res.data;
  }

  public async addBeneficiary(data: {
    nickname: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    favorite: boolean;
  }): Promise<any> {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateBeneficiary(
    id: string,
    data: {
      nickname?: string;
      branch?: string;
      favorite?: boolean;
    }
  ): Promise<any> {
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteBeneficiary(id: string): Promise<any> {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const beneficiaryService = new BeneficiaryService();
