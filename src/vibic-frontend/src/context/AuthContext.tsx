import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';


const AuthContext = createContext<UserProfileType | null>(null);

export function useAuthContext() {
  return useContext(AuthContext);
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

  return (
    <AuthContext.Provider value={selfUser}>
      {children}
    </AuthContext.Provider>
  );
}