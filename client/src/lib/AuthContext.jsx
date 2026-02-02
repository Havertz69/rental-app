import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true for initial auth check
  const [authError, setAuthError] = useState(null);

  // Function to refresh token
  const refreshToken = async () => {
    try {
      const tokens = localStorage.getItem('authTokens');
      if (!tokens) return false;
      
      const parsedTokens = JSON.parse(tokens);
      if (!parsedTokens.refresh) return false;
      
      const response = await fetch('http://localhost:8000/api/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: parsedTokens.refresh })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authTokens', JSON.stringify({
          access: data.access,
          refresh: parsedTokens.refresh
        }));
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    // If refresh fails, clear tokens
    localStorage.removeItem('authTokens');
    return false;
  };

  // Function to get user data with token refresh
  const getUserData = async () => {
    try {
      const tokens = localStorage.getItem('authTokens');
      if (!tokens) {
        return null;
      }
      
      let response = await fetch('http://localhost:8000/api/auth/me/', {
        headers: {
          'Authorization': `Bearer ${JSON.parse(tokens).access}`,
          'Content-Type': 'application/json'
        }
      });
      
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // Retry with new token
          const newTokens = localStorage.getItem('authTokens');
          response = await fetch('http://localhost:8000/api/auth/me/', {
            headers: {
              'Authorization': `Bearer ${JSON.parse(newTokens).access}`,
              'Content-Type': 'application/json'
            }
          });
        }
      }
      
      if (response.ok) {
        const userData = await response.json();
        return userData;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      setAuthError(null);
      setLoading(true);
      try {
        const userData = await getUserData();
        if (userData?.email || userData?.id) {
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        setAuthError(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/auth/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: credentials.email,
          username: credentials.email, // Send email as username for compatibility
          password: credentials.password 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.access) {
        // Store tokens
        localStorage.setItem('authTokens', JSON.stringify({ 
          access: data.access, 
          refresh: data.refresh 
        }));
        
        // Get user info
        try {
          const userData = await getUserData();
          
          if (userData) {
            setUser(userData);
            return { success: true, user: userData };
          } else {
            // Clear tokens if we can't get user data
            localStorage.removeItem('authTokens');
            setUser(null);
            return { success: false, error: 'Failed to retrieve user information' };
          }
        } catch (userError) {
          console.error('Failed to get user data:', userError);
          localStorage.removeItem('authTokens');
          setUser(null);
          return { success: false, error: 'Failed to retrieve user information' };
        }
      } else {
        return { success: false, error: data.detail || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthError(null);
    localStorage.removeItem('authTokens');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isLoadingAuth: loading,
    isLoadingPublicSettings: false,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
