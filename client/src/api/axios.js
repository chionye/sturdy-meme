/** @format */

import axios from "axios";

const API_BASE = "https://api.eopanse.com.ng";

const api = axios.create({
  baseURL: API_BASE + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userType");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
