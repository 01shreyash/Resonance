import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');

  // If there is no token, redirect them to the login page immediately
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If they have a token, render the page they asked for
  return <>{children}</>;
}