import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Settings as SettingsIcon, LogOut, Menu, X, Shield, Wallet, UserCircle } from 'lucide-react';
import { api } from '../services/api';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      active 
        ? 'bg-[#009B4D] text-white shadow-md' // <--- VERDE DA MARCA (Item Ativo)
        : 'text-slate-300 hover:bg-[#00356B] hover:text-white' // Hover um pouco mais claro que o fundo
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
      const profile = await api.getProfile();
      if (profile?.role === 'admin') setIsAdmin(true);
      const session = await api.getSession();
      if (session?.user?.email) setUserEmail(session.user.email);
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
        <span className="text-xl font-bold tracking-tight">LicitaManager</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar - AZUL DA MARCA */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#002A54] text-white transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        pt-16 md:pt-0 border-r border-[#001F3F]
        `}
      >
        <div className="p-6 hidden md:block">
          {/* Logo Texto */}
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            LICITA<span className="text-[#009B4D]">MANAGER</span>
          </h1>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Gestão Estratégica</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
            />
          ))}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-[#001F3F]">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="bg-[#00356B] p-2 rounded-full text-white">
              <UserCircle size={24} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {isAdmin ? 'Administrador' : 'Assessor'}
              </p>
              <p className="text-xs text-slate-400 truncate" title={userEmail}>
                {userEmail || '...'}
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
      <main className="flex-1 w-full overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;