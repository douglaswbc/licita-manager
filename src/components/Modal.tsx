import React, { Fragment } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* MUDANÇA AQUI: 
         - max-h-[90vh]: Altura máxima de 90% da tela
         - flex flex-col: Para organizar cabeçalho e corpo
      */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Cabeçalho Fixo */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-[#002A54]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Scroll 
           - overflow-y-auto: Cria a barra de rolagem se necessário
        */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;