import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Clock, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  ArrowRight, 
  Mail,
  Lock
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
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
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
            Gestão de Licitações 2.0
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Diga adeus às planilhas.<br/>
            <span className="text-blue-600">Automatize sua Assessoria.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Um sistema inteligente que avisa prazos, envia resumos e coleta a decisão do seu cliente automaticamente. Tudo integrado, tudo seguro.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Começar Agora <ArrowRight size={20} />
            </Link>
            <a 
              href="https://wa.me/5591992294869" 
              target="_blank" 
              className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold transition-all"
            >
              Falar com Especialista
            </a>
          </div>
        </div>
      </section>

      {/* --- CARACTERÍSTICAS (FEATURES) --- */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Por que escolher o LicitaManager?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Substituímos o caos manual por um fluxo de trabalho automatizado e profissional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Clock className="text-blue-600 size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Robô de Prazos</h3>
              <p className="text-slate-600">
                Nunca mais perca uma data. Nosso sistema envia e-mails automáticos para seus clientes 2 dias antes do vencimento da licitação.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="text-purple-600 size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Portal do Cliente</h3>
              <p className="text-slate-600">
                Seu cliente recebe um "Link Mágico". Ele acessa, vê o resumo e clica em 
                <strong className="text-green-600"> Participar</strong> ou 
                <strong className="text-red-500"> Descartar</strong>. Sem senhas, sem complicação.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="text-green-600 size-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Dashboard em Tempo Real</h3>
              <p className="text-slate-600">
                Saiba exatamente quantas licitações estão pendentes com o cliente, quantas foram ganhas e tenha controle total do seu funil.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- COMO FUNCIONA --- */}
      <section className="py-20 bg-slate-900 text-white px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fluxo de Trabalho Simplificado</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">1</div>
              <h4 className="font-bold text-lg mb-2">Cadastro</h4>
              <p className="text-slate-400 text-sm">Você cadastra a licitação e o link do edital no sistema.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">2</div>
              <h4 className="font-bold text-lg mb-2">Notificação</h4>
              <p className="text-slate-400 text-sm">O robô envia o resumo e o lembrete por e-mail para o cliente.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">3</div>
              <h4 className="font-bold text-lg mb-2">Decisão</h4>
              <p className="text-slate-400 text-sm">O cliente clica em "Participar" ou "Descartar" no Portal exclusivo.</p>
            </div>
            <div className="relative">
              <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-blue-400 border border-slate-700">4</div>
              <h4 className="font-bold text-lg mb-2">Ação</h4>
              <p className="text-slate-400 text-sm">Você recebe a resposta no painel e prepara a documentação.</p>
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