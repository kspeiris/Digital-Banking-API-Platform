const API_URL = 'http://localhost:3007/api/v1/loans';

export interface Loan {
  loanId: string;
  loanType: string;
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number;
  durationMonths: number;
  emi: number;
  status: string;
  submittedAt: string;
}

export interface ApplyLoanData {
  loanType: string;
  requestedAmount: number;
  durationMonths: number;
  monthlyIncome: number;
  employmentType: string;
  purpose: string;
}

export class LoanService {
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

  public async applyForLoan(data: ApplyLoanData): Promise<{ loanId: string; status: string }> {
    const res = await this.request('/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }

  public async getLoans(): Promise<Loan[]> {
    const res = await this.request('/');
    return res.data;
  }

  public async getLoanDetails(loanId: string): Promise<Loan> {
    const res = await this.request(`/${loanId}`);
    return res.data;
  }

  public async getLoanStatus(loanId: string): Promise<string> {
    const res = await this.request(`/status/${loanId}`);
    return res.status;
  }

  public async uploadDocument(loanId: string, documentType: string, file: File): Promise<void> {
    const token = this.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('loanId', loanId);
    formData.append('documentType', documentType);

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
  }
}

export const loanService = new LoanService();
