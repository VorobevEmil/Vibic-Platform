import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { SignUpRequest } from '../../types/auth/SignUpType';
import { getAuthErrorMessage } from './getAuthErrorMessage';

export function useSignUp() {
  const navigate = useNavigate();

  const [signUpRequest, setSignUpRequest] = useState<SignUpRequest>({
    displayName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.signUp(signUpRequest);
      navigate('/sign-in?registered=1');
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err);
      setError(msg || 'Не удалось создать аккаунт. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return { signUpRequest, setSignUpRequest, handleRegister, error, isLoading };
}
