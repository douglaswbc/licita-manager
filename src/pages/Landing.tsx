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
  Users,
  CheckCircle
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-[#666666] font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[#002A54] p-1.5 rounded-lg">
                <ShieldCheck className="text-white size-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#002A54]">
                LICITA<span className="text-[#009B4D]">MANAGER</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-sm font-medium text-[#666666] hover:text-[#002A54] transition-colors hidden sm:block"
              >
                Já sou cliente
              </Link>
              <Link 
                to="/login" 
                className="bg-[#002A54] hover:bg-[#001F3F] text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg"
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
          <span className="bg-blue-50 text-[#002A54] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 inline-block border border-blue-100">
            Novo: Módulo Financeiro & Gestão de Contratos
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#002A54] leading-tight mb-6">
            O CRM completo para<br/>
            <span className="text-[#009B4D]">Consultores de Licitações.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#666666] mb-10 max-w-3xl mx-auto leading-relaxed">
            Gerencie prazos, automatize envios, controle contratos de clientes e suas comissões de êxito em um único lugar. Profissionalize sua assessoria hoje.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#precos" 
              className="flex items-center justify-center gap-2 bg-[#009B4D] hover:bg-[#007A3D] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Ver Planos e Preços <ArrowRight size={20} />
            </a>
            <a 
              href="https://wa.me/5591992294869" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#002A54] border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all"
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
            <h2 className="text-3xl font-bold text-[#002A54] mb-4">Tudo o que sua assessoria precisa</h2>
            <p className="text-[#666666] max-w-2xl mx-auto">
              Substitua planilhas e controles manuais por um sistema inteligente que trabalha por você.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#002A54] transition-colors">
                <Clock className="text-[#002A54] group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Robô de Prazos</h3>
              <p className="text-[#666666]">
                Nunca mais perca uma data. O sistema envia e-mails automáticos de lembrete para seus clientes antes do vencimento.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#009B4D] transition-colors">
                <Zap className="text-[#009B4D] group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Portal do Cliente</h3>
              <p className="text-[#666666]">
                Seu cliente recebe um acesso exclusivo para ver o resumo e decidir se participa ou descarta a licitação.
              </p>
            </div>

            {/* Feature 3 (Financeiro) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#009B4D] transition-colors">
                <DollarSign className="text-[#009B4D] group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Gestão Financeira</h3>
              <p className="text-[#666666]">
                Controle honorários fixos e comissões de êxito. Saiba exatamente quanto faturou no mês e o que tem a receber.
              </p>
            </div>

            {/* Feature 4 (Contratos) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                <Users className="text-orange-600 group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Gestão de Contratos</h3>
              <p className="text-[#666666]">
                Cadastro completo de clientes com definição de valores mensais e taxas de comissão personalizadas.
              </p>
            </div>

            {/* Feature 5 (SMTP) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-slate-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#002A54] transition-colors">
                <Settings className="text-[#666666] group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Sua Marca (SMTP)</h3>
              <p className="text-[#666666]">
                Configure seu próprio servidor de e-mail. Seu cliente recebe notificações vindas direto de você.
              </p>
            </div>

            {/* Feature 6 (Dashboard) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-[#002A54] transition-colors">
                <BarChart3 className="text-[#002A54] group-hover:text-white transition-colors size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#002A54]">Dashboard Estratégico</h3>
              <p className="text-[#666666]">
                Acompanhe sua Taxa de Sucesso (Win Rate), volume por cliente e evolução financeira mês a mês.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section className="py-20 bg-[#002A54] text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fluxo de Trabalho Otimizado</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="relative">
              <div className="bg-[#00356B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border border-[#004080]">1</div>
              <h4 className="font-bold text-lg mb-2">Cadastro</h4>
              <p className="text-slate-300 text-sm">Cadastre a oportunidade e defina o cliente responsável.</p>
            </div>
            <div className="relative">
              <div className="bg-[#00356B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border border-[#004080]">2</div>
              <h4 className="font-bold text-lg mb-2">Automação</h4>
              <p className="text-slate-300 text-sm">O sistema avisa o cliente e cobra uma decisão automaticamente.</p>
            </div>
            <div className="relative">
              <div className="bg-[#00356B] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border border-[#004080]">3</div>
              <h4 className="font-bold text-lg mb-2">Execução</h4>
              <p className="text-slate-300 text-sm">Você participa da licitação e atualiza o status em tempo real.</p>
            </div>
            <div className="relative">
              <div className="bg-[#009B4D] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white border border-[#007A3D] shadow-lg">4</div>
              <h4 className="font-bold text-lg mb-2">Faturamento</h4>
              <p className="text-slate-300 text-sm">Ganhou? O sistema calcula sua comissão e atualiza seu financeiro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PREÇOS (NOVA SEÇÃO) --- */}
      <section className="py-20 bg-slate-50 px-4" id="precos">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#002A54] mb-4">Escolha seu plano</h2>
            <p className="text-[#666666]">Comece a usar hoje. Cancele quando quiser.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Plano Mensal */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-[#002A54]">Mensal</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-[#002A54]">R$ 347</span>
                <span className="text-[#666666]">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 text-sm text-[#666666]">
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> Gestão de Clientes Ilimitada</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> Portal do Cliente</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> Financeiro Automático</li>
              </ul>
              <Link to="/signup" className="block w-full py-3 text-center border-2 border-[#002A54] text-[#002A54] font-bold rounded-xl hover:bg-[#002A54] hover:text-white transition-colors">
                Assinar Mensal
              </Link>
            </div>

            {/* Plano Anual */}
            <div className="bg-[#002A54] p-8 rounded-2xl shadow-xl border border-[#002A54] relative transform md:-translate-y-4">
              <div className="absolute top-0 right-0 bg-[#009B4D] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">MAIS POPULAR</div>
              <h3 className="text-xl font-bold text-white">Anual</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-white">R$ 2.997</span>
                <span className="text-blue-200">/ano</span>
              </div>
              <p className="text-blue-200 text-sm mb-6">Equivalente a R$ 249/mês. Economize R$ 1.167/ano.</p>
              <ul className="space-y-3 mb-8 text-sm text-blue-100">
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> Tudo do plano mensal</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> Setup Prioritário</li>
                <li className="flex gap-2"><CheckCircle size={16} className="text-[#009B4D]"/> 2 Meses Grátis</li>
              </ul>
              <Link to="/signup" className="block w-full py-3 text-center bg-[#009B4D] text-white font-bold rounded-xl hover:bg-[#007A3D] transition-colors shadow-lg">
                Assinar Anual (Melhor Oferta)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#002A54] size-6" />
            <span className="font-bold text-[#002A54]">LicitaManager</span>
          </div>
          <div className="text-sm text-[#666666]">
            &copy; {new Date().getFullYear()} LicitaManager. Todos os direitos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-[#666666] hover:text-[#002A54]"><Mail size={20} /></a>
            <a href="#" className="text-[#666666] hover:text-[#002A54]"><Lock size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;