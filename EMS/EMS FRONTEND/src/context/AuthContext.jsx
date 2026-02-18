import React, { createContext, useState, useEffect } from 'react';

// 1. Create the Context
export const AuthContext = createContext(null);

// 2. The Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync state with LocalStorage on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password, role = 'admin') => {
    // HEAD OFFICE AUTH LOGIC (NEW)
    if (role === 'ho' && username === 'headoffice' && password === 'ho123') {
      const hoData = { username: 'Head Office Observer', role: 'ho' };
      setUser(hoData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(hoData));
      return true;
    }

    // MANAGER AUTH LOGIC
    if (role === 'manager' && username === 'manager' && password === 'manager123') {
      const managerData = { username: 'Project Manager', role: 'manager' };
      setUser(managerData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(managerData));
      return true;
    }

    // ADMIN AUTH LOGIC
    if (role === 'admin' && username === 'admin' && password === 'admin123') {
      const adminData = { username: 'Store Admin', role: 'admin' };
      setUser(adminData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(adminData));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    window.location.href = '/'; 
  };

  // Don't render children until we know if the user is logged in from localStorage
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};