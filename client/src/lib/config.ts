
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://trynex-backend-32fp.onrender.com';

export function getApiUrl(path: string = ''): string {
  return `${API_BASE_URL}${path}`;
}

export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 10000,
  retries: 3
};
