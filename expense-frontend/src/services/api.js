import axios from "axios";

const API = axios.create({
  baseURL: "https://expense-tracker-backend-vpac.onrender.com/api/",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalReq = err.config;

    if (err.response?.status === 401 && !originalReq._retry) {
      originalReq._retry = true;

      const refreshToken = localStorage.getItem("refresh");

      if (refreshToken) {
        try {
          const res = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            { refresh: refreshToken }
          );

          localStorage.setItem("access_token", res.data.access);
          originalReq.headers.Authorization = `Bearer ${res.data.access}`;
          return API(originalReq);
        } catch (refreshError) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      } else {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default API;