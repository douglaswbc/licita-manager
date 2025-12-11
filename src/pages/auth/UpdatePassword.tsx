import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { supabase } from '../../lib/supabase'; // Importe o supabase client direto para verificar sessão
import { Loader2, Lock } from 'lucide-react';

const UpdatePassword = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Verifica se o usuário chegou aqui através do link mágico (tem sessão ativa)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        alert("Link inválido ou expirado.");
        navigate('/login');
      }
    });
  }, [navigate]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.updateUser({ password: data.password });
      alert("Senha atualizada com sucesso!");
      navigate('/'); // Vai para o Dashboard
    } catch (error: any) {
      alert('Erro ao atualizar senha: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Lock className="text-blue-600 size-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Senha</h1>
          <p className="text-slate-500 mt-2">Digite sua nova senha abaixo</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova Senha</label>
            <input 
              {...register('password', { required: true, minLength: 6 })}
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : 'Atualizar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;