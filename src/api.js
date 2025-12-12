import axios from "axios";

const api = axios.create({
  baseURL: "/api", // ← This is the key!
  withCredentials: true,
});

export default api;
