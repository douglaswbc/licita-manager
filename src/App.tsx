import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
// 1. IMPORTAR TOASTIFY
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Bids from './pages/Bids';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import AdminUsers from './pages/AdminUsers';
import Financial from './pages/Financial';
import Landing from './pages/Landing';
import ClientPortal from './pages/Portal';
import Layout from './components/Layout';
import Kanban from './pages/Kanban';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 2. ADICIONAR O CONTAINER AQUI (Pode ser antes ou depois das rotas) */}
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<div>Em breve</div>} />

          {/* ROTAS PROTEGIDAS */}
          <Route element={<ProtectedRoute />}>
             <Route path="/portal" element={<ClientPortal />} />
             
             <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/kanban" element={<Kanban />} />
                <Route path="/bids" element={<Bids />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/financial" element={<Financial />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<AdminUsers />} />
             </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;