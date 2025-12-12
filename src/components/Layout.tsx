import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings as SettingsIcon, LogOut, Menu, X, Shield, Wallet, UserCircle, Trello } from 'lucide-react';
import { api } from '../services/api';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
  onClick?: () => void; // Adicionado para fechar menu mobile ao clicar
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      active 
        ? 'bg-[#009B4D] text-white shadow-md' // VERDE DA MARCA
        : 'text-slate-300 hover:bg-[#00356B] hover:text-white'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const Layout: React.FC = () => { 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const profile = await api.getProfile();
        if (profile?.role === 'admin') setIsAdmin(true);
        const session = await api.getSession();
        if (session?.user?.email) setUserEmail(session.user.email);
      } catch (error) {
        console.error("Erro ao carregar usuário no layout", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/kanban', label: 'Fluxo (Kanban)', icon: Trello },
    { path: '/bids', label: 'Licitações', icon: FileText },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/financial', label: 'Financeiro', icon: Wallet },
    { path: '/settings', label: 'Configurações', icon: SettingsIcon },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Gestão de Assessores', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Header - AZUL DA MARCA */}
      <div className="md:hidden fixed top-0 w-full bg-[#002A54] text-white z-50 flex items-center justify-between p-4 shadow-md">
        <div className="flex items-center gap-2">
           {/* Ícone opcional no mobile */}
           <Shield size={20} className="text-[#009B4D]" />
           <span className="text-xl font-bold tracking-tight">LicitaManager</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 rounded hover:bg-[#00356B]">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - AZUL DA MARCA */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#002A54] text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        pt-16 md:pt-0 border-r border-[#001F3F]
        `}
      >
        <div className="p-6 hidden md:block">
          {/* Logo Texto */}
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            LICITA<span className="text-[#009B4D]">MANAGER</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Gestão Estratégica</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => setIsMobileMenuOpen(false)} // Fecha menu ao clicar no mobile
            />
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-[#001F3F] mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="bg-[#00356B] p-2 rounded-full text-white min-w-[40px] flex justify-center">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {isAdmin ? 'Administrador' : 'Assessor'}
              </p>
              <p className="text-xs text-slate-400 truncate" title={userEmail}>
                {userEmail || 'Carregando...'}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-300 hover:text-white hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 bg-slate-50 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Overlay for mobile - Fecha ao clicar fora */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;