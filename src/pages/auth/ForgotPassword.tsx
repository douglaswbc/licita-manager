import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api'; // <--- Importando a API real
import { Loader2, CheckCircle } from 'lucide-react'; // Ícones para feedback

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.resetPassword(data.email);
      setSuccess(true); // Mostra mensagem de sucesso
    } catch (error: any) {
      alert('Erro: ' + (error.message || 'Não foi possível enviar o email.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="text-green-500 size-12" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verifique seu E-mail</h1>
          <p className="text-slate-500 mt-4">
            Enviamos um link de recuperação para o seu endereço de e-mail. Clique nele para definir uma nova senha.
          </p>
          <div className="mt-8">
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              ← Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
          <p className="text-slate-500 mt-2">Digite seu e-mail para receber as instruções</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              {...register('email', { required: true })}
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="voce@empresa.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-slate-500 hover:text-slate-800 transition-colors">
            ← Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;