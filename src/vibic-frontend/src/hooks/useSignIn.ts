import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('https://localhost:7154/auth/sign-in', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert('Login failed: ' + error.message);
        return;
      }

      navigate('/app');
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    handleSignIn
  };
}