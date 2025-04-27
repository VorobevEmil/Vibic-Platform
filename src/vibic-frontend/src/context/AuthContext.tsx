import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';

interface AuthContextType {
  selfUser: UserProfileType | null;
  updateSelfUser: (user: UserProfileType) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [selfUser, setSelfUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userProfilesApi.me();
        setSelfUser(user.data);
      } catch {
        setSelfUser(null);
      }
    };
    loadUser();
  }, []);

  const updateSelfUser = (updatedUser: UserProfileType) => {
    setSelfUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ selfUser, updateSelfUser }}>
      {children}
    </AuthContext.Provider>
  );
}