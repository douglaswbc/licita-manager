import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Landing from './pages/Landing'; // <--- Nova Página
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import Portal from './pages/Portal';
import Dashboard from './pages/Dashboard';
import Bids from './pages/Bids';
import Clients from './pages/Clients';
import Settings from './pages/Settings';

// Componente auxiliar para redirecionar se já estiver logado
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Se já estiver logado, manda direto pro Dashboard
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rota Inicial (Landing Page) */}
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />

          {/* Autenticação */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Portal do Cliente (Público via Token) */}
          <Route path="/portal/:token" element={<Portal />} />
          
          {/* Área Logada (Sistema) */}
          <Route element={<ProtectedRoute />}>
             <Route path="/" element={<Layout />}>
                {/* Redireciona /dashboard para o Dashboard real */}
                <Route path="dashboard" element={<Dashboard />} />
                {/* Se tentar acessar rotas protegidas sem caminho, cai no dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                <Route path="bids" element={<Bids />} />
                <Route path="clients" element={<Clients />} />
                <Route path="settings" element={<Settings />} />
             </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;