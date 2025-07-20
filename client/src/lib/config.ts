
// API Configuration - Use local backend only
const API_BASE_URL = "http://localhost:3001";

export function getApiUrl(path: string): string {
  const url = `${API_BASE_URL}${path}`;
  console.log(`🎯 Fetching from: ${url}`);
  return url;
}

export const config = {
  apiBaseUrl: API_BASE_URL,
  isDevelopment: true
};
