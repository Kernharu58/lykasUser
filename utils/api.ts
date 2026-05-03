import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import { makeRedirectUri } from 'expo-auth-session/build/AuthSession';

// 1. Base URL Configuration
const getBaseUrl = () => {
  const deployedUrl = process.env.EXPO_PUBLIC_API_URL;
  if (deployedUrl) {
    return deployedUrl;
  }
  return "https://lykasserver.onrender.com/api";
};

// 2. Create Axios Instance
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
  timeout: 10000, // Added timeout to prevent hanging
});

// 3. Request Interceptor for Auth Tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("userToken");

      console.log(`[API Interceptor] Sending request to ${config.url}`);
      console.log(`[API Interceptor] Token attached? : ${token ? "YES" : "NO"}`);
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API Interceptor] Authorization header set successfully`);
      } else if (!token) {
        console.warn(`[API Interceptor] ⚠️ No token found in SecureStore for endpoint: ${config.url}`);
      }
      return config;
    } catch (error) {
      console.error(`[API Interceptor] Error retrieving token from SecureStore:`, error);
      return config; // Continue without token if retrieval fails
    }
  },
  (error) => {
    console.error(`[API Interceptor] Request interceptor error:`, error);
    return Promise.reject(error);
  },
);

// 4. Response Interceptor for handling 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Log 401 errors for debugging
    if (error.response?.status === 401) {
      console.error(`[API Interceptor] === 🔴 API ERROR LOG ===`);
      console.error(`[API Interceptor] Route: ${originalRequest.url}`);
      console.error(`[API Interceptor] Status Code: 401`);
      console.error(`[API Interceptor] Backend Message: ${error.response?.data?.message}`);
      console.error(`[API Interceptor] ========================`);
    }

    return Promise.reject(error);
  }
);

// 4. Filtered API Function
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