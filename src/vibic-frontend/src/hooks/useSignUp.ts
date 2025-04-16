import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';

export function useSignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.signUp({ username, email, password });

      alert('Account created! 🎉');
      navigate('/sign-in');
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || 'Unknown error';
      alert('Registration failed: ' + message);
    }
  };

  return {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    handleRegister
  };
}