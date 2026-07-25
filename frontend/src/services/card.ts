const API_URL = 'http://localhost:3006/api/v1/cards';

export interface Card {
  cardId: string;
  cardType: string;
  cardNetwork: string;
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
}

export const cardService = new CardService();
