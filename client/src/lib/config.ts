export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getApiUrl(endpoint: string): string {
  // In development, always use the current host
  if (import.meta.env.DEV) {
    const baseUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    console.log(`🎯 Fetching ${endpoint.replace('/api/', '')} from:`, `${baseUrl}${endpoint}`);
    return `${baseUrl}${endpoint}`;
  }

  // In production, check for custom backend URL first
  const customBackend = import.meta.env.VITE_BACKEND_URL;
  if (customBackend) {
    console.log(`🔧 API Config: Using custom backend:`, `${customBackend}${endpoint}`);
    return `${customBackend}${endpoint}`;
  }

  // Default to Render backend
  const renderBackend = "https://trynex-backend-32fp.onrender.com";
  console.log(`🔧 API Config: Using Render backend:`, `${renderBackend}${endpoint}`);
  return `${renderBackend}${endpoint}`;
}