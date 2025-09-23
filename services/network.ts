import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  //agregar cors si es necesario
    withCredentials: true,
    timeout: 10000, // 10 segundos de timeout
    
});

export default api;
