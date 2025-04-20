import { useEffect, useState } from 'react';
import { userProfilesApi } from '../api/userProfilesApi';
import UserProfileType from '../types/UserProfileType';

export default function useSearchUsers(query: string) {
  const [results, setResults] = useState<UserProfileType[]>([]);

  useEffect(() => {
    const fetch = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      try {
        const response = await userProfilesApi.search(query);
        setResults(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setResults([]);
      }
    };

    fetch();
  }, [query]);

  return results;
}