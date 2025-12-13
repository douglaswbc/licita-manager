import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Loader2, Lock, CheckCircle, LogOut } from 'lucide-react';

export const ProtectedRoute = () => {
  const { session, loading: authLoading } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [checking, setChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // COLOQUE SEUS LINKS DA KIWIFI AQUI
  const LINK_CHECKOUT_MENSAL = "https://pay.kiwify.com.br/ASJJYSg";
  const LINK_CHECKOUT_ANUAL = "https://pay.kiwify.com.br/LRJyvBa";

  useEffect(() => {
    const checkStatus = async () => {
      if (!session) return;
      try {
        const profile = await api.getProfile();
        if (profile) {
          setUserRole(profile.role);
          setIsActive(profile.active !== false); // Se active for null ou true, passa. Se false, bloqueia.
        }
      } catch (error) {
        console.error("Erro status", error);
      } finally {
        setChecking(false);
      }
    };
    if (!authLoading) checkStatus();
  }, [session, authLoading]);

  if (authLoading || checking) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#002A54]" /></div>;
  if (!session) return <Navigate to="/login" replace />;

  // --- TELA DE BLOQUEIO / PAGAMENTO (TARJA) ---
  if (!isActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Header Bloqueado - Só tem Logout */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <span className="font-extrabold text-[#002A54] text-xl">LICITA<span className="text-[#009B4D]">MANAGER</span></span>
          <button onClick={async () => { await api.logout(); navigate('/login'); }} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-bold text-sm">
            <LogOut size={16} /> Sair
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
            
            {/* Lado Esquerdo: Mensagem */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-bold text-sm mb-6">
                <Lock size={16} /> Acesso Pendente
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#002A54] mb-4">
                Libere seu acesso completo ao sistema.
              </h1>
              <p className="text-[#666666] text-lg mb-8">
                Sua conta foi criada, mas a assinatura não está ativa. Escolha um plano abaixo para acessar o Dashboard, Gestão de Clientes e Automação de E-mails.
              </p>
              
              <div className="space-y-3 mb-8 hidden md:block">
                <div className="flex items-center gap-3 text-[#002A54] font-medium"><CheckCircle className="text-[#009B4D]" /> Acesso Imediato</div>
                <div className="flex items-center gap-3 text-[#002A54] font-medium"><CheckCircle className="text-[#009B4D]" /> Garantia de 7 dias</div>
                <div className="flex items-center gap-3 text-[#002A54] font-medium"><CheckCircle className="text-[#009B4D]" /> Suporte via WhatsApp</div>
              </div>
            </div>

            {/* Lado Direito: Cards de Pagamento */}
            <div className="space-y-4">
              {/* Card Anual (Destaque) */}
              <div className="bg-white border-2 border-[#009B4D] rounded-xl p-6 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#009B4D] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RECOMENDADO</div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-[#002A54] text-lg">Plano Anual</h3>
                    <p className="text-xs text-[#666666]">Economize R$ 1.167/ano</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm line-through text-slate-400">R$ 4.164</p>
                    <p className="text-2xl font-extrabold text-[#009B4D]">R$ 2.997</p>
                  </div>
                </div>
                <a 
                  href={LINK_CHECKOUT_ANUAL} 
                  target="_blank" 
                  className="block w-full bg-[#009B4D] hover:bg-[#007A3D] text-white text-center font-bold py-3 rounded-lg transition-all shadow-md"
                >
                  Assinar Agora (Anual)
                </a>
              </div>

              {/* Card Mensal */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-[#002A54] text-lg">Plano Mensal</h3>
                    <p className="text-xs text-[#666666]">Cobrança recorrente</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#002A54]">R$ 347</p>
                  </div>
                </div>
                <a 
                  href={LINK_CHECKOUT_MENSAL} 
                  target="_blank" 
                  className="block w-full bg-white border-2 border-[#002A54] text-[#002A54] hover:bg-slate-50 text-center font-bold py-3 rounded-lg transition-all"
                >
                  Assinar Mensal
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Roteamento Cliente vs Admin (Mantido)
  const isClientRoute = location.pathname.startsWith('/portal');
  if (userRole === 'client' && !isClientRoute) return <Navigate to="/portal" replace />;

  return <Outlet />;
};