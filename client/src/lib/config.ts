export function getApiUrl(path: string = ""): string {
  if (typeof window !== "undefined") {
    // Client-side: check if we're in development
    const isDev = window.location.hostname === "localhost" || 
                  window.location.hostname.includes("replit") ||
                  window.location.port === "5173";

    if (isDev) {
      // Development: try to use the backend port
      if (window.location.hostname.includes("replit")) {
        // On Replit, use the same hostname but port 5000
        const baseUrl = `https://${window.location.hostname.replace(/:\d+/, '')}`;
        return `${baseUrl}${path}`;
      } else {
        // Local development
        return `http://localhost:5000${path}`;
      }
    } else {
      // Production
      return `https://trynex-gift-shop-backend.onrender.com${path}`;
    }
  } else {
    // Server-side
    const baseUrl = process.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}${path}`;
  }
}