// src/api.js
import axios from 'axios';

// 1️⃣ URL từ biến môi trường
const NODE_URL = import.meta.env.VITE_BACKEND_URL;   // Node/Express backend
const FLASK_URL = import.meta.env.VITE_FLASK_URL;   // Flask AI service

// 2️⃣ Gọi NodeJS để tạo journal
export const createJournal = (data, token) => {
  return axios.post(`${NODE_URL}/api/journals`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 3️⃣ Gọi Flask để phân tích cảm xúc
export const analyzeEmotion = (content) => {
  return axios.post(`${FLASK_URL}/analyze`, { content });
};
