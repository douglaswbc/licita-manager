import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Plus, ExternalLink, MoreHorizontal, FileText, Send, Loader2, ThumbsUp, ThumbsDown, Clock, Filter, X, DollarSign, Percent, Calculator } from 'lucide-react';
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
  
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDecision, setFilterDecision] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [summaryBid, setSummaryBid] = useState<Bid | null>(null);

  // --- CORREÇÃO AQUI: shouldUnregister: false ---
  // Isso impede que o valor suma quando o campo está escondido (status != Won)
  const { register, handleSubmit, reset, setValue, control } = useForm<Bid>({
    shouldUnregister: false 
  });
  
  const summaryForm = useForm<{ summary_link: string }>();

  // Hook personalizado para o Select de Clientes
  const { onChange: onClientChange, ...clientRegisterRest } = register('client_id', { required: true });

  const watchedStatus = useWatch({ control, name: 'status' });
  const watchedValue = useWatch({ control, name: 'final_value' }) || 0;
  const watchedRate = useWatch({ control, name: 'commission_rate' }) || 0;
  
  // Cálculo de comissão
  const calculatedCommission = (Number(watchedValue) * Number(watchedRate)) / 100;

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

  const filteredBids = bids.filter(bid => {
    const matchesClient = filterClient ? bid.client_id === filterClient : true;
    const matchesStatus = filterStatus ? bid.status === filterStatus : true;
    const bidDecision = bid.decision || 'Pendente';
    const matchesDecision = filterDecision ? bidDecision === filterDecision : true;
    return matchesClient && matchesStatus && matchesDecision;
  });

  const clearFilters = () => {
    setFilterClient('');
    setFilterStatus('');
    setFilterDecision('');
  };

  const openFormModal = (bid?: Bid) => {
    if (bid) {
      setEditingBid(bid);
      setValue('title', bid.title);
      setValue('client_id', bid.client_id);
      setValue('date', bid.date ? bid.date.substring(0, 10) : ''); 
      setValue('link_docs', bid.link_docs);
      setValue('status', bid.status);
      setValue('final_value', bid.final_value || 0);
      setValue('commission_rate', bid.commission_rate || 0);
    } else {
      setEditingBid(null);
      reset({ title: '', status: BidStatus.PENDING, link_docs: '', final_value: 0, commission_rate: 0 });
      setValue('date', new Date().toISOString().substring(0, 10));
    }
    setIsFormModalOpen(true);
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // 1. Notifica o hook form da mudança
    onClientChange(e);

    // 2. Lógica para puxar a % do cliente automaticamente
    if (!editingBid) {
      const clientId = e.target.value;
      const client = clients.find(c => c.id === clientId);
      
      if (client) {
        console.log("Cliente selecionado:", client.name, "Taxa:", client.commission_rate);
        // Preenche o campo (mesmo que esteja escondido, agora o valor fica salvo!)
        setValue('commission_rate', Number(client.commission_rate) || 0);
      }
    }
  };

  const openSummaryModal = (bid: Bid) => {
    setSummaryBid(bid);
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
        final_value: Number(data.final_value),
        commission_rate: Number(data.commission_rate)
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
    
    // Toast de carregamento
    const idToast = toast.loading("Enviando resumo por e-mail...");

    try {
      // 1. Salva no banco primeiro (para garantir que temos o link salvo)
      const updatedBid = {
        ...summaryBid,
        summary_link: data.summary_link,
        // Não marcamos a data aqui, a Edge Function marca se der certo o envio
      };
      await api.saveBid(updatedBid);

      // 2. Chama a Edge Function para disparar o e-mail AGORA
      await api.sendSummaryEmail(summaryBid.id, data.summary_link);

      await loadData(); // Recarrega a tabela para mostrar o ícone verde
      setIsSummaryModalOpen(false);
      
      toast.update(idToast, { 
        render: "Resumo enviado com sucesso!", 
        type: "success", 
        isLoading: false, 
        autoClose: 3000 
      });

    } catch (e: any) {
      console.error(e);
      toast.update(idToast, { 
        render: `Erro: ${e.message}`, 
        type: "error", 
        isLoading: false, 
        autoClose: 5000 
      });
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Licitações</h1>
        <button 
          onClick={() => openFormModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Nova Licitação
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end md:items-center">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <Filter size={18} />
          <span>Filtros:</span>
        </div>
        
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-auto outline-none">
          <option value="">Todos os Clientes</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-auto outline-none">
          <option value="">Todos Status</option>
          {Object.values(BidStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={filterDecision} onChange={(e) => setFilterDecision(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm w-full md:w-auto outline-none">
          <option value="">Todas Decisões</option>
          <option value="Pendente">Pendente</option>
          <option value="Participar">Participar</option>
          <option value="Descartar">Descartar</option>
        </select>

        {(filterClient || filterStatus || filterDecision) && (
          <button onClick={clearFilters} className="text-red-500 text-sm flex items-center gap-1 hover:text-red-700 font-medium"><X size={16} /> Limpar</button>
        )}
        
        <div className="ml-auto text-xs text-slate-400">Encontrados: <strong>{filteredBids.length}</strong></div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Data</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Título</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Cliente</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 bg-blue-50/50 border-l border-blue-100">Decisão</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Resultado (R$)</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBids.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Nada encontrado.</td></tr>
              ) : (
                filteredBids.map((bid) => {
                  const clientName = bid.client_name || clients.find(c => c.id === bid.client_id)?.company || 'Unknown';
                  const commissionValue = (bid.final_value && bid.commission_rate) ? (bid.final_value * bid.commission_rate / 100) : 0;
                  
                  return (
                    <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{bid.date ? format(parseISO(bid.date), 'dd/MM/yyyy') : '-'}</td>
                      <td className="px-6 py-4 text-slate-900 font-medium">{bid.title}</td>
                      <td className="px-6 py-4 text-slate-600">{clientName}</td>
                      <td className="px-6 py-4"><StatusBadge status={bid.status} /></td>
                      <td className="px-6 py-4 bg-blue-50/30 border-l border-blue-50"><DecisionBadge decision={bid.decision} /></td>
                      <td className="px-6 py-4 text-right">
                        {bid.final_value ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-700">R$ {bid.final_value.toLocaleString('pt-BR')}</span>
                            {commissionValue > 0 && (
                              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                                + R$ {commissionValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                              </span>
                            )}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openSummaryModal(bid)} className={`p-2 rounded-lg transition-colors ${bid.summary_sent_at ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`}><Send size={16} /></button>
                          <button onClick={() => openFormModal(bid)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MoreHorizontal size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingBid ? 'Editar Licitação' : 'Nova Licitação'}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input {...register('title', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Construção Ponte" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <select 
                {...clientRegisterRest} 
                onChange={handleClientChange} 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
              >
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

          {/* ÁREA FINANCEIRA (Agora aparece sempre se tiver valor OU se for status GANHA) */}
          <div className={`bg-green-50 p-4 rounded-lg border border-green-100 mt-2 transition-all duration-300 ${
            watchedStatus === BidStatus.WON || editingBid ? 'opacity-100 block' : 'opacity-0 hidden'
          }`}>
            <h3 className="text-sm font-bold text-green-800 mb-3 flex items-center gap-2">
              <Calculator size={16}/> Fechamento Financeiro
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1">Valor da Nota/Licitação (R$)</label>
                <div className="relative">
                  <input 
                    {...register('final_value')}
                    type="number"
                    step="0.01"
                    className="w-full pl-8 px-3 py-2 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="0,00"
                  />
                  <DollarSign className="absolute left-2.5 top-2.5 text-green-500" size={16} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-green-700 mb-1">Taxa de Comissão (%)</label>
                <div className="relative">
                  <input 
                    {...register('commission_rate')}
                    type="number"
                    step="0.1"
                    className="w-full pl-8 px-3 py-2 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="0"
                  />
                  <Percent className="absolute left-2.5 top-2.5 text-green-500" size={16} />
                </div>
              </div>
            </div>
            
            {calculatedCommission > 0 && (
              <div className="mt-3 flex justify-between items-center bg-white px-3 py-2 rounded border border-green-100">
                <span className="text-xs text-green-600">Sua comissão estimada:</span>
                <span className="font-bold text-green-700 text-lg">R$ {calculatedCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
              </div>
            )}
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