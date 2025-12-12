import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase'; // Usa direto o supabase para criar auth
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Signup: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // 1. Cria o usuário no Auth
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      if (authData.user) {
        // 2. O Trigger no banco vai criar o Profile como active: false
        toast.success("Conta criada com sucesso!");
        // Faz login automático ou manda pro login
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-8">
          <img src="/favicon.png" alt="Logo" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-[#002A54]">Crie sua conta</h1>
          <p className="text-[#666666]">Comece a profissionalizar sua assessoria</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#002A54] mb-1">E-mail Profissional</label>
            <input {...register('email', { required: true })} type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009B4D] outline-none" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#002A54] mb-1">Senha</label>
            <input {...register('password', { required: true, minLength: 6 })} type="password" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#009B4D] outline-none" placeholder="******" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#009B4D] hover:bg-[#007A3D] text-white font-bold py-3 rounded-lg transition-all flex justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta Grátis'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#666666]">
          Já tem uma conta? <Link to="/login" className="text-[#002A54] font-bold hover:underline">Fazer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;