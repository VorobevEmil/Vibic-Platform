import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  return <Outlet />;
}