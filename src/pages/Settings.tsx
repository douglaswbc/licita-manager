import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Copy, Check, Server, Lock, Mail } from 'lucide-react';
import { api } from '../services/api';
import { Settings as SettingsType } from '../types';

const VariableBadge = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={handleCopy} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border transition-all ${copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`} title="Clique para copiar">
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
      alert('Configurações salvas!');
    } catch (error) {
      alert('Erro ao salvar.');
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
        
        {/* --- ÁREA DE SMTP (NOVO) --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-200 border-l-4 border-l-orange-500">
          <div className="flex items-center gap-2 mb-4 text-orange-800">
            <Server size={24} />
            <h2 className="text-xl font-bold">Seu Servidor de E-mail (SMTP)</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Configure aqui o e-mail que fará os disparos. Se for Gmail, use a "Senha de App".
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host SMTP</label>
              <input {...register('smtp_host')} className="w-full p-2 border rounded" placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Porta</label>
              <input type="number" {...register('smtp_port')} className="w-full p-2 border rounded" placeholder="587" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário / E-mail</label>
              <input {...register('smtp_user')} className="w-full p-2 border rounded" placeholder="seu.email@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha (Senha de App)</label>
              <div className="relative">
                <input type="password" {...register('smtp_pass')} className="w-full p-2 border rounded" placeholder="••••••••" />
                <Lock className="absolute right-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* --- MENSAGENS --- */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2"><Mail /> Modelos de E-mail</h2>
          
          {/* Lembrete */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-blue-700">Lembrete Automático</h3>
              <div className="flex gap-2"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LICITACAO}}" /></div>
            </div>
            <input {...register('reminder_subject')} className="w-full p-2 border rounded mb-2" placeholder="Assunto" />
            <textarea {...register('reminder_body')} rows={3} className="w-full p-2 border rounded" />
          </div>

          {/* Resumo */}
          <div>
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-purple-700">Envio de Resumo</h3>
              <div className="flex gap-2"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LINK}}" /></div>
            </div>
            <input {...register('summary_subject')} className="w-full p-2 border rounded mb-2" placeholder="Assunto" />
            <textarea {...register('summary_body')} rows={3} className="w-full p-2 border rounded" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 flex gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Salvar Tudo
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;