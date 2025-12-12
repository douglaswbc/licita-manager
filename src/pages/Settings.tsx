import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Copy, Check, Server, Lock, Mail } from 'lucide-react';
import { api } from '../services/api';
import { Settings as SettingsType } from '../types';
import { toast } from 'react-toastify';

const VariableBadge = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button 
      type="button" 
      onClick={handleCopy} 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border transition-all 
        ${copied 
          ? 'bg-green-50 text-[#009B4D] border-green-200' 
          : 'bg-slate-100 text-[#666666] border-slate-200 hover:bg-slate-200'}`} 
      title="Clique para copiar"
    >
      {text} {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
};

const Settings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SettingsType>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSettings().then((data) => {
      if (data) reset(data);
      setLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data: SettingsType) => {
    try {
      await api.saveSettings(data);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações.');
    }
  };

  if (loading) return <div className="p-8 flex justify-center text-[#666666]"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[#002A54]">Configurações</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
        
        {/* --- ÁREA DE SMTP --- */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200 border-l-4 border-l-[#002A54]">
          <div className="flex items-center gap-2 mb-4 text-[#002A54]">
            <Server size={24} />
            <h2 className="text-xl font-bold">Seu Servidor de E-mail (SMTP)</h2>
          </div>
          <p className="text-sm text-[#666666] mb-4 text-justify bg-blue-50 p-3 rounded border border-blue-100">
            Configure aqui o e-mail que fará os disparos. Se for Gmail, ative a "Verificação em 2 etapas" e crie uma "Senha de App".
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Host SMTP</label>
              <input {...register('smtp_host')} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Porta</label>
              <input type="number" {...register('smtp_port')} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="587" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Usuário / E-mail</label>
              <input {...register('smtp_user')} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="seu.email@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-1">Senha (Senha de App)</label>
              <div className="relative">
                <input type="password" {...register('smtp_pass')} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="••••••••" />
                <Lock className="absolute right-3 top-2.5 text-slate-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* --- MENSAGENS --- */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 text-[#002A54] flex items-center gap-2"><Mail /> Modelos de E-mail</h2>
          
          {/* Lembrete */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-2 gap-2">
              <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">Lembrete Automático</h3>
              <div className="flex gap-2 flex-wrap"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LICITACAO}}" /></div>
            </div>
            <input {...register('reminder_subject')} className="w-full p-2 border border-slate-300 rounded mb-2 text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="Assunto do E-mail" />
            <textarea {...register('reminder_body')} rows={4} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="Corpo da mensagem..." />
          </div>

          {/* Resumo */}
          <div>
            <div className="flex flex-col md:flex-row justify-between mb-2 gap-2">
              <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">Envio de Resumo</h3>
              <div className="flex gap-2 flex-wrap"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LINK}}" /></div>
            </div>
            <input {...register('summary_subject')} className="w-full p-2 border border-slate-300 rounded mb-2 text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="Assunto do E-mail" />
            <textarea {...register('summary_body')} rows={4} className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" placeholder="Corpo da mensagem..." />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full md:w-auto bg-[#009B4D] hover:bg-[#007A3D] text-white px-8 py-3 rounded-lg flex gap-2 justify-center items-center font-bold shadow-md hover:shadow-lg transition-all"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Salvar Tudo
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;