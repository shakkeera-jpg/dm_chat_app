export const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
    throw new Error(Object.values(data).flat().join(' ') || data.detail || 'Request failed.');
  }
  return data;
}
