import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { api } from '../services/api';
import { Bid, BidStatus } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Loader2, Calendar, User, DollarSign, AlertCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';

// Configuração das Colunas
const COLUMNS = {
  [BidStatus.PENDING]: { title: 'Triagem', color: 'border-t-yellow-400' },
  [BidStatus.WAITING_CLIENT]: { title: 'Aguardando Cliente', color: 'border-t-blue-500' },
  [BidStatus.WAITING_BID]: { title: 'Preparação / Sessão', color: 'border-t-purple-500' },
  [BidStatus.WON]: { title: 'Homologado (Ganho)', color: 'border-t-[#009B4D]' },
  [BidStatus.LOST]: { title: 'Perdido / Fracassado', color: 'border-t-red-500' },
  // Descartadas geralmente somem do Kanban ou ficam numa coluna de "Lixo", optei por não mostrar para limpar a visão
};

const Kanban: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Carrega dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getBids();
      // Filtra descartadas para não poluir
      setBids(data.filter(b => b.status !== BidStatus.DISCARDED)); 
    } catch (error) {
      toast.error("Erro ao carregar kanban.");
    } finally {
      setLoading(false);
    }
  };

  // Função que roda quando solta o card
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se soltou fora ou no mesmo lugar, não faz nada
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Atualiza visualmente instantaneamente (Optimistic UI)
    const newStatus = destination.droppableId as BidStatus;
    const updatedBids = bids.map(bid => 
      bid.id === draggableId ? { ...bid, status: newStatus } : bid
    );
    setBids(updatedBids);

    // Atualiza no Banco
    try {
      // Aqui usamos o update direto. 
      // DICA: Se mover para "WON", seria ideal abrir o modal de financeiro. 
      // Por enquanto vamos apenas mudar o status.
      const bidToUpdate = bids.find(b => b.id === draggableId);
      if (bidToUpdate) {
        await api.saveBid({ ...bidToUpdate, status: newStatus });
        toast.success(`Movido para ${COLUMNS[newStatus].title}`);
      }
    } catch (error) {
      toast.error("Erro ao mover card.");
      loadData(); // Reverte em caso de erro
    }
  };

  // Agrupa as licitações por coluna
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
      
      {/* Header do Kanban */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#002A54]">Fluxo de Licitações</h1>
          <p className="text-sm text-[#666666]">Arraste os cards para atualizar o status.</p>
        </div>
        
        {/* Busca rápida */}
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

      {/* Área do Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {Object.entries(COLUMNS).map(([statusKey, config]) => (
            <div key={statusKey} className="flex-shrink-0 w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200">
              
              {/* Cabeçalho da Coluna */}
              <div className={`p-3 bg-white rounded-t-xl border-b border-slate-200 border-t-4 ${config.color} flex justify-between items-center shadow-sm`}>
                <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">{config.title}</h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {getBidsByStatus(statusKey).length}
                </span>
              </div>

              {/* Área Droppable (Onde os cards ficam) */}
              <Droppable droppableId={statusKey}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-2 overflow-y-auto space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                  >
                    {getBidsByStatus(statusKey).map((bid, index) => {
                      // Verifica prazo
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
                              {/* Tarja de Urgência */}
                              {isUrgent && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 text-red-500 text-[10px] font-bold bg-red-50 px-1.5 py-0.5 rounded animate-pulse">
                                  <AlertCircle size={10} /> {daysLeft === 0 ? 'HOJE' : `${daysLeft}d`}
                                </div>
                              )}

                              <h4 className="font-bold text-[#002A54] text-sm mb-2 line-clamp-2 pr-6">
                                {bid.title}
                              </h4>
                              
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
                                    <DollarSign size={12} />
                                    R$ {Number(bid.final_value).toLocaleString('pt-BR')}
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
    </div>
  );
};

export default Kanban;