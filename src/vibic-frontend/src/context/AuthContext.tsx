import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { userProfilesApi } from '../api/userProfilesApi';
import { presenceHubConnection, stopRealtimeConnections } from '../services/signalRClient';
import UserProfileType from '../types/UserProfileType';
import {
  PREFERRED_USER_STATUS_STORAGE_KEY,
  isValidUserStatus,
} from '../utils/userStatus';

interface AuthContextType {
  selfUser: UserProfileType | null;
  isLoading: boolean;
  updateSelfUser: (user: UserProfileType) => void;
  logout: () => Promise<void>;
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
  const navigate = useNavigate();
  const [selfUser, setSelfUser] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setSelfUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const user = await userProfilesApi.me();
        setSelfUser(user.data);
      } catch (error) {
        setSelfUser(null);
        console.log('ошибка при получении пользователя', error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUser();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (!selfUser || !token) {
      return;
    }

    const handleStatusChanged = (userId: string, userStatus: number) => {
      setSelfUser((currentUser) => {
        if (!currentUser || currentUser.id !== userId) {
          return currentUser;
        }

        return {
          ...currentUser,
          userStatus,
        };
      });
    };

    const ensurePresenceConnection = async () => {
      presenceHubConnection.off('UserStatusChanged', handleStatusChanged);
      presenceHubConnection.on('UserStatusChanged', handleStatusChanged);

      if (presenceHubConnection.state === 'Disconnected') {
        await presenceHubConnection.start();
      }

      const preferredStatusRaw = localStorage.getItem(PREFERRED_USER_STATUS_STORAGE_KEY);

      if (!preferredStatusRaw) {
        return;
      }

      const preferredStatus = Number(preferredStatusRaw);

      if (!isValidUserStatus(preferredStatus)) {
        localStorage.removeItem(PREFERRED_USER_STATUS_STORAGE_KEY);
        return;
      }

      if (preferredStatus !== 1) {
        await presenceHubConnection.invoke('UpdateStatus', preferredStatus);
      }
    };

    void ensurePresenceConnection();

    return () => {
      presenceHubConnection.off('UserStatusChanged', handleStatusChanged);
    };
  }, [selfUser?.id]);

  useEffect(() => {
    return () => {
      void stopRealtimeConnections();
    };
  }, []);

  const updateSelfUser = (updatedUser: UserProfileType) => {
    setSelfUser(updatedUser);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.warn('logout request failed', error);
    } finally {
      await stopRealtimeConnections();
      localStorage.removeItem('access_token');
      setSelfUser(null);
      navigate('/sign-in', { replace: true });
    }
  };

  return (
    <AuthContext.Provider value={{
      selfUser,
      isLoading,
      updateSelfUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
