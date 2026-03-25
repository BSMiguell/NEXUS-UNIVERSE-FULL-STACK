import axios from "axios";
import { useAuthStore } from "@/store/use-auth-store";
import { getRuntimeEnv } from "@/lib/runtime-env";

const rawApiBaseUrl = (
  getRuntimeEnv("NEXT_PUBLIC_API_BASE_URL")
  ?? getRuntimeEnv("VITE_API_BASE_URL")
)?.trim();
const apiBaseUrl = rawApiBaseUrl ? rawApiBaseUrl.replace(/\/+$/, "") : "/";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url ?? "");
    const isAuthRequest =
      requestUrl.includes("/api/auth/login") || requestUrl.includes("/api/auth/register");

    if (status === 401 && !isAuthRequest) {
      const { token, logout } = useAuthStore.getState();

      if (token) {
        logout();

        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);
