import axios from "axios";

// Em produção, defina VITE_API_URL (ex.: https://minha-api.com) no arquivo .env do frontend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Token vencido ou inválido: limpa a sessão e volta para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.startsWith("/auth");

    if (error.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      window.location.assign("/");
    }

    return Promise.reject(error);
  },
);

export default api;
