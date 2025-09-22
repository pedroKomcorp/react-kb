import React, { useRef, useState, useLayoutEffect } from 'react';
import type { Projeto } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';

interface ProjetoCarouselCardProps {
  projeto: Projeto;
  usuarios: Usuario[];
  onClick: () => void;
}

const ProjetoCarouselCard: React.FC<ProjetoCarouselCardProps> = ({ projeto, usuarios, onClick }) => {
  const responsavel = usuarios.find(u => u.id === projeto.responsavel_id)?.nome || 'Responsável não encontrado';
    const ref = useRef<HTMLDivElement>(null);
    const [isTiny, setIsTiny] = useState(false);

    useLayoutEffect(() => {
      function checkSize() {
        if (ref.current) {
          setIsTiny(ref.current.offsetWidth < 120 || ref.current.offsetHeight < 60);
        }
      }
      checkSize();
      window.addEventListener('resize', checkSize);
      return () => window.removeEventListener('resize', checkSize);
    }, []);

    return (
      <div
        ref={ref}
        className="bg-white rounded-lg shadow border border-gray-200 cursor-pointer hover:border-blue-400 flex flex-col justify-center items-center w-full h-{full} transition-all duration-200 p-2"
        onClick={onClick}
      >
        <div className="font-semibold text-xs text-blue-700 truncate w-full text-center" title={projeto.nome}>{projeto.nome}</div>
        {!isTiny && <>
          <div className="text-[10px] text-gray-500 truncate w-full text-center">Responsável: <span className="font-medium text-gray-700">{responsavel}</span></div>
          <div className="text-[10px] text-gray-500 text-center">Etapas: <span className="font-semibold">{projeto.etapas ? projeto.etapas.length : 0}</span></div>
        </>}
      </div>
    );
};

export default ProjetoCarouselCard;
