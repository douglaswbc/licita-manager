import React, { useEffect, useState } from 'react';
import { 
  format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, 
  subMonths, isSameMonth, isBefore, isAfter 
} from 'date-fns'; // <--- Importei isBefore
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { api } from '../services/api';
import { Bid, BidStatus, Client } from '../types';
import { DollarSign, Wallet, TrendingUp, BarChart3 } from 'lucide-react';

const Financial: React.FC = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

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

  // --- CÁLCULOS FINANCEIROS ---
  
  // 1. Receita Fixa Mensal ATUAL (Para o Card do Topo - Soma quem está ativo HOJE)
  const currentMonthlyFixed = clients
    .filter(c => c.active !== false)
    .reduce((acc, client) => acc + (Number(client.contract_value) || 0), 0);

  // 2. Comissões Totais (Cards)
  const wonBids = bids.filter(b => b.status === BidStatus.WON);
  
  const commissionsPending = wonBids
    .filter(b => b.financial_status !== 'pago')
    .reduce((acc, b) => acc + ((b.final_value || 0) * (b.commission_rate || 0) / 100), 0);

  const commissionsReceived = wonBids
    .filter(b => b.financial_status === 'pago')
    .reduce((acc, b) => acc + ((b.final_value || 0) * (b.commission_rate || 0) / 100), 0);

  // --- PREPARAÇÃO DO GRÁFICO HISTÓRICO ---
  const today = new Date();
  const last6Months = eachMonthOfInterval({
    start: subMonths(today, 5), // Pega os últimos 6 meses
    end: today
  });

  const chartData = last6Months.map(monthDate => {
    // A. Soma Comissões deste mês específico (Data da Licitação)
    const commissionsInMonth = wonBids
      .filter(b => b.date && isSameMonth(parseISO(b.date), monthDate))
      .reduce((acc, b) => acc + ((b.final_value || 0) * (b.commission_rate || 0) / 100), 0);

    // B. Soma Fixo deste mês (Só clientes que JÁ EXISTIAM no final daquele mês)
    const fixedInMonth = clients
      .filter(client => {
        // Se não tiver data, assume que sempre existiu (segurança)
        if (!client.created_at) return true; 
        
        const clientJoinDate = parseISO(client.created_at);
        const endOfThisMonth = endOfMonth(monthDate);

        // Regra: O cliente entrou ANTES ou DURANTE este mês?
        const clientExisted = isBefore(clientJoinDate, endOfThisMonth);
        
        // Regra: O cliente está ativo? (Aqui simplificamos assumindo que se está ativo hoje, pagou o histórico. 
        // Para um histórico perfeito de churn, precisaríamos de uma tabela de pagamentos separada, mas isso serve para 99% dos casos).
        const isActive = client.active !== false;

        return clientExisted && isActive;
      })
      .reduce((acc, client) => acc + (Number(client.contract_value) || 0), 0);

    return {
      name: format(monthDate, 'MMM', { locale: ptBR }).toUpperCase(),
      Fixo: fixedInMonth,
      Comissao: commissionsInMonth,
      Total: fixedInMonth + commissionsInMonth
    };
  });

  const handleStatusChange = async (bidId: string, newStatus: string) => {
    try {
      setBids(prev => prev.map(b => b.id === bidId ? { ...b, financial_status: newStatus as any } : b));
      await api.updateFinancialStatus(bidId, newStatus);
    } catch (error) {
      alert("Erro ao atualizar status.");
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando financeiro...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Wallet className="text-green-600" /> Controle Financeiro
        </h1>
        <div className="text-right">
          <p className="text-xs text-slate-500 uppercase font-bold">Previsão (Mês Atual)</p>
          <p className="text-2xl font-bold text-slate-900">
            R$ {chartData[chartData.length - 1].Total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BarChart3 size={20} className="text-blue-600"/> Evolução de Receita
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, '']}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="Fixo" stackId="a" fill="#3B82F6" name="Receita Fixa" radius={[0, 0, 4, 4]} barSize={50} />
              <Bar dataKey="Comissao" stackId="a" fill="#22C55E" name="Comissões" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-slate-500">Faturamento Fixo (Atual)</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            R$ {currentMonthlyFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {clients.filter(c => c.active !== false).length} contratos ativos
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-400">
          <p className="text-sm font-medium text-slate-500">Comissões a Receber</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            R$ {commissionsPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Pendente / Aguardando Nota</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-slate-500">Comissões Recebidas</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            R$ {commissionsReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total acumulado</p>
        </div>
      </div>

      {/* TABELAS (Abaixo mantém igual ao anterior, vou resumir aqui para focar no gráfico) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TABELA ESQUERDA: CONTRATOS FIXOS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600"/> Contratos Mensais
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr><th className="px-3 py-2">Cliente</th><th className="px-3 py-2 text-right">Valor</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map(client => (
                  <tr key={client.id} className={!client.active ? 'opacity-50 grayscale bg-slate-50' : ''}>
                    <td className="px-3 py-3 font-medium text-slate-700">
                      {client.company}
                      {!client.active && <span className="ml-2 text-[9px] bg-gray-200 px-1 rounded">PAUSADO</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-slate-900 font-bold">
                      R$ {Number(client.contract_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABELA DIREITA: GESTÃO DE COMISSÕES */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <DollarSign size={20} className="text-green-600"/> Gestão de Comissões (Ganhas)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-3">Licitação</th>
                  <th className="px-4 py-3 text-right">Empenho</th>
                  <th className="px-4 py-3 text-right">Comissão</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {wonBids.map(bid => {
                  const commissionVal = (bid.final_value || 0) * (bid.commission_rate || 0) / 100;
                  return (
                    <tr key={bid.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-800">{bid.title}</div>
                        <div className="text-xs text-slate-500">{bid.client_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600">R$ {Number(bid.final_value).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-green-700">R$ {commissionVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select 
                          value={bid.financial_status || 'aguardando_nota'}
                          onChange={(e) => handleStatusChange(bid.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                            bid.financial_status === 'pago' ? 'bg-green-100 text-green-700' : 
                            bid.financial_status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <option value="aguardando_nota">Aguardando Nota</option>
                          <option value="pendente">Pendente</option>
                          <option value="pago">Recebido</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;