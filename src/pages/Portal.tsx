import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { CheckCircle, XCircle, FileText, Clock, Building, ExternalLink } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Portal: React.FC = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      if (token) {
        // Agora usa a função RPC segura
        const portalData = await api.getPortalData(token);
        setData(portalData);
      }
    } catch (error) {
      console.error(error); // Bom para debug
      alert("Link inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [token]);

  const handleDecision = async (bidId: string, decision: 'Participar' | 'Descartar') => {
    if (!confirm(`Confirmar decisão: ${decision}?`)) return;
    try {
      // Verifica se temos o token na URL
      if (!token) throw new Error("Token de acesso não encontrado.");

      // Passa o token para a API (Isso faltava na versão anterior)
      await api.saveDecision(bidId, decision, token);
      
      await loadData(); 
      alert("Decisão registrada com sucesso!");
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar. Tente atualizar a página.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando...</div>;
  if (!data) return <div className="p-10 text-center">Link inválido ou expirado.</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-blue-700">
          <Building size={24} />
          <h1 className="font-bold text-xl">Portal do Cliente</h1>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{data.client.company}</p>
          <p className="text-xs text-slate-500">Bem-vindo(a), {data.client.name}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* Destaque */}
        {data.bids.map((bid: any) => {
          if (bid.id !== highlightId || bid.decision !== 'Pendente') return null;
          return (
            <div key={bid.id} className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="animate-pulse" /> Ação Necessária
                </h2>
                <span className="text-xs bg-blue-500 px-2 py-1 rounded">Vence em breve</span>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">{bid.title}</h3>
                <p className="text-slate-500 mb-6">Data: {format(parseISO(bid.date), 'dd/MM/yyyy')}</p>
                
                {bid.link_docs && (
                  <a href={bid.link_docs} target="_blank" className="text-blue-600 hover:underline flex items-center justify-center gap-1 mb-8">
                    Ver Edital / Documentos <ExternalLink size={16}/>
                  </a>
                )}

                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => handleDecision(bid.id, 'Participar')}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <CheckCircle /> VAMOS PARTICIPAR
                  </button>
                  <button 
                    onClick={() => handleDecision(bid.id, 'Descartar')}
                    className="bg-white border-2 border-slate-200 text-slate-500 hover:border-red-500 hover:text-red-500 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2"
                  >
                    <XCircle /> Descartar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Histórico */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileText /> Histórico
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Título</th><th className="px-6 py-3">Decisão</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.bids.map((bid: any) => (
                  <tr key={bid.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{format(parseISO(bid.date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 font-medium">{bid.title}</td>
                    <td className="px-6 py-4">
                      {bid.decision === 'Participar' && <span className="text-green-600 font-bold flex gap-1 items-center"><CheckCircle size={14}/> Participar</span>}
                      {bid.decision === 'Descartar' && <span className="text-red-400 font-bold flex gap-1 items-center"><XCircle size={14}/> Descartado</span>}
                      {bid.decision === 'Pendente' && <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">Pendente</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Portal;