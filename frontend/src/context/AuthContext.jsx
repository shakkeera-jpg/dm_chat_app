import { createContext, useContext, useState } from 'react';

import { apiRequest } from '../api/client';

const AuthContext = createContext(null);
const storedUser = localStorage.getItem('relay_user');

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('relay_token'));
  const [currentUser, setCurrentUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  async function authenticate(mode, payload) {
    const result = await apiRequest(`/auth/${mode}`, null, { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('relay_token', result.access);
    localStorage.setItem('relay_user', JSON.stringify(result.user));
    setToken(result.access);
    setCurrentUser(result.user);
  }

  function logout() {
    localStorage.removeItem('relay_token');
    localStorage.removeItem('relay_user');
    setToken(null);
    setCurrentUser(null);
  }

  return <AuthContext.Provider value={{ token, currentUser, authenticate, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
