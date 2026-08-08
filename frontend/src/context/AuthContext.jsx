import { createContext, useCallback, useContext, useRef, useState } from 'react';

import { apiRequest } from '../api/client';

const AuthContext = createContext(null);
const storedUser = localStorage.getItem('relay_user');

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('relay_token'));
  const [currentUser, setCurrentUser] = useState(storedUser ? JSON.parse(storedUser) : null);
  const refreshRequestRef = useRef(null);

  async function authenticate(mode, payload) {
    const result = await apiRequest(`/auth/${mode}`, null, { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('relay_token', result.access);
    localStorage.setItem('relay_refresh_token', result.refresh);
    localStorage.setItem('relay_user', JSON.stringify(result.user));
    setToken(result.access);
    setCurrentUser(result.user);
  }

  const logout = useCallback(() => {
    localStorage.removeItem('relay_token');
    localStorage.removeItem('relay_refresh_token');
    localStorage.removeItem('relay_user');
    setToken(null);
    setCurrentUser(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshRequestRef.current) return refreshRequestRef.current;
    const refreshToken = localStorage.getItem('relay_refresh_token');
    if (!refreshToken) {
      logout();
      throw new Error('Your session has expired. Please log in again.');
    }
    refreshRequestRef.current = apiRequest('/auth/refresh', null, {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    }).then((result) => {
      localStorage.setItem('relay_token', result.access);
      setToken(result.access);
      return result.access;
    }).catch((error) => {
      logout();
      throw error;
    }).finally(() => { refreshRequestRef.current = null; });
    return refreshRequestRef.current;
  }, [logout]);

  const authenticatedRequest = useCallback(async (path, options = {}) => {
    try {
      return await apiRequest(path, token, options);
    } catch (error) {
      if (error.status !== 401) throw error;
      const renewedToken = await refreshAccessToken();
      return apiRequest(path, renewedToken, options);
    }
  }, [refreshAccessToken, token]);

  return <AuthContext.Provider value={{ token, currentUser, authenticate, logout, refreshAccessToken, authenticatedRequest }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
