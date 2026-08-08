export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function errorMessage(data) {
  if (typeof data.detail === 'string') return data.detail;
  const values = Object.values(data).flat(Infinity);
  return values.find((value) => typeof value === 'string') || 'Request failed.';
}

export async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(errorMessage(data));
    error.status = response.status;
    throw error;
  }
  return data;
}
