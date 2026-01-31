/**
 * Authentication Context
 * Manages global authentication state across the application
 * 
 * Features:
 * - Tracks if user is logged in
 * - Stores user information
 * - Provides login/logout/register functions
 * - Automatically checks auth status on app load
 * - Persists authentication across page refreshes
 * 
 * Security:
 * - JWT stored in memory (this context state)
 * - Not in localStorage (vulnerable to XSS)
 * - Token sent in Authorization header
 * 
 * Usage:
 *   const { user, login, logout, isLoading } = useAuth();
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/client';

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wraps your app to provide authentication state
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export const AuthProvider = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize authentication
   * Check if user is already logged in (token in memory or needs refresh)
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to get token from sessionStorage (survives refresh, not tabs)
        const storedToken = sessionStorage.getItem('authToken');
        
        if (storedToken) {
          // Verify token is still valid by fetching user info
          setToken(storedToken);
          
          // Set token for API client
          window.authToken = storedToken;
          
          try {
            const userData = await getMe();
            setUser(userData.data.user);
          } catch (err) {
            // Token invalid or expired, clear it
            console.error('Token validation failed:', err);
            sessionStorage.removeItem('authToken');
            window.authToken = null;
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login with email and password
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - User data
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiLogin({ email, password });
      
      const { token: newToken, user: userData } = response.data;

      // Store token and user
      setToken(newToken);
      setUser(userData);

      // Store token in sessionStorage (survives refresh)
      sessionStorage.setItem('authToken', newToken);
      
      // Make token available globally for API client
      window.authToken = newToken;

      console.log('[Auth] Login successful:', userData.email);

      return userData;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   * 
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @param {string} name - User's full name
   * @returns {Promise<Object>} - User data
   */
  const register = async (email, password, name) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiRegister({ email, password, name });
      
      const { token: newToken, user: userData } = response.data;

      // Store token and user
      setToken(newToken);
      setUser(userData);

      // Store token in sessionStorage
      sessionStorage.setItem('authToken', newToken);
      
      // Make token available globally
      window.authToken = newToken;

      console.log('[Auth] Registration successful:', userData.email);

      return userData;
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google (called after OAuth redirect)
   * 
   * @param {string} googleToken - JWT from Google OAuth callback
   */
  const loginWithGoogle = async (googleToken) => {
    try {
      setToken(googleToken);
      
      // Store token
      sessionStorage.setItem('authToken', googleToken);
      window.authToken = googleToken;

      // Fetch user info - wait for it to complete
      const response = await getMe();
      setUser(response.data.user);
      console.log('[Auth] Google login successful:', response.data.user.email);
      
      return response.data.user;
    } catch (err) {
      console.error('Failed to fetch user after Google login:', err);
      // Clear invalid token
      sessionStorage.removeItem('authToken');
      window.authToken = null;
      setToken(null);
      
      const message = err.message || 'Google login failed';
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Logout user
   * Clears all authentication state
   */
  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);

    // Clear stored token
    sessionStorage.removeItem('authToken');
    window.authToken = null;

    console.log('[Auth] Logout successful');
  };

  /**
   * Refresh user data
   * Useful after profile updates
   */
  const refreshUser = async () => {
    try {
      if (!token) return;

      const userData = await getMe();
      setUser(userData.data.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      // Token might be invalid, logout
      logout();
    }
  };

  // Context value provided to children
  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 * 
 * Usage in components:
 *   const { user, login, logout } = useAuth();
 * 
 * @returns {Object} - Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
