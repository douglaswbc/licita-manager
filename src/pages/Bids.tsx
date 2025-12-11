import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, ExternalLink, MoreHorizontal, FileText, Send, Loader2, ThumbsUp, ThumbsDown, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Bid, BidStatus, Client } from '../types';
import Modal from '../components/Modal';
import { format, parseISO } from 'date-fns';

const StatusBadge = ({ status }: { status: BidStatus }) => {
  const styles = {
    [BidStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BidStatus.WAITING_CLIENT]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BidStatus.WAITING_BID]: 'bg-purple-100 text-purple-800 border-purple-200',
    [BidStatus.WON]: 'bg-green-100 text-green-800 border-green-200',
    [BidStatus.LOST]: 'bg-red-100 text-red-800 border-red-200',
    [BidStatus.DISCARDED]: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
};

const DecisionBadge = ({ decision }: { decision?: string }) => {
  if (decision === 'Participar') {
    return <span className="flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100"><ThumbsUp size={12}/> Participar</span>;
  }
  if (decision === 'Descartar') {
    return <span className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100"><ThumbsDown size={12}/> Descartar</span>;
  }
  return <span className="flex items-center gap-1 text-slate-400 text-xs"><Clock size={12}/> Aguardando</span>;
};

const Bids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [summaryBid, setSummaryBid] = useState<Bid | null>(null);

  const { register, handleSubmit, reset, setValue } = useForm<Bid>();
  const summaryForm = useForm<{ summary_link: string }>();

  const loadData = async () => {
    try {
      const [bidsData, clientsData] = await Promise.all([
        api.getBids(),
        api.getClients()
      ]);
      setBids(bidsData);
      setClients(clientsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openFormModal = (bid?: Bid) => {
    if (bid) {
      setEditingBid(bid);
      setValue('title', bid.title);
      setValue('client_id', bid.client_id);
      setValue('date', bid.date ? bid.date.substring(0, 10) : ''); 
      setValue('link_docs', bid.link_docs);
      setValue('status', bid.status);
    } else {
      setEditingBid(null);
      reset({ title: '', status: BidStatus.PENDING, link_docs: '' });
      setValue('date', new Date().toISOString().substring(0, 10));
    }
    setIsFormModalOpen(true);
  };

  const openSummaryModal = (bid: Bid) => {
    setSummaryBid(bid);
    // --- CORREÇÃO AQUI ---
    // Se já tiver link de resumo, usa ele.
    // Se não tiver, puxa automaticamente o Link dos Docs (Edital) para facilitar.
    const linkParaUsar = bid.summary_link || bid.link_docs || '';
    
    summaryForm.setValue('summary_link', linkParaUsar);
    setIsSummaryModalOpen(true);
  };

  const onFormSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        id: editingBid ? editingBid.id : undefined,
        date: new Date(data.date).toISOString(),
      };
      await api.saveBid(payload);
      await loadData();
      setIsFormModalOpen(false);
    } catch (e) {
      alert("Erro ao salvar licitação.");
    }
  };

  const onSummarySubmit = async (data: { summary_link: string }) => {
    if (!summaryBid) return;
    try {
      const updatedBid = {
        ...summaryBid,
        summary_link: data.summary_link,
        summary_sent_at: new Date().toISOString(), // Marca que foi enviado para a fila
      };
      await api.saveBid(updatedBid);
      await loadData();
      setIsSummaryModalOpen(false);
      alert('Resumo salvo! O e-mail será enviado na próxima execução da automação.');
    } catch (e) {
      alert("Erro ao salvar resumo.");
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Licitações</h1>
        <button 
          onClick={() => openFormModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Nova Licitação
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Data</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Título</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Cliente</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status Interno</th>
                <th className="px-6 py-4 font-semibold text-slate-700 bg-blue-50/50 border-l border-blue-100">Decisão Cliente</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Docs</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bids.map((bid) => {
                const clientName = bid.client_name || clients.find(c => c.id === bid.client_id)?.company || 'Unknown';
                return (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                      {bid.date ? format(parseISO(bid.date), 'dd/MM/yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{bid.title}</td>
                    <td className="px-6 py-4 text-slate-600">{clientName}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={bid.status} />
                    </td>
                    
                    <td className="px-6 py-4 bg-blue-50/30 border-l border-blue-50">
                      <DecisionBadge decision={bid.decision} />
                      {bid.decision_at && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          {format(parseISO(bid.decision_at), 'dd/MM HH:mm')}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {bid.link_docs && (
                        <a href={bid.link_docs} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                          Link <ExternalLink size={12} />
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openSummaryModal(bid)}
                          title="Enviar Agora (Resumo)"
                          className={`p-2 rounded-lg transition-colors ${bid.summary_sent_at ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}
                        >
                          <Send size={16} />
                        </button>
                        <button 
                          onClick={() => openFormModal(bid)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modais omitidos para brevidade, mas o Modal de Resumo (summaryForm) foi ajustado na função openSummaryModal acima */}
      
      <Modal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
        title={editingBid ? 'Editar Licitação' : 'Nova Licitação'}
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input {...register('title', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Construção Ponte" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select {...register('client_id', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Limite</label>
              <input type="date" {...register('date', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link do Edital/Docs</label>
            <input {...register('link_docs')} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status Interno</label>
            <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white">
              <option value={BidStatus.PENDING}>Pendente</option>
              <option value={BidStatus.WON}>Ganha</option>
              <option value={BidStatus.LOST}>Perdida</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Link do Resumo">
        <form onSubmit={summaryForm.handleSubmit(onSummarySubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Link do Documento de Resumo</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input {...summaryForm.register('summary_link', { required: true })} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg outline-none" placeholder="https://drive.google.com/..." />
            </div>
            <p className="text-xs text-slate-500 mt-1">Se deixar vazio, usarei o link do edital.</p>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"><Send size={16} /> Salvar e Aguardar Envio</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Bids;