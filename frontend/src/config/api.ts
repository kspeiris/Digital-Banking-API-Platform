const getApiUrl = (path: string): string => {
  const baseUrl = (import.meta as any).env?.VITE_API_URL;
  if (baseUrl) {
    return `${baseUrl}${path}`;
  }
  return `http://localhost:${path}`;
};

export const API_URLS = {
  auth: getApiUrl('3001/api/v1/auth'),
  customer: getApiUrl('3002/api/v1/customers'),
  account: getApiUrl('3003/api/v1/accounts'),
  transaction: getApiUrl('3004/api/v1/transactions'),
  beneficiary: getApiUrl('3005/api/v1/beneficiaries'),
  card: getApiUrl('3006/api/v1/cards'),
  loan: getApiUrl('3007/api/v1/loans'),
  notification: getApiUrl('3008/api/v1/notifications'),
  admin: getApiUrl('3009/admin'),
  developer: getApiUrl('3010/developer'),
};
