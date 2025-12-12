import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { user } = await api.login(data.email, data.password);
      if (user) {
        toast.success(`Bem-vindo de volta!`);
        navigate('/dashboard'); 
      }
    } catch (error: any) {
      toast.error('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        
        {/* --- CABEÇALHO COM LOGO --- */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/favicon.png" alt="Logo LicitaManager" className="h-16 w-auto" />
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-[#002A54]">
            LICITA<span className="text-[#009B4D]">MANAGER</span>
          </h1>
          <p className="text-[#666666] mt-2">Acesse sua conta para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-[#002A54] mb-1">E-mail</label>
            <input 
              {...register('email', { required: true })}
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#009B4D] focus:border-[#009B4D] outline-none transition-all text-slate-700"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-[#002A54] mb-1">Senha</label>
            <div className="relative">
              <input 
                {...register('password', { required: true })}
                type={showPassword ? "text" : "password"} 
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#009B4D] focus:border-[#009B4D] outline-none transition-all pr-10 text-slate-700"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#002A54] focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-[#666666] cursor-pointer hover:text-[#002A54]">
              <input type="checkbox" className="mr-2 rounded text-[#009B4D] focus:ring-[#009B4D]" />
              Lembrar-me
            </label>
            <Link to="/forgot-password" className="text-[#009B4D] hover:text-[#007A3D] font-bold">
              Esqueceu a senha?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#009B4D] hover:bg-[#007A3D] text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Entrar no Sistema'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-[#666666] mb-3">Não tem uma conta?</p>
          
          {/* --- AQUI ESTÁ A MUDANÇA --- */}
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 text-[#002A54] font-bold hover:text-[#009B4D] hover:bg-slate-50 px-4 py-2 rounded-lg transition-all"
          >
            <UserPlus size={18} />
            Criar conta agora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;