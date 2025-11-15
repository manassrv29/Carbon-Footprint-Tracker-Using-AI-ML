import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'corporate';
  organizationId?: number;
  level: number;
  ecoPoints: number;
  streak: number;
  totalCo2Saved: number;
  dailyTarget: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: 'user' | 'corporate';
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'corporate';
  organizationId?: number;
  organizationName?: string;
  organizationDomain?: string;
  organizationIndustry?: string;
  organizationSize?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const { user: userData, tokens } = data.data;
      
      setUser(userData);
      setToken(tokens.accessToken);
      
      // Store in localStorage
      localStorage.setItem('auth_token', tokens.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Redirect based on role
      const redirectTo = data.data.redirectTo;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        // Fallback redirect based on user role
        const fallbackRedirect = userData.role === 'corporate' ? '/corporate/home' : '/user/home';
        navigate(fallbackRedirect, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      const { user: userData, tokens } = responseData.data;
      
      setUser(userData);
      setToken(tokens.accessToken);
      
      // Store in localStorage
      localStorage.setItem('auth_token', tokens.accessToken);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      // Redirect based on role
      const redirectTo = responseData.data.redirectTo;
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else {
        // Fallback redirect based on user role
        const fallbackRedirect = userData.role === 'corporate' ? '/corporate/home' : '/user/home';
        navigate(fallbackRedirect, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    
    // Remove from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Redirect to home
    navigate('/', { replace: true });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
