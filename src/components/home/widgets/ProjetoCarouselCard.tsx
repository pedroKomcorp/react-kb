import React, { useRef, useState, useLayoutEffect } from 'react';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';

interface ProjetoCarouselCardProps {
  projeto: Projeto;
  usuarios: Usuario[];
  onClick: (e?: React.MouseEvent) => void;
}

const ProjetoCarouselCard: React.FC<ProjetoCarouselCardProps> = ({ projeto, usuarios, onClick }) => {
  const responsavel = usuarios.find(u => u.id === projeto.responsavel_id)?.nome || 'Responsável não encontrado';
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<'tiny' | 'small' | 'medium' | 'large'>('medium');

  // Status mapping for better display
  const statusMap: { [key: string]: { label: string; color: string } } = {
    'EA': { label: 'Em Andamento', color: 'bg-blue-100 text-blue-800' },
    'NI': { label: 'Não Iniciado', color: 'bg-gray-100 text-gray-800' },
    'C': { label: 'Concluído', color: 'bg-green-100 text-green-800' },
    'P': { label: 'Pausado', color: 'bg-yellow-100 text-yellow-800' },
  };

  // Priority mapping
  const prioridadeMap: { [key: string]: { label: string; color: string } } = {
    'UT': { label: 'Urgente', color: 'bg-red-100 text-red-800' },
    'AL': { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
    'MD': { label: 'Média', color: 'bg-yellow-100 text-yellow-800' },
    'BA': { label: 'Baixa', color: 'bg-green-100 text-green-800' },
  };

  useLayoutEffect(() => {
    function checkSize() {
      if (ref.current) {
        const width = ref.current.offsetWidth;
        const height = ref.current.offsetHeight;
        
        if (width < 140 || height < 80) {
          setSize('tiny');
        } else if (width < 180 || height < 120) {
          setSize('small');
        } else if (width < 240) {
          setSize('medium');
        } else {
          setSize('large');
        }
      }
    }
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const currentStatus = statusMap[projeto.status] || { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800' };
  const currentPriority = prioridadeMap[projeto.prioridade] || null;

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(e);
      }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all duration-200 p-3 h-full"
      style={{
        boxSizing: 'border-box',
        minWidth: 120,
        maxWidth: 320,
        width: '100%',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tiny size - only project name */}
      {size === 'tiny' && (
        <div className="flex flex-col h-full justify-center">
          <div className="font-semibold text-xs text-blue-700 truncate text-center" title={projeto.nome}>
            {projeto.nome}
          </div>
        </div>
      )}

      {/* Small size - name + status badge */}
      {size === 'small' && (
        <div className="flex flex-col h-full justify-between">
          <div className="font-semibold text-sm text-blue-700 truncate text-center mb-2" title={projeto.nome}>
            {projeto.nome}
          </div>
          <div className="flex justify-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
              {currentStatus.label}
            </span>
          </div>
        </div>
      )}

      {/* Medium size - name + status + responsavel */}
      {size === 'medium' && (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="font-semibold text-sm text-blue-700 truncate text-center mb-2" title={projeto.nome}>
              {projeto.nome}
            </div>
            <div className="flex justify-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 truncate text-center" title={responsavel}>
            <span className="font-medium">{responsavel}</span>
          </div>
        </div>
      )}

      {/* Large size - all information */}
      {size === 'large' && (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="font-semibold text-base text-blue-700 truncate text-center mb-3" title={projeto.nome}>
              {projeto.nome}
            </div>
            
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
              {currentPriority && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentPriority.color}`}>
                  {currentPriority.label}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-600 truncate text-center" title={responsavel}>
              <span className="font-medium text-gray-700">{responsavel}</span>
            </div>
            <div className="text-xs text-gray-500 text-center">
              <span className="font-semibold">{projeto.etapas ? projeto.etapas.length : 0}</span> etapas
            </div>
            {projeto.data_inicio && (
              <div className="text-xs text-gray-500 text-center">
                Início: {new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjetoCarouselCard;
