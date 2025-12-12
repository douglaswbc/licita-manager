import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Edit2, Mail, Building, Loader2, DollarSign, Percent, ToggleLeft, ToggleRight, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Client } from '../types';
import Modal from '../components/Modal';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [generatingAccess, setGeneratingAccess] = useState<string | null>(null); // ID do cliente sendo processado
  
  const { register, handleSubmit, reset, setValue } = useForm<Client>();

  const loadClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
    } catch (error) {
      console.error("Erro ao carregar clientes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // --- NOVA FUNÇÃO: GERAR LOGIN ---
  const handleCreateAccess = async (client: Client) => {
    if (!confirm(`Deseja gerar acesso para ${client.company}?\n\nLogin: ${client.email}\nSenha Padrão: mudar@1234`)) return;

    setGeneratingAccess(client.id);
    try {
      await api.createClientUser(client.id, client.email);
      alert(`Acesso criado com sucesso!\n\nEnvie para o cliente:\nLink: https://licitamanager.com.br/login\nEmail: ${client.email}\nSenha: mudar@1234`);
      await loadClients(); // Recarrega para atualizar o status (se tivermos essa info visualmente)
    } catch (error: any) {
      console.error(error);
      alert("Erro ao criar acesso: " + (error.message || "Verifique se o email já está em uso no Auth."));
    } finally {
      setGeneratingAccess(null);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      const novoStatus = !client.active;
      setClients(prev => prev.map(c => c.id === client.id ? { ...c, active: novoStatus } : c));
      await api.toggleClientStatus(client.id, novoStatus);
    } catch (error) {
      alert("Erro ao alterar status.");
      loadClients();
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setValue('name', client.name);
      setValue('email', client.email);
      setValue('company', client.company);
      setValue('contract_value', client.contract_value);
      setValue('commission_rate', client.commission_rate);
      setValue('id', client.id);
    } else {
      setEditingClient(null);
      reset({ name: '', email: '', company: '', contract_value: 0, commission_rate: 0 });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Client) => {
    try {
      const payload = editingClient ? { ...data, id: editingClient.id } : data;
      await api.saveClient(payload);
      await loadClients();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar cliente", error);
      alert("Erro ao salvar cliente.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.deleteClient(id);
        await loadClients();
      } catch (error) {
        console.error("Erro ao deletar", error);
      }
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <button 
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Empresa / Contato</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Contrato</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-center">Acesso Portal</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className={`hover:bg-slate-50 transition-colors ${!client.active ? 'opacity-60 bg-slate-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 flex items-center gap-2">
                      {client.company}
                      {!client.active && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Inativo</span>}
                    </div>
                    <div className="text-xs text-slate-500">{client.name}</div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Mail size={10}/> {client.email}</div>
                  </td>
                  
                  <td className="px-6 py-4 text-slate-700">
                    <div className="font-medium">{client.contract_value ? `R$ ${Number(client.contract_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</div>
                    <div className="text-xs text-slate-500">Comissão: {client.commission_rate ? `${client.commission_rate}%` : '0%'}</div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(client)}
                      className={`transition-colors ${client.active ? 'text-green-600 hover:text-green-800' : 'text-slate-400 hover:text-slate-600'}`}
                      title={client.active ? "Ativo (Clique para Pausar)" : "Inativo (Clique para Ativar)"}
                    >
                      {client.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </td>

                  {/* COLUNA DE ACESSO AO SISTEMA */}
                  <td className="px-6 py-4 text-center">
                    {/* Como não temos o campo auth_user_id no tipo Client ainda, vamos assumir que se não der erro ao criar, criou.
                        Para ficar perfeito, adicione auth_user_id na interface Client em types.ts */}
                    <button
                      onClick={() => handleCreateAccess(client)}
                      disabled={generatingAccess === client.id}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors border border-slate-200"
                      title="Gerar Login e Senha para este cliente"
                    >
                      {generatingAccess === client.id ? <Loader2 size={14} className="animate-spin"/> : <Key size={14} />}
                      Gerar Acesso
                    </button>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(client)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição (Mantido Igual) */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Responsável</label>
            <input 
              {...register('name', { required: true })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="João da Silva"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Empresa</label>
            <div className="relative">
              <input 
                {...register('company', { required: true })}
                className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Construtora ABC Ltda"
              />
              <Building className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail (Usado para Login)</label>
            <div className="relative">
              <input 
                {...register('email', { required: true })}
                type="email"
                className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="joao@empresa.com"
              />
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
            <p className="text-xs text-slate-500 mt-1">Este e-mail será o login do cliente.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor Contrato (R$)</label>
              <div className="relative">
                <input 
                  {...register('contract_value')}
                  type="number"
                  step="0.01"
                  className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
                <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comissão (%)</label>
              <div className="relative">
                <input 
                  {...register('commission_rate')}
                  type="number"
                  step="0.1"
                  className="w-full pl-10 px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
                <Percent className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;