import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = () => {
  const { session } = useAuth();

  // Se não tem sessão, chuta para o Login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Se tem sessão, deixa renderizar a página (Outlet)
  return <Outlet />;
};