export function getApiUrl(path: string = ""): string {
  if (typeof window !== "undefined") {
    // Client-side: use the current origin for development, production URL for production
    const isDev = window.location.hostname === "localhost" || window.location.hostname.includes("replit");

    if (isDev) {
      // Development: use localhost or replit dev URL
      const baseUrl = window.location.hostname.includes("replit") 
        ? `https://${window.location.hostname.replace(/:\d+/, '')}`
        : "http://localhost:5000";
      return `${baseUrl}${path}`;
    } else {
      // Production
      return `https://trynex-gift-shop-backend.onrender.com${path}`;
    }
  } else {
    // Server-side: use environment variable or fallback
    const baseUrl = process.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}${path}`;
  }
}