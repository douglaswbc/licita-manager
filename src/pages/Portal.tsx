import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { CheckCircle, XCircle, FileText, Clock, Building, ExternalLink, LogOut, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Portal: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const portalData = await api.getClientPortalData();
      setData(portalData);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar dados. Verifique se seu acesso está ativo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDecision = async (bidId: string, decision: 'Participar' | 'Descartar') => {
    if (!confirm(`Confirmar decisão: ${decision}?`)) return;
    try {
      await api.saveClientDecision(bidId, decision);
      await loadData();
      alert("Decisão registrada!");
    } catch (e) {
      alert("Erro ao salvar.");
    }
  };

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin text-blue-600"><Clock/></div></div>;
  if (!data) return <div className="p-10 text-center">Nenhum dado encontrado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* --- HEADER COM IDENTIFICAÇÃO --- */}
      <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        
        {/* Lado Esquerdo: Logo/Título */}
        <div className="flex items-center gap-2 text-blue-700">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Building size={20} />
          </div>
          <h1 className="font-bold text-lg md:text-xl leading-tight">
            Portal do Cliente
          </h1>
        </div>

        {/* Lado Direito: Identificação e Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            {/* Nome da Empresa (Destaque) */}
            <p className="text-sm font-bold text-slate-800">{data.client.company}</p>
            
            {/* Nome do Contato e Email (Menor) */}
            <div className="flex items-center justify-end gap-1 text-xs text-slate-500">
              <User size={10} />
              <span>{data.client.name}</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">{data.client.email}</p>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <button 
            onClick={handleLogout} 
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            title="Sair do sistema"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        {/* Lista de Licitações - Destaque para Pendentes */}
        {data.bids.map((bid: any) => {
          if (bid.decision !== 'Pendente') return null;
          
          return (
            <div key={bid.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden ring-1 ring-blue-100">
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2"><Clock className="animate-pulse" /> Ação Necessária</h2>
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-bold uppercase tracking-wide">Vence em breve</span>
              </div>
              <div className="p-6 md:p-8 text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-800">{bid.title}</h3>
                <p className="text-slate-500 mb-6 font-medium bg-slate-100 inline-block px-3 py-1 rounded-full text-sm">
                  Data Limite: {format(parseISO(bid.date), 'dd/MM/yyyy')}
                </p>
                
                {bid.link_docs && (
                  <a href={bid.link_docs} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center gap-1 mb-8 font-medium transition-colors">
                    Ver Edital / Documentos <ExternalLink size={16}/>
                  </a>
                )}
                
                <div className="flex justify-center gap-4 flex-wrap">
                  <button onClick={() => handleDecision(bid.id, 'Participar')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                    <CheckCircle /> VAMOS PARTICIPAR
                  </button>
                  <button onClick={() => handleDecision(bid.id, 'Descartar')} className="bg-white border-2 border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg transition-all flex items-center gap-2 w-full md:w-auto justify-center">
                    <XCircle /> Descartar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Histórico */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText /> Histórico de Decisões</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Título</th><th className="px-6 py-3">Decisão</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.bids.map((bid: any) => (
                    <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600">{format(parseISO(bid.date), 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{bid.title}</td>
                      <td className="px-6 py-4">
                        {bid.decision === 'Participar' && <span className="text-green-700 bg-green-50 px-2 py-1 rounded-md font-bold text-xs flex w-fit gap-1 items-center"><CheckCircle size={12}/> Participar</span>}
                        {bid.decision === 'Descartar' && <span className="text-red-700 bg-red-50 px-2 py-1 rounded-md font-bold text-xs flex w-fit gap-1 items-center"><XCircle size={12}/> Descartado</span>}
                        {bid.decision === 'Pendente' && <span className="text-yellow-700 bg-yellow-50 px-2 py-1 rounded-md font-bold text-xs flex w-fit gap-1 items-center"><Clock size={12}/> Pendente</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portal;