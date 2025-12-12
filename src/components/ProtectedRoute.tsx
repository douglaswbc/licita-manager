import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Loader2, Lock } from 'lucide-react';

export const ProtectedRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [checking, setChecking] = useState(true); // Estado para controlar o carregamento do perfil
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      if (!session) return;

      try {
        const profile = await api.getProfile();
        
        if (profile) {
          setUserRole(profile.role);
          // Se active for false, bloqueia. Se for null (antigos), considera true.
          setIsActive(profile.active !== false);
        }
      } catch (error) {
        console.error("Erro ao verificar status", error);
        // Em caso de erro de conexão, por segurança mantemos o estado anterior (ou pode bloquear se preferir)
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkStatus();
    }
  }, [session, authLoading]);

  // 1. Carregando Auth inicial ou Perfil
  if (authLoading || checking) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // 2. Sem sessão -> Login
  if (!session) return <Navigate to="/login" replace />;

  // 3. Usuário Inativo -> Tela de Bloqueio (Com seu WhatsApp)
  if (!isActive) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <Lock className="text-red-600 size-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acesso Bloqueado</h1>
          <p className="text-slate-600 mb-6">
            Sua assinatura está inativa ou expirada. Entre em contato com o administrador para regularizar seu acesso.
          </p>
          <div className="space-y-3">
            <a 
              href="https://wa.me/5591992294869?text=Olá,%20gostaria%20de%20renovar%20o%20acesso%20ao%20sistema%20Licita%20Manager." 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              Falar com Suporte (WhatsApp)
            </a>
            <button 
              onClick={async () => { await api.logout(); navigate('/login'); }}
              className="block w-full text-slate-500 hover:text-slate-800 font-medium py-2"
            >
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Roteamento Inteligente (Cliente vs Admin)
  const isClientRoute = location.pathname.startsWith('/portal');
  
  // Se for CLIENTE tentando acessar rotas que NÃO são do portal -> Manda pro Portal
  if (userRole === 'client' && !isClientRoute) {
    return <Navigate to="/portal" replace />;
  }

  // 5. Tudo certo -> Renderiza o sistema
  return <Outlet />;
};