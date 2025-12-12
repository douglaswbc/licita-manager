import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Zap, 
  BarChart3, 
  ArrowRight, 
  Mail,
  Lock,
  DollarSign,
  Settings,
  Users
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ShieldCheck className="text-white size-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">LicitaManager</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden sm:block"
              >
                Já sou cliente
              </Link>
              <Link 
                to="/login" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg"
              >
                Acessar Sistema
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-white to-slate-100">
        <div className="max-w-5xl mx-auto text-center">
          <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block">
            Diga adeus às planilhas.
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            O CRM completo para<br/>
            <span className="text-blue-600">Consultores de Licitações.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Gerencie prazos, automate envios, controle contratos de clientes e suas comissões de êxito em um único lugar. Profissionalize sua assessoria hoje.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Começar Agora <ArrowRight size={20} />
            </Link>
            <a 
              href="https://wa.me/5591992294869?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20LicitaManager." 
              target="_blank" 
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* --- CARACTERÍSTICAS (GRID 2x3) --- */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tudo o que sua assessoria precisa</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Substitua planilhas e controles manuais por um sistema inteligente que trabalha por você.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <Clock className="text-blue-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Robô de Prazos</h3>
              <p className="text-slate-600">
                Nunca mais perca uma data. O sistema envia e-mails automáticos de lembrete para seus clientes antes do vencimento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <Zap className="text-purple-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Portal do Cliente</h3>
              <p className="text-slate-600">
                Seu cliente recebe um "Link Mágico" para acessar o resumo e decidir se participa ou descarta a licitação. Sem senhas.
              </p>
            </div>

            {/* Feature 3 (Financeiro) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                <DollarSign className="text-green-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestão Financeira</h3>
              <p className="text-slate-600">
                Controle honorários fixos e comissões de êxito. Saiba exatamente quanto faturou no mês e o que tem a receber.
              </p>
            </div>

            {/* Feature 4 (Contratos) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                <Users className="text-orange-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gestão de Contratos</h3>
              <p className="text-slate-600">
                Cadastro completo de clientes com definição de valores mensais e taxas de comissão personalizadas.
              </p>
            </div>

            {/* Feature 5 (SMTP) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-slate-800 transition-colors">
                <Settings className="text-slate-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Sua Marca (SMTP)</h3>
              <p className="text-slate-600">
                Configure seu próprio servidor de e-mail (Gmail, Outlook, etc). Seu cliente recebe notificações vindas direto de você.
              </p>
            </div>

            {/* Feature 6 (Dashboard) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <BarChart3 className="text-indigo-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dashboard Estratégico</h3>
              <p className="text-slate-600">
                Acompanhe sua Taxa de Sucesso (Win Rate), volume por cliente e evolução financeira mês a mês em gráficos visuais.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section className="py-20 bg-slate-900 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fluxo de Trabalho Otimizado</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">1</div>
              <h4 className="font-bold text-lg mb-2">Cadastro</h4>
              <p className="text-slate-400 text-sm">Cadastre a oportunidade e defina o cliente responsável.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">2</div>
              <h4 className="font-bold text-lg mb-2">Automação</h4>
              <p className="text-slate-400 text-sm">O sistema avisa o cliente e cobra uma decisão automaticamente.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">3</div>
              <h4 className="font-bold text-lg mb-2">Execução</h4>
              <p className="text-slate-400 text-sm">Você participa da licitação e atualiza o status em tempo real.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-green-400 border border-slate-700">4</div>
              <h4 className="font-bold text-lg mb-2">Faturamento</h4>
              <p className="text-slate-400 text-sm">Ganhou? O sistema calcula sua comissão e atualiza seu financeiro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600 size-6" />
            <span className="font-bold text-slate-900">LicitaManager</span>
          </div>
          <div className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LicitaManager. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-slate-400 hover:text-blue-600"><Mail size={20} /></a>
            <a href="#" className="text-slate-400 hover:text-blue-600"><Lock size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;