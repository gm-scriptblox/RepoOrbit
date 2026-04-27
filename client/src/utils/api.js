import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("reporbit_session");
      localStorage.removeItem("reporbit_user");
    }
    return Promise.reject(error);
  }
);

export default api;