import { useState, useCallback } from 'react';

// Custom hook for authentication (modern React pattern)
// Preferred over HOC pattern for better transparency and composability
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const login = useCallback(() => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
  }, []);

  return { isAuthenticated, login, logout };
}
