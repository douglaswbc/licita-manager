import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Copy, Check, Server, Lock, Mail, User, ExternalLink, HelpCircle, PlayCircle } from 'lucide-react';
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
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SettingsType>({
    defaultValues: {
      email_remetente: '',
      smtp_host: '',
      smtp_port: 587,
      smtp_user: '',
      smtp_pass: '',
      assunto_lembrete: '',
      msg_lembrete: '',
      assunto_resumo: '',
      msg_resumo: ''
    }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getSettings();
        if (data) reset(data);
      } catch (error) {
        console.error("Erro ao carregar settings:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data: SettingsType) => {
    try {
      await api.saveSettings(data);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
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
          <div className="flex items-center gap-2 mb-6 text-[#002A54]">
            <Server size={24} />
            <h2 className="text-xl font-bold">Seu Servidor de E-mail (SMTP)</h2>
          </div>

          {/* --- NOVO: CARD DE AJUDA / TUTORIAL --- */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                 <h3 className="font-bold text-[#002A54] mb-3 flex items-center gap-2">
                   <HelpCircle size={20} className="text-blue-600"/> Como configurar o Gmail?
                 </h3>
                 <p className="text-sm text-[#666666] mb-4 text-justify leading-relaxed">
                   O Gmail não aceita sua senha pessoal por segurança. Você precisa ativar a <strong>"Verificação em 2 etapas"</strong> e criar uma <strong>"Senha de App"</strong> (código de 16 letras).
                 </p>
                 
                 <a 
                   href="https://myaccount.google.com/apppasswords" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 bg-[#002A54] hover:bg-[#001F3F] text-white px-5 py-3 rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg w-full md:w-auto justify-center"
                 >
                   <ExternalLink size={18} />
                   Gerar Senha de App Agora
                 </a>
                 <p className="text-[10px] text-slate-500 mt-2 text-center md:text-left">
                   *Clique para ir direto à página do Google
                 </p>
              </div>

              {/* VÍDEO DO YOUTUBE */}
              <div className="rounded-lg overflow-hidden shadow-lg border border-slate-200 bg-black aspect-video relative group">
                 <iframe 
                   width="100%" 
                   height="100%" 
                   /* ID DE VÍDEO EXEMPLO*/
                   src="https://www.youtube.com/embed/cPMFedDaa7Y" 
                   title="Tutorial Senha de App Gmail" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
                   className="absolute inset-0"
                 ></iframe>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* NOME DO REMETENTE */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-[#002A54] mb-1">Nome do Remetente (Como o cliente vê)</label>
              <div className="relative">
                <input 
                  {...register('email_remetente')} 
                  className="w-full pl-10 px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" 
                  placeholder="Ex: Águia Licitações & Consultoria" 
                />
                <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
              <p className="text-xs text-slate-400 mt-1">Este nome aparecerá no "De:" do e-mail recebido pelo cliente.</p>
            </div>

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
              <p className="text-xs text-[#009B4D] font-bold mt-1">Cole aqui a senha de 16 caracteres gerada no Google.</p>
            </div>
          </div>
        </div>

        {/* --- MENSAGENS (MANTIDO IGUAL) --- */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-6 text-[#002A54] flex items-center gap-2"><Mail /> Modelos de E-mail</h2>
          
          {/* Lembrete */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between mb-2 gap-2">
              <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">Lembrete Automático</h3>
              <div className="flex gap-2 flex-wrap"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LICITACAO}}" /></div>
            </div>
            <input 
              {...register('assunto_lembrete')} 
              className="w-full p-2 border border-slate-300 rounded mb-2 text-sm focus:ring-2 focus:ring-[#002A54] outline-none" 
              placeholder="Assunto do E-mail" 
            />
            <textarea 
              {...register('msg_lembrete')} 
              rows={4} 
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" 
              placeholder="Corpo da mensagem..." 
            />
          </div>

          {/* Resumo */}
          <div>
            <div className="flex flex-col md:flex-row justify-between mb-2 gap-2">
              <h3 className="font-bold text-[#002A54] text-sm uppercase tracking-wide">Envio de Resumo</h3>
              <div className="flex gap-2 flex-wrap"><VariableBadge text="{{CLIENTE}}" /><VariableBadge text="{{LINK}}" /><VariableBadge text="{{ASSESSOR}}" /></div>
            </div>
            <input 
              {...register('assunto_resumo')} 
              className="w-full p-2 border border-slate-300 rounded mb-2 text-sm focus:ring-2 focus:ring-[#002A54] outline-none" 
              placeholder="Assunto do E-mail" 
            />
            <textarea 
              {...register('msg_resumo')} 
              rows={4} 
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-[#002A54] outline-none" 
              placeholder="Corpo da mensagem..." 
            />
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