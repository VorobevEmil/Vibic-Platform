import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');

    if (token) {
      navigate('/channels/@me');
    } else {
      navigate('/sign-in');
    }
  }, [navigate]);

  return null;
}