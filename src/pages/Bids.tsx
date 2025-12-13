import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form'; // <--- Importante: useWatch
import { Plus, Send, Loader2, ThumbsUp, ThumbsDown, Clock, Filter, X, Calculator, UploadCloud, Trash2, Paperclip, MoreHorizontal, FileText } from 'lucide-react';
import { api } from '../services/api';
import { Bid, BidStatus, Client } from '../types';
import Modal from '../components/Modal';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-toastify';

const StatusBadge = ({ status }: { status: BidStatus }) => {
  const styles = {
    [BidStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [BidStatus.WAITING_CLIENT]: 'bg-blue-100 text-blue-800 border-blue-200',
    [BidStatus.WAITING_BID]: 'bg-purple-100 text-purple-800 border-purple-200',
    [BidStatus.WON]: 'bg-green-100 text-green-800 border-green-200',
    [BidStatus.LOST]: 'bg-red-100 text-red-800 border-red-200',
    [BidStatus.DISCARDED]: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>{status}</span>;
};

const DecisionBadge = ({ decision }: { decision?: string }) => {
  if (decision === 'Participar') return <span className="flex items-center gap-1 text-[#009B4D] font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100"><ThumbsUp size={12}/> Participar</span>;
  if (decision === 'Descartar') return <span className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100"><ThumbsDown size={12}/> Descartar</span>;
  return <span className="flex items-center gap-1 text-[#666666] text-xs"><Clock size={12}/> Aguardando</span>;
};

interface Attachment {
  name: string;
  url: string;
}

const Bids: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Upload
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<Bid | null>(null);
  const [summaryBid, setSummaryBid] = useState<Bid | null>(null);

  const { register, handleSubmit, reset, setValue, control } = useForm<Bid>();
  
  // --- CÁLCULO EM TEMPO REAL NO MODAL ---
  // Observa os campos para calcular a comissão enquanto digita
  const watchedFinalValue = useWatch({ control, name: 'final_value' }) || 0;
  const watchedRate = useWatch({ control, name: 'commission_rate' }) || 0;
  
  // Cálculo: (Valor * Porcentagem) / 100
  const calculatedCommission = (Number(watchedFinalValue) * Number(watchedRate)) / 100;

  const loadData = async () => {
    try {
      const [bidsData, clientsData] = await Promise.all([api.getBids(), api.getClients()]);
      setBids(bidsData);
      setClients(clientsData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filteredBids = bids.filter(bid => {
    const matchesClient = filterClient ? bid.client_id === filterClient : true;
    const matchesStatus = filterStatus ? bid.status === filterStatus : true;
    return matchesClient && matchesStatus;
  });

  const openFormModal = (bid?: Bid) => {
    if (bid) {
      setEditingBid(bid);
      setValue('title', bid.title);
      setValue('client_id', bid.client_id);
      setValue('date', bid.date ? bid.date.substring(0, 10) : ''); 
      setValue('status', bid.status);
      
      // Garante que sejam números para o cálculo funcionar
      setValue('final_value', Number(bid.final_value) || 0);
      setValue('commission_rate', Number(bid.commission_rate) || 0);
      
      // @ts-ignore
      setAttachments(bid.attachments || []); 
    } else {
      setEditingBid(null);
      reset({ title: '', status: BidStatus.PENDING, final_value: 0, commission_rate: 0 });
      setValue('date', new Date().toISOString().substring(0, 10));
      setAttachments([]);
    }
    setIsFormModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const files = Array.from(e.target.files);

    try {
      const uploadedFiles = await Promise.all(files.map(file => api.uploadFile(file)));
      setAttachments(prev => [...prev, ...uploadedFiles]);
      toast.success(`${files.length} arquivo(s) adicionado(s)!`);
    } catch (error) {
      toast.error("Erro ao fazer upload.");
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Ao mudar o cliente, puxa a comissão padrão dele automaticamente
    const clientId = e.target.value;
    const client = clients.find(c => c.id === clientId);
    if (client) setValue('commission_rate', Number(client.commission_rate) || 0);
  };

  const onFormSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        id: editingBid ? editingBid.id : undefined,
        date: new Date(data.date).toISOString(),
        final_value: Number(data.final_value),
        commission_rate: Number(data.commission_rate),
        attachments: attachments,
        link_docs: attachments.length > 0 ? attachments[0].url : '' 
      };
      await api.saveBid(payload);
      await loadData();
      setIsFormModalOpen(false);
      toast.success("Licitação salva!");
    } catch (e) {
      toast.error("Erro ao salvar.");
    }
  };

  const openSummaryModal = (bid: Bid) => {
    setSummaryBid(bid);
    setIsSummaryModalOpen(true);
  };

  const onSummarySubmit = async () => {
    if (!summaryBid) return;
    const idToast = toast.loading("Enviando...");
    try {
      await api.sendSummaryEmail(summaryBid.id, summaryBid.link_docs || '');
      await loadData(); 
      setIsSummaryModalOpen(false);
      toast.update(idToast, { render: "Enviado!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (e: any) {
      toast.update(idToast, { render: `Erro: ${e.message}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-[#666666]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-[#002A54]">Licitações</h1>
        <button onClick={() => openFormModal()} className="bg-[#009B4D] hover:bg-[#007A3D] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm shadow-sm">
          <Plus size={16} /> Nova Licitação
        </button>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 text-[#666666] font-medium"><Filter size={18} /><span>Filtros:</span></div>
        <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none text-[#666666]"><option value="">Todos os Clientes</option>{clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}</select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none text-[#666666]"><option value="">Todos Status</option>{Object.values(BidStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
        {(filterClient || filterStatus) && (<button onClick={() => {setFilterClient(''); setFilterStatus('')}} className="text-red-500 text-sm hover:text-red-700 font-medium ml-auto md:ml-0"><X size={16} /></button>)}
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[#666666]">
              <tr>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Título</th>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold bg-blue-50/50 border-l border-blue-100">Decisão</th>
                <th className="px-6 py-4 font-semibold text-right">Resultado</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBids.map((bid) => {
                const clientName = bid.client_name || clients.find(c => c.id === bid.client_id)?.company || '-';
                // @ts-ignore
                const hasFiles = bid.attachments && bid.attachments.length > 0;
                
                // CÁLCULO DA COMISSÃO NA TABELA
                const valorFinal = Number(bid.final_value) || 0;
                const taxaComissao = Number(bid.commission_rate) || 0;
                const valorComissao = (valorFinal * taxaComissao) / 100;
                
                return (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-[#666666] whitespace-nowrap">{bid.date ? format(parseISO(bid.date), 'dd/MM/yyyy') : '-'}</td>
                    <td className="px-6 py-4 text-[#002A54] font-medium">
                      {bid.title}
                      {hasFiles && (
                         <div className="flex gap-1 mt-1">
                           {/* @ts-ignore */}
                           {bid.attachments.map((file, idx) => (
                             <a key={idx} href={file.url} target="_blank" className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded border border-slate-300 flex items-center gap-1" title={file.name}>
                               <Paperclip size={8} /> Doc
                             </a>
                           ))}
                         </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#666666]">{clientName}</td>
                    <td className="px-6 py-4"><StatusBadge status={bid.status} /></td>
                    <td className="px-6 py-4 bg-blue-50/30 border-l border-blue-50"><DecisionBadge decision={bid.decision} /></td>
                    
                    {/* COLUNA RESULTADO COM CÁLCULO */}
                    <td className="px-6 py-4 text-right">
                      {valorFinal > 0 ? (
                        <div>
                          <div className="font-bold text-[#666666]">R$ {valorFinal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                          {valorComissao > 0 && (
                            <div className="text-xs text-[#009B4D] font-bold mt-1">
                              Comissão: R$ {valorComissao.toLocaleString('pt-BR', {minimumFractionDigits: 2})} ({taxaComissao}%)
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openSummaryModal(bid)} className={`p-2 rounded-lg transition-colors ${bid.summary_sent_at ? 'text-[#009B4D] bg-green-50' : 'text-slate-400 hover:text-purple-600 hover:bg-purple-50'}`} title="Enviar Email"><Send size={16} /></button>
                        <button onClick={() => openFormModal(bid)} className="p-2 text-slate-400 hover:text-[#002A54] hover:bg-slate-100 rounded-lg transition-colors"><MoreHorizontal size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={editingBid ? 'Editar Licitação' : 'Nova Licitação'}>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#666666] mb-1">Título</label>
            <input {...register('title', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#002A54]" placeholder="Ex: Pregão Eletrônico 05/2025" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Cliente</label>
              <select {...register('client_id', { required: true, onChange: handleClientChange })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white">
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Data Limite</label>
              <input type="date" {...register('date', { required: true })} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#666666] mb-1">Documentos</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors relative">
               <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading}/>
               <div className="flex flex-col items-center gap-2 text-slate-500">
                  {uploading ? <Loader2 className="animate-spin text-[#009B4D]" /> : <UploadCloud size={24} />}
                  <span className="text-xs font-medium">{uploading ? "Enviando arquivos..." : "Clique ou arraste arquivos PDF aqui"}</span>
               </div>
            </div>
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden"><FileText size={14} className="text-[#002A54]" /><span className="truncate">{file.name}</span></div>
                    <button type="button" onClick={() => removeAttachment(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#666666] mb-1">Status Interno</label>
            <select {...register('status')} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white">
              <option value={BidStatus.PENDING}>Pendente</option>
              <option value={BidStatus.WAITING_CLIENT}>Aguardando Cliente</option>
              <option value={BidStatus.WAITING_BID}>Aguardando Licitação</option>
              <option value={BidStatus.WON}>Ganha</option>
              <option value={BidStatus.LOST}>Perdida</option>
            </select>
          </div>

          {/* BOX DE CÁLCULO FINANCEIRO */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-2">
            <h3 className="text-sm font-bold text-[#009B4D] mb-3 flex items-center gap-2"><Calculator size={16}/> Fechamento Financeiro</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#009B4D] mb-1">Valor Final (R$)</label>
                <input {...register('final_value')} type="number" step="0.01" className="w-full px-3 py-2 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-[#009B4D]" placeholder="0,00" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#009B4D] mb-1">Comissão (%)</label>
                <input {...register('commission_rate')} type="number" step="0.1" className="w-full px-3 py-2 border border-green-200 rounded-lg outline-none focus:ring-2 focus:ring-[#009B4D]" placeholder="0" />
              </div>
            </div>
            
            {/* VISUALIZAÇÃO DO CÁLCULO EM TEMPO REAL */}
            <div className="mt-3 pt-3 border-t border-green-200 flex justify-between items-center">
              <span className="text-xs text-green-700 font-medium">Comissão Calculada:</span>
              <span className="text-sm font-extrabold text-[#009B4D]">
                R$ {calculatedCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsFormModalOpen(false)} className="px-4 py-2 text-[#666666] hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" disabled={uploading} className="px-4 py-2 bg-[#009B4D] hover:bg-[#007A3D] text-white rounded-lg font-medium">Salvar Licitação</button>
          </div>
        </form>
      </Modal>

      {/* MODAL DE ENVIO (Mantido igual) */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Enviar Documentos ao Cliente">
        <div className="space-y-4">
          <p className="text-sm text-[#666666]">
            Enviar documentos para: 
            <strong> {summaryBid && (summaryBid.client_name || clients.find(c => c.id === summaryBid.client_id)?.company)}</strong>
          </p>
          <div className="bg-slate-50 p-3 rounded border border-slate-200 max-h-40 overflow-y-auto">
             {/* @ts-ignore */}
             {summaryBid?.attachments && summaryBid.attachments.length > 0 ? summaryBid.attachments.map((file, i) => (
                 <div key={i} className="flex items-center gap-2 text-xs text-slate-600 mb-1"><Paperclip size={12}/> {file.name}</div>
             )) : <p className="text-xs text-red-500">Nenhum arquivo anexado.</p>}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 text-[#666666] hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button onClick={onSummarySubmit} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-bold"><Send size={16} /> Confirmar Envio</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bids;