
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiUrl(path: string): string {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export { API_BASE_URL };
