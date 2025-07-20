
export function getApiUrl(path: string = ""): string {
  // Use environment variable in production, fallback to Render URL
  const baseUrl = import.meta.env.VITE_API_URL || "https://trynex-backend-32fp.onrender.com";
  return `${baseUrl}${path}`;
}

// For debugging - log what URL we're using
console.log('🔧 API Config: Using Render backend:', getApiUrl('/api/products'));
