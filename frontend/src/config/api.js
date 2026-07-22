// Central API configuration for frontend-backend communication

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export const API = {
  chat: `${API_BASE}/api/chat`,
  stats: `${API_BASE}/api/stats`,
  lessons: `${API_BASE}/api/lessons`,
  transcript: (filePath) => `${API_BASE}/api/transcript?filePath=${encodeURIComponent(filePath)}`,
};
