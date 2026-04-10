import { useEffect, useState } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';

export default function useSearchUsers(query: string) {
  const [results, setResults] = useState<UserProfileType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await userProfilesApi.search(query);
        setResults(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    void fetch();
  }, [query]);

  return {
    results,
    isLoading,
  };
}
