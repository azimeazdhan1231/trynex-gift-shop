export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiUrl(endpoint: string = ''): string {
  // Always use localhost for development in Replit
  return `http://localhost:5000${endpoint}`;
}