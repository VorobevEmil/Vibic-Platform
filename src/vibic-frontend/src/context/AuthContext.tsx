import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';


const AuthContext = createContext<UserProfileType | null>(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfileType | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await userProfilesApi.me();
        setUser(user.data);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {children}
    </AuthContext.Provider>
  );
}