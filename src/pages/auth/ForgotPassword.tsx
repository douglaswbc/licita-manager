import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api'; 
import { Loader2, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'react-toastify'; // Usando Toastify

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.resetPassword(data.email);
      setSuccess(true);
      toast.success("E-mail de recuperação enviado!");
    } catch (error: any) {
      toast.error('Erro: ' + (error.message || 'Não foi possível enviar o email.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle className="text-[#009B4D] size-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#002A54]">Verifique seu E-mail</h1>
          <p className="text-[#666666] mt-4">
            Enviamos um link de recuperação para o seu endereço. Clique nele para definir uma nova senha.
          </p>
          <div className="mt-8">
            <Link to="/login" className="text-[#002A54] hover:text-[#009B4D] font-bold inline-flex items-center gap-2 transition-colors">
              <ArrowLeft size={18} /> Voltar para Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        
        {/* Cabeçalho igual ao Login */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <img src="/favicon.png" alt="Logo" className="h-12 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-[#002A54]">Recuperar Senha</h1>
          <p className="text-[#666666] mt-2">Digite seu e-mail para receber as instruções</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#002A54] mb-1">E-mail Cadastrado</label>
            <div className="relative">
                <input 
                {...register('email', { required: true })}
                type="email" 
                className="w-full pl-10 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#009B4D] focus:border-[#009B4D] outline-none transition-all text-slate-700"
                placeholder="seu@email.com"
                />
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#009B4D] hover:bg-[#007A3D] text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin size-5" /> : 'Enviar Link de Recuperação'}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <Link to="/login" className="text-[#666666] hover:text-[#002A54] font-medium transition-colors inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Voltar para Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;