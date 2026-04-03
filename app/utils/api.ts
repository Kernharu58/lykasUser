import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Detect the environment to set the correct backend URL
// Android emulator uses 10.0.2.2 to connect to your computer's localhost
// iOS simulator uses localhost or 127.0.0.1
// Detect the environment to set the correct backend URL
const getBaseUrl = () => {
  // 👉 Notice the /api at the very end of the URL!
  return "https://risky-allie-farcically.ngrok-free.dev/api";
  //return "http://192.168.254.105:5000/api";
};
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically add the JWT token to every request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
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
