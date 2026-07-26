import { auth } from '@/services/auth';
import { API_URLS } from '@/config/api';

const API_URL = API_URLS.customer;

export interface CustomerProfile {
  customerId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nic: string;
  dob: string;
  address: string;
  city: string;
  country: string;
  occupation: string;
  profileImage: string;
  kycStatus: string;
}

class CustomerService {
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

  public async getProfile(): Promise<CustomerProfile> {
    const res = await this.request('/me');
    return res.data;
  }

  public async updateProfile(data: any): Promise<any> {
    return this.request('/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async uploadProfileImage(formData: FormData): Promise<{ imageUrl: string }> {
    return this.request('/me/profile-image', {
      method: 'POST',
      body: formData,
    });
  }

  public async submitKyc(formData: FormData): Promise<any> {
    return this.request('/kyc', {
      method: 'POST',
      body: formData,
    });
  }

  public async getCustomerById(id: string): Promise<CustomerProfile> {
    const res = await this.request(`/${id}`);
    return res.data;
  }
}

export const customer = new CustomerService();
