import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { Bid, BidStatus } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { AlertCircle, TrendingUp, CheckCircle, Clock, Users, XCircle, Calendar, Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBids().then((data) => {
      setBids(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  // --- CÁLCULOS CORRIGIDOS ---
  // 1. Total de Licitações Ativas (Exclui as descartadas/perdidas para não poluir?)
  // Vamos manter todas no total
  const totalBids = bids.length;

  // 2. Com o Cliente (Status exato: 'Aguardando Cliente')
  const waitingClient = bids.filter(b => b.status === BidStatus.WAITING_CLIENT).length;

  // 3. Aguardando Licitação (Cliente deu OK, estamos esperando o dia)
  const waitingBidDay = bids.filter(b => b.status === BidStatus.WAITING_BID).length;

  // 4. Ganhas
  const wonBids = bids.filter(b => b.status === BidStatus.WON).length;

  // 5. Prazos Próximos (Considera Pendente, Com Cliente ou Aguardando Licitação)
  const upcomingDeadlines = bids.filter(b => {
    if (!b.date) return false;
    const days = differenceInDays(parseISO(b.date), new Date());
    // Mostra alertas para tudo que não está finalizado (Ganha/Perdida/Descartada)
    const isActive = [BidStatus.PENDING, BidStatus.WAITING_CLIENT, BidStatus.WAITING_BID].includes(b.status);
    return days >= 0 && days <= 5 && isActive;
  });

  // Gráfico Atualizado
  const chartData = [
    { name: 'Com Cliente', value: waitingClient, fill: '#3B82F6' }, // Azul
    { name: 'Ag. Licitação', value: waitingBidDay, fill: '#EAB308' }, // Amarelo
    { name: 'Ganhas', value: wonBids, fill: '#22C55E' }, // Verde
    { name: 'Descartadas', value: bids.filter(b => b.status === BidStatus.DISCARDED).length, fill: '#94A3B8' }, // Cinza
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Painel de Controle</h1>
      
      {/* Cards de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Card: Com o Cliente */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-blue-500">
          <div>
            <p className="text-sm font-medium text-slate-500">Com o Cliente</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{waitingClient}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>

        {/* Card: Aguardando Licitação (O "Sim" do cliente) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-yellow-400">
          <div>
            <p className="text-sm font-medium text-slate-500">Aguardando Data</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{waitingBidDay}</p>
          </div>
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Calendar size={24} />
          </div>
        </div>

        {/* Card: Ganhas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between border-l-4 border-l-green-500">
          <div>
            <p className="text-sm font-medium text-slate-500">Ganhas</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{wonBids}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Card: Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Total Geral</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalBids}</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Funil de Licitações</h2>
          <div className="h-64" style={{ minHeight: '250px' }}> 
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prazos Próximos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            Prazos Próximos (5 Dias)
          </h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-slate-500 py-4">Nenhuma licitação ativa vencendo em breve.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Título</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {upcomingDeadlines.map(bid => (
                    <tr key={bid.id} className="border-t border-slate-100">
                      <td className="py-3 font-medium text-slate-900">{bid.title}</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{bid.status}</span>
                      </td>
                      <td className="py-3 text-slate-500">{format(parseISO(bid.date), 'dd/MM')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;