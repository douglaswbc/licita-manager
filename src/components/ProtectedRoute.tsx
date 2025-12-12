import { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Loader2, Lock } from 'lucide-react';

export const ProtectedRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStatus = async () => {
      if (!session) return;

      try {
        const profile = await api.getProfile();
        
        // Se não for admin e não estiver ativo -> BLOQUEIA
        if (profile && profile.role !== 'admin' && profile.active === false) {
          setIsAllowed(false);
        } else {
          setIsAllowed(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status", error);
        // Em caso de erro, por segurança, permite se tiver sessão (ou bloqueia, dependendo do rigor)
        setIsAllowed(true); 
      }
    };

    if (!authLoading) {
      checkStatus();
    }
  }, [session, authLoading]);

  // 1. Carregando Auth inicial
  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  // 2. Sem sessão -> Login
  if (!session) return <Navigate to="/login" replace />;

  // 3. Verificando status do perfil (Active)
  if (isAllowed === null) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  // 4. Usuário Inativo -> Tela de Bloqueio
  if (isAllowed === false) {
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
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
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

  // 5. Tudo certo -> Renderiza o sistema
  return <Outlet />;
};