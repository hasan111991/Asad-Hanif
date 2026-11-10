import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '../types';
import { defaultAdminUsers } from '../data/constituencyData';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  login: (email: string, role?: AdminRole) => boolean;
  logout: () => void;
  hasRole: (requiredRoles: AdminRole[]) => boolean;
  allStaff: AdminUser[];
  updateStaffRole: (id: string, newRole: AdminRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
  hasRole: () => false,
  allStaff: [],
  updateStaffRole: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('pp203_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [allStaff, setAllStaff] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('pp203_all_staff');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultAdminUsers;
      }
    }
    return defaultAdminUsers;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('pp203_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('pp203_admin_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('pp203_all_staff', JSON.stringify(allStaff));
  }, [allStaff]);

  const login = (email: string, role?: AdminRole): boolean => {
    // Match existing staff or authenticate
    let staff = allStaff.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (!staff) {
      staff = {
        id: `adm-${Date.now()}`,
        email,
        displayName: email.split('@')[0].toUpperCase(),
        role: role || 'Super Admin',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString()
      };
      setAllStaff(prev => [...prev, staff!]);
    } else {
      staff = { ...staff, lastLogin: new Date().toISOString() };
      setAllStaff(prev => prev.map(s => s.id === staff!.id ? staff! : s));
    }
    setCurrentUser(staff);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasRole = (requiredRoles: AdminRole[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Admin') return true;
    return requiredRoles.includes(currentUser.role);
  };

  const updateStaffRole = (id: string, newRole: AdminRole) => {
    if (currentUser?.role !== 'Super Admin') return;
    setAllStaff(prev => prev.map(s => s.id === id ? { ...s, role: newRole } : s));
    if (currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, role: newRole } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        hasRole,
        allStaff,
        updateStaffRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
