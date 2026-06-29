import * as SecureStore from 'expo-secure-store';
import axios from "axios";

// 1. Base URL Configuration - includes /api prefix
const getBaseUrl = () => {
  const deployedUrl = process.env.EXPO_PUBLIC_API_URL;
  if (deployedUrl) {
    return deployedUrl;
  }
  // BUG FIX: Added /api prefix so all route calls like '/auth/login' resolve correctly
  return "https://lykasserver.onrender.com/api";
};

// 2. Create Axios Instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// 3. Request Interceptor for Auth Tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error(`[API Interceptor] Error retrieving token from SecureStore:`, error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 4. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.error(`[API Error] ${status} - ${error.config?.url} - ${message}`);

    if (status === 401) {
      try {
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userData");
      } catch (err) {
        console.error("[API Error] Failed to clear auth data:", err);
      }
    }

    return Promise.reject(error);
  }
);

// 5. Retry Logic for Registration
export const registerWithRetry = async (data: any, maxRetries = 3) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // BUG FIX: Endpoint is /auth/register not /auth/signup
      const response = await api.post('/auth/register', data, {
        timeout: 60000,
      });
      return response.data;
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;

      if (status === 400 || status === 409 || status === 429) {
        throw error;
      }

      if (i < maxRetries - 1) {
        const baseDelay = Math.pow(2, i + 1) * 1000;
        const jitter = Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
      }
    }
  }

  throw lastError;
};

// 6. Filtered Pets Function
export const getPets = async (filters?: { category?: string; search?: string }) => {
  try {
    const queryParams: any = {};
    if (filters) {
      if (filters.category && filters.category !== 'All') {
        queryParams.category = filters.category;
      }
      if (filters.search) {
        queryParams.search = filters.search;
      }
    }
    const response = await api.get('/pets', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching pets:", error);
    throw error;
  }
};

export default api;
