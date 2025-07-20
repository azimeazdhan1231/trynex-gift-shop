export function getApiUrl(path: string = ""): string {
  if (typeof window !== "undefined") {
    // Client-side: use relative URLs
    return path;
  }

  // Server-side: use full URL
  const baseUrl = process.env.VITE_API_URL || "http://localhost:3001";
  return `${baseUrl}${path}`;
}