import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Loader2, Copy, Check } from 'lucide-react'; // Ícones
import { api } from '../services/api';
import { Settings as SettingsType } from '../types';

// Componente para copiar variável ao clicar
const VariableBadge = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text); // Copia para área de transferência
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reseta após 2s
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-medium border transition-all
        ${copied 
          ? 'bg-green-100 text-green-700 border-green-200' 
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:border-slate-300'}
      `}
      title="Clique para copiar"
    >
      {text}
      {copied ? <Check size={10} /> : <Copy size={10} />}
    </button>
  );
};

const Settings = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SettingsType>();
  const [loading, setLoading] = useState(true);

  // Carregar configurações ao abrir a tela
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getSettings();
        if (data) {
          // Espelha o conteúdo do banco nos campos
          reset(data); 
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [reset]);

  const onSubmit = async (data: SettingsType) => {
    try {
      await api.saveSettings(data);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar.');
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Configurações de E-mail</h1>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
        
        {/* CONFIGURAÇÃO DE REMETENTE */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Remetente</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail de Envio</label>
            <input 
              {...register('email_sender')}
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: contato@suaempresa.com"
            />
            <p className="text-xs text-gray-500 mt-1">Este e-mail deve ser do seu domínio verificado ou Gmail (se usar SMTP).</p>
          </div>
        </div>

        {/* LEMBRETE */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold text-blue-700">Lembrete Automático</h2>
              <p className="text-sm text-slate-500">Enviado 2 dias antes do vencimento.</p>
            </div>
            <div className="text-right">
               <span className="text-xs font-semibold text-slate-500 block mb-1">Variáveis (Clique para copiar):</span>
               <div className="flex gap-2">
                 <VariableBadge text="{{CLIENTE}}" />
                 <VariableBadge text="{{LICITACAO}}" />
                 <VariableBadge text="{{LINK}}" />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input 
                {...register('reminder_subject')}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Lembrete de Licitação Próxima"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <textarea 
                {...register('reminder_body')}
                rows={4}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* RESUMO */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start mb-4">
             <div>
              <h2 className="text-xl font-semibold text-purple-700">Envio de Resumo</h2>
              <p className="text-sm text-slate-500">Enviado quando você cadastra o link do resumo.</p>
            </div>
            <div className="text-right">
               <span className="text-xs font-semibold text-slate-500 block mb-1">Variáveis (Clique para copiar):</span>
               <div className="flex gap-2">
                 <VariableBadge text="{{CLIENTE}}" />
                 <VariableBadge text="{{LICITACAO}}" />
                 <VariableBadge text="{{LINK}}" />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
              <input 
                {...register('summary_subject')}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Ex: Resumo da Licitação Disponível"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem</label>
              <textarea 
                {...register('summary_body')}
                rows={4}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 outline-none font-sans"
              />
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? <Loader2 className="animate-spin size-5" /> : <Save size={20} />}
            Salvar Alterações
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;