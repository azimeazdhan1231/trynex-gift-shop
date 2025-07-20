// API Configuration - Always use Render backend for deployed version
const RENDER_BACKEND_URL = "https://trynex-backend-32fp.onrender.com";

export function getApiUrl(path: string = ""): string {
  const fullUrl = `${RENDER_BACKEND_URL}${path}`;
  console.log("🔧 API Config: Using Render backend:", fullUrl);
  return fullUrl;
}

export const apiConfig = {
  baseUrl: RENDER_BACKEND_URL,
  timeout: 15000,
};