const API_URL = 'http://localhost:3008/api/v1/notifications';

export interface Notification {
  notificationId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  read: boolean;
  createdAt: string;
}

export class NotificationService {
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

  public async getNotifications(page: number = 1, limit: number = 20, type?: string, category?: string, read?: boolean): Promise<{ total: number; data: Notification[] }> {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', limit.toString());
    if (type) query.append('type', type);
    if (category) query.append('category', category);
    if (read !== undefined) query.append('read', read.toString());

    const res = await this.request(`/?${query.toString()}`);
    return { total: res.total, data: res.data };
  }

  public async markAsRead(notificationIds: string[]): Promise<void> {
    await this.request('/read', {
      method: 'PUT',
      body: JSON.stringify({ notificationIds }),
    });
  }

  public async deleteNotification(notificationId: string): Promise<void> {
    await this.request(`/${notificationId}`, {
      method: 'DELETE',
    });
  }
}

export const notificationService = new NotificationService();
