
// API Configuration
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000' 
  : 'https://trynex-backend-32fp.onrender.com';

export const config = {
  API_BASE_URL,
  endpoints: {
    products: `${API_BASE_URL}/api/products`,
    orders: `${API_BASE_URL}/api/orders`,
    promoCodes: `${API_BASE_URL}/api/promo-codes`,
    categories: `${API_BASE_URL}/api/categories`,
  }
};

export default config;
