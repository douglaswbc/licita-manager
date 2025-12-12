import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import UpdatePassword from './pages/auth/UpdatePassword';
import Portal from './pages/Portal';
import Dashboard from './pages/Dashboard';
import Bids from './pages/Bids';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import AdminUsers from './pages/AdminUsers';
import Financial from './pages/Financial';

// Componente auxiliar para redirecionar se já estiver logado
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth(); // <--- Corrigido de 'user' para 'session'
  
  if (loading) return null;
  
  // Se já estiver logado (tem sessão), manda direto pro Dashboard
  if (session) return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          
          {/* Rota Raiz (Landing Page) */}
          <Route path="/" element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          
          {/* Portal do Cliente (Público via Token) */}
          <Route path="/portal/:token" element={<Portal />} />
          
          {/* --- ROTAS PROTEGIDAS (ÁREA LOGADA) --- */}
          <Route element={<ProtectedRoute />}>
             {/* Layout agora envolve as rotas sem forçar o caminho '/' */}
             <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/bids" element={<Bids />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/financial" element={<Financial />} />
                {/* ROTA NOVA DO ADMIN */}
                <Route path="/admin" element={<AdminUsers />} />
             </Route>
          </Route>

          {/* Rota de captura (404) - Se não achar nada, vai pra Landing ou Login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;