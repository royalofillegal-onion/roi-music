
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";

interface LiveAdminContextType {
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const LiveAdminContext = createContext<LiveAdminContextType | undefined>(undefined);

const ADMIN_USERNAME = "royalofillegal$$";
const ADMIN_PASSWORD = "$$royalstarofillegal";

export function LiveAdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      toast.success("Admin access granted");
      return true;
    } else {
      toast.error("Invalid admin credentials");
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    toast.info("Admin logged out");
  };

  return (
    <LiveAdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </LiveAdminContext.Provider>
  );
}

export function useLiveAdmin() {
  const context = useContext(LiveAdminContext);
  if (context === undefined) {
    throw new Error("useLiveAdmin must be used within a LiveAdminProvider");
  }
  return context;
}
