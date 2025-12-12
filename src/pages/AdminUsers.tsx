import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Plus, Shield, Loader2, ToggleLeft, ToggleRight, 
  User, Briefcase, Globe, ChevronDown, ChevronRight, Lock 
} from 'lucide-react';
import { api } from '../services/api';
import { Profile } from '../types';
import Modal from '../components/Modal';

// Tipo auxiliar para a árvore
interface AssessorNode extends Profile {
  clients: Array<Profile & { companyName?: string }>;
}

const AdminUsers: React.FC = () => {
  const [assessors, setAssessors] = useState<AssessorNode[]>([]);
  const [orphanClients, setOrphanClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- NOVO ESTADO: ID DO USUÁRIO LOGADO ---
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const { register, handleSubmit, reset } = useForm();

  const loadData = async () => {
    try {
      // 1. Pega quem sou eu (para evitar auto-bloqueio)
      const session = await api.getSession();
      if (session?.user) setCurrentUserId(session.user.id);

      // 2. Carrega dados do sistema
      const { profiles, relationships } = await api.getDataForAdminUsers();
      
      const potentialParents = profiles.filter((p: any) => p.role !== 'client');
      const allClients = profiles.filter((p: any) => p.role === 'client');

      const tree = potentialParents.map((parent: any) => {
        const myClientRelations = relationships.filter((r: any) => r.user_id === parent.id);
        const myClientAuthIds = myClientRelations.map((r: any) => r.auth_user_id);
        
        const myClientsProfiles = allClients.filter((c: any) => myClientAuthIds.includes(c.id)).map((c: any) => {
            const rel = myClientRelations.find((r:any) => r.auth_user_id === c.id);
            return { ...c, companyName: rel?.empresa }; 
        });

        return { ...parent, clients: myClientsProfiles };
      });

      const linkedClientIds = tree.flatMap((a: any) => a.clients.map((c: any) => c.id));
      const orphans = allClients.filter((c: any) => !linkedClientIds.includes(c.id));

      setAssessors(tree);
      setOrphanClients(orphans);

    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleAssessor = async (assessor: AssessorNode) => {
    const action = assessor.active ? "BLOQUEAR" : "LIBERAR";
    const msg = `ATENÇÃO: Ao ${action} o usuário ${assessor.email}, você também irá ${action} o acesso de seus ${assessor.clients.length} clientes vinculados.\n\nDeseja continuar?`;
    
    if (!confirm(msg)) return;

    try {
      const novoStatus = !assessor.active;
      setAssessors(prev => prev.map(a => a.id === assessor.id ? { 
        ...a, 
        active: novoStatus, 
        clients: a.clients.map(c => ({ ...c, active: novoStatus })) 
      } : a));

      await api.toggleAssessorCascade(assessor.id, novoStatus);
    } catch (error) {
      alert("Erro ao alterar status.");
      loadData();
    }
  };

  const handleToggleSingleUser = async (user: Profile) => {
    try {
        await api.toggleUserStatus(user.id, !user.active);
        loadData();
    } catch(e) { alert('Erro'); }
  };

  const onSubmit = async (data: any) => {
    try {
      await api.adminCreateUser(data.email, data.password);
      alert(`Assessor criado com sucesso!`);
      reset();
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  };

  const renderRoleBadge = (role: string) => {
    if (role === 'admin') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200"><Shield size={10} /> ADMIN</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200"><Briefcase size={10} /> ASSESSOR</span>;
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="text-blue-600" /> Gestão de Acessos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Hierarquia de usuários. Bloqueie assessores para bloquear seus clientes.
          </p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm shadow-sm w-full md:w-auto justify-center">
          <Plus size={16} /> Novo Assessor
        </button>
      </div>

      <div className="space-y-4">
        
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase flex">
                        <div className="flex-1">Usuário</div>
                        <div className="w-32 text-center">Vínculos</div>
                        <div className="w-24 text-center">Status</div>
                        <div className="w-24 text-right">Ação</div>
                    </div>

                    {assessors.map((parent) => (
                        <div key={parent.id} className="border-b border-slate-100 last:border-0">
                            <div className={`flex items-center px-6 py-4 hover:bg-slate-50 transition-colors ${!parent.active ? 'bg-red-50/50' : ''}`}>
                                <div className="flex-1 flex items-center gap-3">
                                    <button onClick={() => toggleRow(parent.id)} className="text-slate-400 hover:text-blue-600 p-1">
                                        {expandedRows[parent.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </button>
                                    <div>
                                        <div className="font-medium text-slate-900 flex items-center gap-2">
                                            {renderRoleBadge(parent.role)}
                                            <span className="text-sm">{parent.email}</span>
                                            {/* Indicador visual se for VOCÊ */}
                                            {parent.id === currentUserId && <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 rounded border border-slate-200">(Você)</span>}
                                            {!parent.active && <span className="text-[10px] bg-red-100 text-red-600 px-2 rounded-full font-bold">BLOQUEADO</span>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="w-32 text-center text-sm text-slate-600 font-medium">
                                    {parent.clients.length} Clientes
                                </div>

                                <div className="w-24 text-center">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${parent.active ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                        {parent.active ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>

                                <div className="w-24 text-right">
                                    {/* REGRA DE PROTEÇÃO: Se for EU MESMO, não mostro o botão */}
                                    {parent.id !== currentUserId && (
                                      <button 
                                          onClick={() => handleToggleAssessor(parent)}
                                          className={`transition-colors p-2 rounded hover:bg-slate-200 ${parent.active ? 'text-green-600' : 'text-slate-400'}`}
                                          title="Alterar Acesso"
                                      >
                                          {parent.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                      </button>
                                    )}
                                </div>
                            </div>

                            {expandedRows[parent.id] && (
                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 shadow-inner">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 ml-8">Clientes Vinculados</h4>
                                    {parent.clients.length === 0 ? (
                                        <p className="text-sm text-slate-400 ml-8 italic">Nenhum cliente do portal vinculado.</p>
                                    ) : (
                                        <div className="space-y-2 ml-8">
                                            {parent.clients.map(client => (
                                                <div key={client.id} className="flex justify-between items-center bg-white p-3 rounded border border-slate-200 hover:shadow-sm transition-shadow">
                                                    <div className="flex items-center gap-3">
                                                        <Globe size={16} className="text-teal-600"/>
                                                        <div>
                                                            <div className="text-sm font-bold text-slate-800">{client.companyName || 'Empresa (Nome não carregado)'}</div>
                                                            <div className="text-xs text-slate-500">{client.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`text-[10px] font-bold ${client.active ? 'text-green-600' : 'text-red-600'}`}>
                                                            {client.active ? 'PORTAL LIBERADO' : 'PORTAL BLOQUEADO'}
                                                        </span>
                                                        <button onClick={() => handleToggleSingleUser(client)} className="text-slate-400 hover:text-blue-600">
                                                            {client.active ? <ToggleRight size={24}/> : <ToggleLeft size={24}/>}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {orphanClients.length > 0 && (
             <div className="mt-8">
                <h3 className="text-sm font-bold text-red-800 mb-2">⚠️ Clientes não vinculados (Órfãos)</h3>
                <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    {orphanClients.map(c => <div key={c.id} className="text-xs text-red-600">{c.email} (ID: {c.id})</div>)}
                </div>
             </div>
        )}

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