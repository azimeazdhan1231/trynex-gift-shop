

// API Configuration for Render backend
const isDevelopment = import.meta.env.MODE === 'development';
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Your Render backend URL
const RENDER_BACKEND_URL = 'https://trynex-backend-32fp.onrender.com';

export function getApiUrl(endpoint: string): string {
  // For local development, use localhost
  if (isDevelopment && isLocal) {
    const baseUrl = 'http://localhost:5000';
    console.log(`🎯 Fetching ${endpoint.replace('/api/', '')} from:`, `${baseUrl}${endpoint}`);
    return `${baseUrl}${endpoint}`;
  }

  // For production (Netlify deployment), use Render backend
  console.log(`🎯 Fetching ${endpoint.replace('/api/', '')} from:`, `${RENDER_BACKEND_URL}${endpoint}`);
  return `${RENDER_BACKEND_URL}${endpoint}`;
}

export const API_BASE_URL = isDevelopment && isLocal ? 'http://localhost:5000' : RENDER_BACKEND_URL;
