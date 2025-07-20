
export const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || window.location.origin;
  return `${baseUrl}${path}`;
};
