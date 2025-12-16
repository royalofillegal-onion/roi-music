
import React, { createContext, useContext, useState } from 'react';

interface LiveAdminContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const LiveAdminContext = createContext<LiveAdminContextType | undefined>(undefined);

export const useLiveAdmin = () => {
  const context = useContext(LiveAdminContext);
  if (!context) {
    throw new Error('useLiveAdmin must be used within a LiveAdminProvider');
  }
  return context;
};

export const LiveAdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (username: string, password: string): boolean => {
    // Simple admin credentials - you can enhance this with proper authentication
    if (username === 'admin' && password === 'royalstar2024') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  return (
    <LiveAdminContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </LiveAdminContext.Provider>
  );
};
