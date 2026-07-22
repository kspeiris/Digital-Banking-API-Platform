const API_URL = 'http://localhost:3001/api/v1/auth';

export interface UserSession {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    role: string;
    email: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private static instance: AuthService;
  private session: UserSession | null = null;
  private refreshPromise: Promise<UserSession> | null = null;

  private constructor() {
    const saved = localStorage.getItem('db_session');
    if (saved) {
      try {
        this.session = JSON.parse(saved);
      } catch {
        this.clearSession();
      }
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public getSession(): UserSession | null {
    return this.session;
  }

  public setSession(session: UserSession) {
    this.session = session;
    localStorage.setItem('db_session', JSON.stringify(session));
  }

  public clearSession() {
    this.session = null;
    localStorage.removeItem('db_session');
  }

  public getAccessToken(): string | null {
    return this.session?.accessToken || null;
  }

  public async refreshAccessToken(): Promise<UserSession> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.session?.refreshToken;
    if (!refreshToken) {
      this.clearSession();
      throw new Error('No refresh token available');
    }

    this.refreshPromise = fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Token refresh failed');
        }
        const data = await res.json();
        this.setSession(data);
        return data as UserSession;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const headers = new Headers(options.headers || {});
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      if (res.status === 401 && token) {
        try {
          const newSession = await this.refreshAccessToken();
          const newHeaders = new Headers(options.headers || {});
          newHeaders.set('Authorization', `Bearer ${newSession.accessToken}`);
          newHeaders.set('Content-Type', 'application/json');

          const retryRes = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: newHeaders,
          });

          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({}));
            this.clearSession();
            throw new Error(errData.message || `Request failed with status ${retryRes.status}`);
          }

          return retryRes.json();
        } catch (err) {
          this.clearSession();
          throw err;
        }
      }

      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  public async register(data: any): Promise<any> {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async login(data: any): Promise<UserSession> {
    const session = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setSession(session);
    return session;
  }

  public async logout(): Promise<void> {
    const refreshToken = this.session?.refreshToken;
    try {
      if (refreshToken) {
        await this.request('/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } finally {
      this.clearSession();
    }
  }

  public async forgotPassword(email: string): Promise<any> {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async verifyOtp(email: string, otp: string): Promise<any> {
    return this.request('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  public async resetPassword(data: any): Promise<any> {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async getProfile(): Promise<UserProfile> {
    return this.request('/profile');
  }
}

export const auth = AuthService.getInstance();
