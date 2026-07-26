import { API_URLS } from '@/config/api';
import { auth } from '@/services/auth';

const API_URL = API_URLS.card;

export interface Card {
  id?: string;
  cardId: string;
  cardType: string;
  cardNetwork: string;
  cardNumber?: string;
  maskedNumber: string;
  expiry: string;
  status: string;
  onlinePayments: boolean;
  internationalUsage: boolean;
  limits: {
    dailyLimit: number;
    atmLimit: number;
    onlineLimit: number;
    contactlessLimit: number;
  } | null;
  account?: {
    id: string;
    accountNumber: string;
    accountType: string;
    customer?: {
      firstName: string;
      lastName: string;
      nic: string;
    } | null;
  } | null;
}

export interface LimitUpdate {
  dailyLimit: number;
  atmLimit: number;
  onlineLimit: number;
  contactlessLimit: number;
}

export interface SettingsUpdate {
  onlinePayments: boolean;
  internationalUsage: boolean;
}

export class CardService {
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

  public async getCards(): Promise<Card[]> {
    const res = await this.request('/');
    return res.data;
  }

  public async freezeCard(cardId: string, reason?: string): Promise<void> {
    await this.request('/freeze', {
      method: 'PUT',
      body: JSON.stringify({ cardId, reason }),
    });
  }

  public async unfreezeCard(cardId: string): Promise<void> {
    await this.request('/unfreeze', {
      method: 'PUT',
      body: JSON.stringify({ cardId }),
    });
  }

  public async changePin(cardId: string, currentPin: string, newPin: string): Promise<void> {
    await this.request('/pin', {
      method: 'PUT',
      body: JSON.stringify({ cardId, currentPin, newPin, confirmPin: newPin }),
    });
  }

  public async updateLimits(cardId: string, limits: LimitUpdate): Promise<void> {
    await this.request('/limit', {
      method: 'PUT',
      body: JSON.stringify({ cardId, ...limits }),
    });
  }

  public async updateSettings(cardId: string, settings: SettingsUpdate): Promise<void> {
    await this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify({ cardId, ...settings }),
    });
  }

  public async createCard(data: {
    accountId: string;
    cardNumber: string;
    cardType: string;
    expiry: string;
    pin: string;
    onlineEnabled?: boolean;
    internationalEnabled?: boolean;
  }): Promise<Card> {
    const res = await this.request('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  public async requestCard(accountId: string): Promise<void> {
    const res = await this.request('/request', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
    return res.data;
  }

  public async deleteCard(cardId: string): Promise<void> {
    await this.request(`/${cardId}`, {
      method: 'DELETE',
    });
  }

  public async getCardRequests(status?: string): Promise<any> {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await this.request(`/requests${query}`);
    return res.data;
  }

  public async getAllCardRequests(status?: string, page = 1, limit = 20): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    const res = await this.request(`/admin/requests?${params.toString()}`);
    return res;
  }

  public async approveCardRequest(requestId: string): Promise<any> {
    return this.request(`/admin/requests/${requestId}/approve`, {
      method: 'PUT',
    });
  }

  public async rejectCardRequest(requestId: string, reason: string): Promise<any> {
    return this.request(`/admin/requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }
}

export const cardService = new CardService();
