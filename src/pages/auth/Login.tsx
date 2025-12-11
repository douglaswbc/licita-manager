import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../../services/api';
import { MessageCircle } from 'lucide-react'; // Ícone do WhatsApp (opcional, mas fica bonito)

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { user } = await api.login(data.email, data.password);
      if (user) {
        navigate('/');
      }
    } catch (error: any) {
      alert('Falha no Login: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 border border-slate-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">LicitaManager</h1>
          <p className="text-slate-500 mt-2">Acesse sua conta</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              {...register('email', { required: true })}
              type="email" 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              {...register('password', { required: true })}
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" />
              Lembrar-me
            </label>
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Esqueceu a senha?
            </Link>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 mb-3">Não tem uma conta?</p>
          <a 
            href="https://wa.me/5591992294869?text=Olá,%20gostaria%20de%20saber%20mais%20sobre%20o%20LicitaManager." 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg transition-all"
          >
            <MessageCircle size={18} />
            Fale com o Admin no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;