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

// ── Token storage ────────────────────────────────────────────────────────────
// Centralizes what used to be duplicated across logIn.tsx (x2, for email and
// Google login) and signUp.tsx — each independently called
// SecureStore.setItemAsync("userToken", ...) with no refresh token at all.
// The backend now issues a short-lived access token (~20 min) plus a
// separate, longer-lived refresh token (§11.6.2) — both need to be stored,
// and every login/signup call site needs to agree on how.
export const storeAuthTokens = async (token: string, refreshToken: string) => {
  await SecureStore.setItemAsync("userToken", token);
  await SecureStore.setItemAsync("userRefreshToken", refreshToken);
};

export const clearAuthTokens = async () => {
  await SecureStore.deleteItemAsync("userToken");
  await SecureStore.deleteItemAsync("userRefreshToken");
};

// ── Refresh-on-401 ───────────────────────────────────────────────────────────
// Access tokens now expire roughly every 20 minutes by design (a smaller
// stolen-token blast radius than the old 7-day token — see the backend's
// utils/tokenService.js). That means a *routine*, expected 401 with
// code "TOKEN_EXPIRED" happens far more often than it used to, and every
// screen that makes API calls needs to seamlessly recover from it rather
// than bouncing the user to the login screen every 20 minutes.
//
// `refreshPromise` de-dupes concurrent refreshes: if five screens each fire
// a request at the same moment the access token expires, all five get one
// shared in-flight refresh call instead of five racing calls that would
// each try to rotate the same refresh token (only the first would succeed;
// the other four would get an already-rotated, now-invalid token and force
// a real logout for no reason).
let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const storedRefreshToken = await SecureStore.getItemAsync("userRefreshToken");
  if (!storedRefreshToken) return null;

  try {
    const res = await axios.post(`${getBaseUrl()}/auth/refresh`, {
      refreshToken: storedRefreshToken,
    });
    await storeAuthTokens(res.data.token, res.data.refreshToken);
    return res.data.token;
  } catch (err) {
    console.error("[API] Token refresh failed:", err);
    await clearAuthTokens();
    return null;
  }
};

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
    const code = error.response?.data?.code;
    const message = error.response?.data?.message || error.message;
    const originalRequest = error.config;

    console.error(`[API Error] ${status} - ${error.config?.url} - ${message}`);

    // The expected, routine case: access token expired mid-session. Refresh
    // once and silently retry the original request — the caller never sees
    // this happen. `_retried` guards against looping forever if the refresh
    // itself (or the retried request) also comes back 401.
    if (status === 401 && code === "TOKEN_EXPIRED" && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;

      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
      }
      const newAccessToken = await refreshPromise;

      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      }
      // Refresh failed (refresh token itself expired/revoked) — fall through
      // to the same "clear everything" path as any other unrecoverable 401.
    }

    if (status === 401) {
      try {
        await clearAuthTokens();
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
