import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { SignUpRequest } from '../../types/auth/SignUpType';

export function useSignUp() {
  const navigate = useNavigate();

  const [signUpRequest, setSignUpRequest] = useState<SignUpRequest>({
    displayName: '',
    username: '',
    email: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.signUp(signUpRequest);

      alert('Account created! 🎉');
      navigate('/sign-in');
    } catch (err: any) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || 'Unknown error';
      alert('Registration failed: ' + message);
    }
  };

  return {
    signUpRequest, setSignUpRequest,
    handleRegister
  };
}