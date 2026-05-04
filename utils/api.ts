import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { makeRedirectUri } from 'expo-auth-session/build/AuthSession';

// 1. Base URL Configuration
const getBaseUrl = () => {
  const deployedUrl = process.env.EXPO_PUBLIC_API_URL;
  if (deployedUrl) {
    return deployedUrl;
  }
  return "https://lykasserver.onrender.com";
};

// 2. Create Axios Instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
  timeout: 30000, // Increased timeout to 60s for slower networks
});

// 3. Request Interceptor for Auth Tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");

      console.log(`[API Interceptor] ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`[API Interceptor] Token attached: ${token ? "✅ YES" : "❌ NO"}`);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error(`[API Interceptor] Error retrieving token from SecureStore:`, error);
      return config; // Continue without token if retrieval fails
    }
  },
  (error) => {
    console.error(`[API Interceptor] Request setup error:`, error);
    return Promise.reject(error);
  },
);

// 4. Response Interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ✅ ${response.status} - ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const endpoint = originalRequest?.url;
    const message = error.response?.data?.message || error.message;

    console.error(`[API Error] 🔴 ${status} - ${endpoint}`);
    console.error(`[API Error] Message: ${message}`);

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      console.error(`[API Error] 401 Unauthorized - Token may be expired or revoked`);
      try {
        // Clear auth data from storage
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userData");
        // Note: Can't navigate from here, let AuthContext handle redirection
      } catch (err) {
        console.error("[API Error] Failed to clear auth data:", err);
      }
    }

    // Handle 409 Conflict - Usually duplicate email/user
    if (status === 409) {
      console.error(`[API Error] 409 Conflict - Resource already exists`);
    }

    // Handle 400 Bad Request - Validation errors
    if (status === 400) {
      console.error(`[API Error] 400 Bad Request - ${message}`);
      if (error.response?.data?.details) {
        console.error("[API Error] Validation details:", error.response.data.details);
      }
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error(`[API Error] 500 Server Error - Please contact support`);
    }

    // Handle network errors
    if (!error.response) {
      console.error(`[API Error] ❌ Network Error - Unable to reach ${getBaseUrl()}`);
      console.error("[API Error] Check your internet connection and API server status");
    }

    return Promise.reject(error);
  }
);

// 4. Retry Logic for Registration (handles network timeouts)
export const registerWithRetry = async (data: any, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await api.post('/auth/register', data, {
        timeout: 60000, // ✅ 60s override for cold-start servers
      });
      console.log('[RegisterRetry] ✅ Registration successful');
      return response.data;
    } catch (error: any) {
      lastError = error;
      const status = error.response?.status;
      
      if (status === 400 || status === 409 || status === 429) {
        console.error(`[RegisterRetry] ❌ Status ${status} - Not retrying`);
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const baseDelay = Math.pow(2, i + 1) * 1000;
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;
        console.log(`[RegisterRetry] Attempt ${i + 1}/${maxRetries} - Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('[RegisterRetry] ❌ Failed after 3 attempts');
  throw lastError;
};

// 5. Filtered API Function
// This applies the logic to handle 'All' category and search terms
export const getPets = async (filters?: { category?: string; search?: string }) => {
  try {
    const queryParams: any = {};

    if (filters) {
      // Only add category if it is not "All"
      if (filters.category && filters.category !== 'All') {
        queryParams.category = filters.category;
      }
      // Add search term if it exists
      if (filters.search) {
        queryParams.search = filters.search;
      }
    }

    // Axios automatically converts the params object into ?category=cat&search=name
    const response = await api.get('/pets', { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching pets:", error);
    throw error;
  }
};

export default api;