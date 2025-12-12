import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Users, Shield, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../services/api';
import { Profile } from '../types';
import Modal from '../components/Modal';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const loadUsers = async () => {
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Erro ao carregar usuários", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleStatus = async (user: Profile) => {
    // Não deixa desativar a si mesmo (Admin)
    try {
      const novoStatus = !user.active;
      // Atualiza visualmente primeiro (Otimista)
      setUsers(users.map(u => u.id === user.id ? { ...u, active: novoStatus } : u));
      
      // Salva no banco
      await api.toggleUserStatus(user.id, novoStatus);
    } catch (error) {
      alert("Erro ao alterar status.");
      loadUsers(); // Reverte em caso de erro
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.adminCreateUser(data.email, data.password);
      alert(`Assessor criado com sucesso!`);
      reset();
      setIsModalOpen(false);
      loadUsers();
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="text-blue-600" /> Gestão de Assessores
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm shadow-sm"
        >
          <Plus size={16} /> Novo Assessor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-700">E-mail</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Função</th>
              <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
              <th className="px-6 py-4 font-semibold text-slate-700 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-slate-50 ${!user.active ? 'bg-slate-50 opacity-75' : ''}`}>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {user.email}
                  {!user.active && <span className="ml-2 text-xs text-red-500 font-bold">(Bloqueado)</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Assessor'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold ${user.active ? 'text-green-600' : 'text-red-500'}`}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {user.role !== 'admin' && ( // Não permite bloquear admins
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      className={`transition-colors ${user.active ? 'text-green-600 hover:text-green-800' : 'text-slate-400 hover:text-slate-600'}`}
                      title={user.active ? "Clique para inativar" : "Clique para ativar"}
                    >
                      {user.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Assessor">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input {...register('email', { required: true })} type="email" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="assessor@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha Temporária</label>
            <input {...register('password', { required: true, minLength: 6 })} type="text" className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Senha123" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cadastrar</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUsers;