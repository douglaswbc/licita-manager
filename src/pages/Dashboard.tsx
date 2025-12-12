import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { api } from '../services/api';
import { Bid, BidStatus } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { 
  TrendingUp, Clock, Users, CheckCircle, 
  AlertTriangle, PieChart as PieIcon, ArrowRight, Trash2 
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- PALETA DE CORES DA MARCA ---
const COLORS = {
  blue: '#002A54',   // Azul Institucional
  green: '#009B4D',  // Verde Ação/Sucesso
  grey: '#666666',   // Cinza Texto
  lightBlue: '#3B82F6', // Azul claro para gráficos
  yellow: '#EAB308', // Amarelo (Atenção)
  red: '#EF4444',    // Vermelho (Perda/Erro)
  discard: '#94A3B8' // Cinza Descartado
};

// Cores para o Gráfico de Pizza (Harmonia com a marca)
const PIE_COLORS = [
  COLORS.blue, 
  COLORS.green, 
  COLORS.lightBlue, 
  COLORS.yellow, 
  COLORS.grey
];

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

  if (loading) return <div className="p-8 flex justify-center text-[#666666]">Carregando indicadores...</div>;

  // --- CÁLCULOS ---
  const totalBids = bids.length;
  const waitingClient = bids.filter(b => b.status === BidStatus.WAITING_CLIENT).length;
  const waitingBidDay = bids.filter(b => b.status === BidStatus.WAITING_BID).length;
  const wonBids = bids.filter(b => b.status === BidStatus.WON).length;
  const lostBids = bids.filter(b => b.status === BidStatus.LOST).length;
  const discardedBids = bids.filter(b => b.status === BidStatus.DISCARDED).length;

  const finishedBids = wonBids + lostBids;
  const winRate = finishedBids > 0 ? Math.round((wonBids / finishedBids) * 100) : 0;

  const criticalDeadlines = bids.filter(b => {
    if (!b.date) return false;
    const days = differenceInDays(parseISO(b.date), new Date());
    const isActive = [BidStatus.PENDING, BidStatus.WAITING_CLIENT, BidStatus.WAITING_BID].includes(b.status);
    return days >= 0 && days <= 3 && isActive;
  });

  const funnelData = [
    { name: 'Com Cliente', value: waitingClient, fill: COLORS.lightBlue }, 
    { name: 'Ag. Licitação', value: waitingBidDay, fill: COLORS.yellow }, 
    { name: 'Descartadas', value: discardedBids, fill: COLORS.discard },
    { name: 'Ganhas', value: wonBids, fill: COLORS.green }, // VERDE DA MARCA
    { name: 'Perdidas', value: lostBids, fill: COLORS.red },
  ];

  const clientMap = bids.reduce((acc, bid) => {
    const name = bid.client_name || 'Desconhecido';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(clientMap)
    .map(key => ({ name: key, value: clientMap[key] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-[#002A54]">Visão Geral</h1>
          <p className="text-[#666666] mt-1">Acompanhe o desempenho da sua assessoria.</p>
        </div>
        <div className="text-right">
          <span className="text-sm font-medium text-[#666666]">Taxa de Sucesso (Disputadas)</span>
          <div className="text-3xl font-bold text-[#009B4D]">{winRate}%</div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><TrendingUp size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[#002A54]">{totalBids}</p>
        </div>

        {/* Com Cliente */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-blue-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Com Cliente</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={18} /></div>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{waitingClient}</p>
            <p className="text-[10px] text-slate-400">Aguardando decisão</p>
          </div>
        </div>

        {/* Ag. Licitação */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-yellow-400 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Ag. Data</p>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Clock size={18} /></div>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{waitingBidDay}</p>
            <p className="text-[10px] text-slate-400">Preparar docs</p>
          </div>
        </div>

        {/* Descartadas */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-slate-400 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Descartadas</p>
            <div className="p-2 bg-slate-100 text-slate-500 rounded-lg"><Trash2 size={18} /></div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-500">{discardedBids}</p>
            <p className="text-[10px] text-slate-400">Não participou</p>
          </div>
        </div>

        {/* Ganhas - VERDE DA MARCA */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between border-b-4 border-b-[#009B4D] hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase">Ganhas</p>
            <div className="p-2 bg-green-50 text-[#009B4D] rounded-lg"><CheckCircle size={18} /></div>
          </div>
          <p className="text-2xl font-bold text-[#009B4D]">{wonBids}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Barras */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-[#002A54] mb-6">Status dos Processos</h2>
          <div className="h-72 w-full" style={{ minHeight: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: COLORS.grey, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: COLORS.grey}} />
                <Tooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-[#002A54] mb-2 flex items-center gap-2">
            <PieIcon size={20} className="text-slate-400"/> Volume por Cliente
          </h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: COLORS.grey }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Alertas Críticos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-500" />
          <h2 className="text-lg font-bold text-[#002A54]">Atenção: Prazos Críticos (Próximas 72h)</h2>
        </div>

        {criticalDeadlines.length === 0 ? (
          <p className="text-[#666666] py-4 text-sm">Tudo tranquilo! Nenhuma licitação ativa vencendo agora.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-red-50 text-red-800 uppercase text-xs font-bold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Data Limite</th>
                  <th className="px-4 py-3">Licitação</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Status Atual</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {criticalDeadlines.map(bid => (
                  <tr key={bid.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-red-600">
                      {format(parseISO(bid.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#002A54]">{bid.title}</td>
                    <td className="px-4 py-3 text-[#666666]">{bid.client_name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-[#666666]">
                        {bid.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/bids" className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1">
                        Resolver <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;