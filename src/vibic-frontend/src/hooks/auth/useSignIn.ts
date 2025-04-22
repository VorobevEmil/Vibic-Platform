import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export function useSignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authApi.signIn({ email, password });

      const token = response.data.accessToken;
      if (!token) {
        alert('Ошибка: токен не получен');
        return;
      }

      localStorage.setItem('access_token', token);

      navigate('/channels/@me');
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Login failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    handleSignIn
  };
}
