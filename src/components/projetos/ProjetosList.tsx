import React from 'react';
import { List } from 'antd';
import ProjetoEtapaModal from './ProjetoEtapaModal';
import ProjetoCard from './ProjetoCard';
import type { Projeto } from '../../types/projeto';
import type { Usuario } from '../../types/usuario';
import { StatusEtapaEnum } from '../../types/etapa';

interface ProjetosListProps {
  onDeleteProjeto: (projetoId: number) => void;
  projetos: Projeto[];
  usuarios: Usuario[];
  loading: boolean;
  offset: number;
  limit: number;
  total: number;
  onPageChange: (page: number, pageSize: number) => void;
  onAddEtapa: (projetoId: number) => void;
  setDetailModalProjeto: (projeto: Projeto) => void;
  addEtapaProjetoId: number | null;
  setAddEtapaProjetoId: (id: number | null) => void;
  novoEtapaNome: string;
  setNovoEtapaNome: (nome: string) => void;
  handleAddEtapa: () => void;
  novoEtapaStatus: StatusEtapaEnum;
  setNovoEtapaStatus: (status: StatusEtapaEnum) => void;
  novoEtapaDescricao: string;
  setNovoEtapaDescricao: (desc: string) => void;
  novoEtapaDataInicio: string;
  setNovoEtapaDataInicio: (date: string) => void;
  novoEtapaDataPrazo: string;
  setNovoEtapaDataPrazo: (date: string) => void;
  novoEtapaDataFim: string;
  setNovoEtapaDataFim: (date: string) => void;
  onShowProjetoModal: () => void;
}

const ProjetosList: React.FC<ProjetosListProps> = ({
  onDeleteProjeto,
  projetos,
  usuarios,
  loading,
  offset,
  limit,
  total,
  onPageChange,
  onAddEtapa,
  setDetailModalProjeto,
  addEtapaProjetoId,
  setAddEtapaProjetoId,
  novoEtapaNome,
  setNovoEtapaNome,
  handleAddEtapa,
  novoEtapaStatus,
  setNovoEtapaStatus,
  novoEtapaDescricao,
  setNovoEtapaDescricao,
  novoEtapaDataInicio,
  setNovoEtapaDataInicio,
  novoEtapaDataPrazo,
  setNovoEtapaDataPrazo,
  novoEtapaDataFim,
  setNovoEtapaDataFim
}) => (
  <div className="w-full bg-white rounded-lg shadow-sm p-6">
    <List
      className="w-full"
      style={{ width: '100%' }}
      grid={{ gutter: [16, 20], column: 1 }}
      dataSource={projetos}
    loading={loading}
    locale={{ emptyText: 'Nenhum projeto cadastrado.' }}
    pagination={{
      current: Math.floor(offset / limit) + 1,
      pageSize: limit,
      total: total,
      onChange: onPageChange,
      showSizeChanger: true,
      pageSizeOptions: [5, 10, 20],
    }}
    renderItem={projeto => (
      <React.Fragment>
        <ProjetoCard
          projeto={projeto}
          usuarios={usuarios}
          onClick={() => setDetailModalProjeto(projeto)}
          onAddEtapa={onAddEtapa}
          onDeleteProjeto={() => onDeleteProjeto(projeto.id)}
        />
        <ProjetoEtapaModal
          projetoNome={projeto.nome}
          open={addEtapaProjetoId === projeto.id}
          onCancel={() => setAddEtapaProjetoId(null)}
          onOk={handleAddEtapa}
          novoEtapaNome={novoEtapaNome}
          setNovoEtapaNome={setNovoEtapaNome}
          novoEtapaStatus={novoEtapaStatus}
          setNovoEtapaStatus={setNovoEtapaStatus}
          novoEtapaDescricao={novoEtapaDescricao}
          setNovoEtapaDescricao={setNovoEtapaDescricao}
          novoEtapaDataInicio={novoEtapaDataInicio}
          setNovoEtapaDataInicio={setNovoEtapaDataInicio}
          novoEtapaDataPrazo={novoEtapaDataPrazo}
          setNovoEtapaDataPrazo={setNovoEtapaDataPrazo}
          novoEtapaDataFim={novoEtapaDataFim}
          setNovoEtapaDataFim={setNovoEtapaDataFim}
          etapas={projeto.etapas || []}
        />
      </React.Fragment>
    )}
  />
  </div>
);

export default ProjetosList;