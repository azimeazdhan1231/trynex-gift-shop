
// API Configuration
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://trynex-backend-32fp.onrender.com';

export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

// Export for debugging
export const config = {
  apiUrl: API_BASE_URL,
  isDevelopment
};

console.log('🔧 API Configuration:', config);
