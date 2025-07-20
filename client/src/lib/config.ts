
// Always use production Render backend - no localhost switching
const API_BASE_URL = 'https://trynex-backend-32fp.onrender.com';

export function getApiUrl(endpoint: string): string {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🔧 API Config: Using Render backend:', url);
  return url;
}
