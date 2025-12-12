import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import { Bid, BidStatus } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Loader2, Calendar, User, DollarSign, AlertCircle, Search, Send, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';

// Configuração das Colunas
const COLUMNS = {
  [BidStatus.PENDING]: { title: 'Triagem', color: 'border-t-yellow-400' },
  [BidStatus.WAITING_CLIENT]: { title: 'Aguardando Cliente', color: 'border-t-blue-500' },
  [BidStatus.WAITING_BID]: { title: 'Preparação / Sessão', color: 'border-t-purple-500' },
  [BidStatus.WON]: { title: 'Homologado (Ganho)', color: 'border-t-[#009B4D]' },
  [BidStatus.LOST]: { title: 'Perdido / Fracassado', color: 'border-t-red-500' },
};

const Kanban: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para o Modal de Envio (Automação)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryBid, setSummaryBid] = useState<Bid | null>(null);
  const summaryForm = useForm<{ summary_link: string }>();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await api.getBids();
      setBids(data.filter(b => b.status !== BidStatus.DISCARDED)); 
    } catch (error) {
      toast.error("Erro ao carregar kanban.");
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as BidStatus;
    
    // 1. Atualização Otimista (Visual)
    const updatedBids = bids.map(bid => 
      bid.id === draggableId ? { ...bid, status: newStatus } : bid
    );
    setBids(updatedBids);

    // 2. Atualiza no Banco
    try {
      const bidToUpdate = bids.find(b => b.id === draggableId);
      if (bidToUpdate) {
        await api.saveBid({ ...bidToUpdate, status: newStatus });
        
        // --- AUTOMAÇÃO INTELIGENTE ---
        // Se moveu para "Aguardando Cliente", abre o modal de envio
        if (newStatus === BidStatus.WAITING_CLIENT) {
            setSummaryBid({ ...bidToUpdate, status: newStatus }); // Garante status novo
            summaryForm.setValue('summary_link', bidToUpdate.link_docs || '');
            setIsSummaryModalOpen(true);
            toast.info("Confirme o link para enviar o e-mail ao cliente.");
        } else {
            toast.success(`Movido para ${COLUMNS[newStatus].title}`);
        }
      }
    } catch (error) {
      toast.error("Erro ao mover card.");
      loadData();
    }
  };

  const onSummarySubmit = async (data: { summary_link: string }) => {
    if (!summaryBid) return;
    const idToast = toast.loading("Enviando resumo por e-mail...");
    
    try {
      // Salva link e envia
      await api.saveBid({ ...summaryBid, summary_link: data.summary_link });
      await api.sendSummaryEmail(summaryBid.id, data.summary_link);
      
      await loadData();
      setIsSummaryModalOpen(false);
      toast.update(idToast, { render: "E-mail enviado com sucesso!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (e: any) {
      toast.update(idToast, { render: `Erro: ${e.message}`, type: "error", isLoading: false, autoClose: 5000 });
    }
  };

  const getBidsByStatus = (status: string) => {
    return bids
      .filter(bid => bid.status === status)
      .filter(bid => 
        bid.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        bid.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-[#002A54]" /></div>;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col p-4 md:p-6 bg-slate-50 overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002A54]">Fluxo de Licitações</h1>
          <p className="text-sm text-[#666666]">Arraste para "Aguardando Cliente" para disparar o e-mail.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filtrar..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#002A54] outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
        </div>
      </div>

      {/* Drag & Drop Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {Object.entries(COLUMNS).map(([statusKey, config]) => (
            <div key={statusKey} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200">
              <div className={`p-3 bg-white rounded-t-xl border-b border-slate-200 border-t-4 ${config.color} flex justify-between items-center shadow-sm`}>
                <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">{config.title}</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {getBidsByStatus(statusKey).length}
                </span>
              </div>

              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-2 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                  >
                    {getBidsByStatus(statusKey).map((bid, index) => {
                      const daysLeft = bid.date ? differenceInDays(parseISO(bid.date), new Date()) : 99;
                      const isUrgent = daysLeft >= 0 && daysLeft <= 3 && statusKey !== BidStatus.WON && statusKey !== BidStatus.LOST;

                      return (
                        <Draggable key={bid.id} draggableId={bid.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-[#009B4D] z-50' : ''}`}
                            >
                              {isUrgent && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-red-500 text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                                  <AlertCircle size={10} /> {daysLeft === 0 ? 'HOJE' : `${daysLeft}d`}
                                </div>
                              )}

                              <h4 className="font-bold text-[#002A54] text-sm mb-2 line-clamp-2 pr-6">{bid.title}</h4>
                              
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs text-[#666666]">
                                  <User size={12} className="text-slate-400"/> 
                                  <span className="truncate">{bid.client_name}</span>
                                </div>
                                {bid.date && (
                                  <div className="flex items-center gap-2 text-xs text-[#666666]">
                                    <Calendar size={12} className="text-slate-400"/>
                                    <span>{format(parseISO(bid.date), 'dd/MM/yyyy')}</span>
                                  </div>
                                )}
                                {bid.final_value ? (
                                  <div className="flex items-center gap-2 text-xs font-medium text-[#009B4D] mt-2 pt-2 border-t border-slate-50">
                                    <DollarSign size={12} /> R$ {Number(bid.final_value).toLocaleString('pt-BR')}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de Envio Automático */}
      <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Enviar Resumo ao Cliente">
        <form onSubmit={summaryForm.handleSubmit(onSummarySubmit)} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 mb-2">
            Você moveu este card para <strong>Aguardando Cliente</strong>. Confirme o link abaixo para notificar o cliente por e-mail agora.
          </div>
          <div>
            <label className="block text-sm font-medium text-[#666666] mb-1">Link do Resumo / Drive</label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input {...summaryForm.register('summary_link', { required: true })} className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#002A54]" placeholder="https://..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 text-[#666666] hover:bg-slate-100 rounded-lg">Cancelar (Não Enviar)</button>
            <button type="submit" className="px-4 py-2 bg-[#009B4D] hover:bg-[#007A3D] text-white rounded-lg flex items-center gap-2 font-bold"><Send size={16} /> Enviar E-mail</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Kanban;