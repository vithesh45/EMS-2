import axios from "axios";

// 1. Export the URL string so StockContext.jsx can find it
export const BASE_URL = "http://127.0.0.1:8000/api/inventory";

// 2. Keep your axios instance as the default export
const api = axios.create({
  baseURL: BASE_URL, 
});

export default api;