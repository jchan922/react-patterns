import { useState } from 'react';

// HOC: Higher-Order Component for authentication/login status
// Wraps a component and provides authentication functionality
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
      // Check localStorage for existing auth state
      return localStorage.getItem('isAuthenticated') === 'true';
    });

    const login = () => {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
    };

    const logout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
    };

    if (!isAuthenticated) {
      return <Component {...props} isAuthenticated={false} onLogin={login} />;
    }

    return <Component {...props} isAuthenticated={true} onLogout={logout} />;
  };
}
