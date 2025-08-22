
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Changed admin password to 222444
const ADMIN_PASSWORD = "222444";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if admin is already logged in from localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem("musicApp_isAdmin");
    if (adminStatus === "true") {
      setIsAdmin(true);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("musicApp_isAdmin", "true");
      toast.success("Admin login successful");
      return true;
    } else {
      toast.error("Invalid admin password");
      return false;
    }
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem("musicApp_isAdmin");
    toast.info("Admin logged out");
    navigate("/");
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
