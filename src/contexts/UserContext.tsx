import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'user' | 'admin' | 'superadmin';

interface UserContextType {
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  setRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('user');

  return (
    <UserContext.Provider value={{ 
      role, 
      isAdmin: role === 'admin' || role === 'superadmin',
      isSuperAdmin: role === 'superadmin',
      setRole 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}