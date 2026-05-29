import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token in URL hash (from Google redirect)
    const hash = window.location.hash;
    let storedToken = localStorage.getItem('auth_token');

    if (hash.includes('access_token=')) {
      const urlParams = new URLSearchParams(hash.replace('#', '?'));
      const newToken = urlParams.get('access_token');
      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        storedToken = newToken;
        window.history.replaceState(null, '', window.location.pathname); // clear hash
      }
    }

    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token invalid or expired
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9000';
    window.location.href = `${apiUrl}/auth/google/login`;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
