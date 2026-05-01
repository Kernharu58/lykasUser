// utils/api.ts
// This file sets up a centralized API client using Axios, configured to automatically include the JWT token in the Authorization header for all requests.
import * as SecureStore from 'expo-secure-store';
// We use Axios for making HTTP requests to our backend API
import axios from "axios";
import { makeRedirectUri } from 'expo-auth-session/build/AuthSession';

// Detect the environment to set the correct backend URL
// Android emulator uses 10.0.2.2 to connect to your computer's localhost
// iOS simulator uses localhost or 127.0.0.1
// Detect the environment to set the correct backend URL
const getBaseUrl = () => {
  // 👉 Notice the /api at the very end of the URL!
  const deployedUrl = process.env.EXPO_PUBLIC_API_URL;
  if (deployedUrl) {
    return deployedUrl;
  }
  return "https://lykasserver.onrender.com/api";
  //return "http://192.168.254.106:5000/api";
};
// Create an Axios instance with the base URL and default headers
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "69420"
  },
});

// Interceptor to automatically add the JWT token to every request
api.interceptors.request.use(
  // This function is called before every request is sent
  async (config) => {
    const token = await SecureStore.getItemAsync("userToken");

    // 👉 ADD THIS LOG: Tells us if the token exists before sending
    console.log(`[API Interceptor] Sending request to ${config.url}`);
    console.log(`[API Interceptor] Token attached? : ${token ? "YES" : "NO (Token is missing or null)"}`);
    console.log("Redirect URI:", makeRedirectUri());
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
