import { API_URLS } from '@/config/api';
import { auth } from '@/services/auth';

const API_URL = API_URLS.notification;

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

  public async broadcast(data: {
    title: string;
    message: string;
    type?: string;
    targetRole?: string;
    targetUserIds?: string[];
  }): Promise<any> {
    return this.request('/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: string;
  }): Promise<any> {
    return this.request('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const notificationService = new NotificationService();
