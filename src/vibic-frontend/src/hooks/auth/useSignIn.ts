import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { SignInRequest } from '../../types/auth/SignInType';
import { getAuthErrorMessage } from './getAuthErrorMessage';

export function useSignIn() {
  const navigate = useNavigate();

  const [signInRequest, setSignInRequest] = useState<SignInRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.signIn(signInRequest);
      const token = response.data.accessToken;

      if (!token) {
        setError('Не удалось получить токен. Попробуйте ещё раз.');
        return;
      }

      localStorage.setItem('access_token', token);
      navigate('/channels/@me');
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err);
      setError(msg || 'Неверный email или пароль.');
    } finally {
      setIsLoading(false);
    }
  };

  return { signInRequest, setSignInRequest, handleSignIn, error, isLoading };
}
