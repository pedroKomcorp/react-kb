import React from 'react';
import { Modal, Input, Select, List } from 'antd';
import { UserAddOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Etapa } from '../../types/etapa';
import { StatusEtapaEnum } from '../../types/etapa';
import dayjs from 'dayjs';

interface ProjetoEtapaModalProps {
  projetoNome: string;
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  novoEtapaNome: string;
  setNovoEtapaNome: (nome: string) => void;
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
  etapas: Etapa[];
}

const ProjetoEtapaModal: React.FC<ProjetoEtapaModalProps> = ({
  projetoNome,
  open,
  onCancel,
  onOk,
  novoEtapaNome,
  setNovoEtapaNome,
  novoEtapaStatus,
  setNovoEtapaStatus,
  novoEtapaDescricao,
  setNovoEtapaDescricao,
  novoEtapaDataInicio,
  setNovoEtapaDataInicio,
  novoEtapaDataPrazo,
  setNovoEtapaDataPrazo,
  novoEtapaDataFim,
  setNovoEtapaDataFim,
  etapas
}) => (
  <Modal
    title={<span className="flex items-center gap-2 text-lg font-semibold"><UserAddOutlined className="text-green-500" />Adicionar Etapa ao projeto <span className="text-blue-600">{projetoNome}</span></span>}
    open={open}
    onCancel={onCancel}
    onOk={onOk}
    okText="Adicionar"
    cancelText="Cancelar"
    className="rounded-lg"
  >
    <div className="space-y-4">
      <Input
        value={novoEtapaNome}
        onChange={e => setNovoEtapaNome(e.target.value)}
        placeholder="Nome da etapa"
        className="rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
      />
      <Select
        placeholder="Status"
        className="w-full"
        value={novoEtapaStatus}
        options={[
          { value: StatusEtapaEnum.EA, label: 'Em Andamento' },
          { value: StatusEtapaEnum.C, label: 'Concluída' },
          { value: StatusEtapaEnum.P, label: 'Pausada' },
          { value: StatusEtapaEnum.NI, label: 'Não Iniciado' },
        ]}
        onChange={setNovoEtapaStatus}
      />
      <Input.TextArea
        placeholder="Descrição da etapa"
        value={novoEtapaDescricao}
        onChange={e => setNovoEtapaDescricao(e.target.value)}
        className="rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
        rows={2}
      />
      <div className="flex gap-2">
        <Input
          type="date"
          value={novoEtapaDataInicio}
          onChange={e => setNovoEtapaDataInicio(e.target.value)}
          className="rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          prefix={<CalendarOutlined />}
        />
        <Input
          type="date"
          value={novoEtapaDataPrazo}
          onChange={e => setNovoEtapaDataPrazo(e.target.value)}
          className="rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          prefix={<CalendarOutlined />}
        />
        <Input
          type="date"
          value={novoEtapaDataFim}
          onChange={e => setNovoEtapaDataFim(e.target.value)}
          className="rounded border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
          prefix={<CalendarOutlined />}
        />
      </div>
      <div className="pt-2">
        <List
          size="small"
          header={<span className="font-semibold text-gray-700">Etapas já cadastradas</span>}
          dataSource={etapas || []}
          locale={{ emptyText: 'Nenhuma etapa cadastrada.' }}
          renderItem={etapa => (
            <List.Item className="pl-2 flex items-center gap-2">
              <span className="font-medium text-gray-800">{etapa.nome}</span>
              <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">{etapa.status || '-'}</span>
              {etapa.data_inicio && (
                <span className="ml-2 text-xs text-gray-500">Início: {dayjs(etapa.data_inicio).format('DD/MM/YYYY')}</span>
              )}
              {etapa.data_prazo && (
                <span className="ml-2 text-xs text-gray-500">Prazo: {dayjs(etapa.data_prazo).format('DD/MM/YYYY')}</span>
              )}
              {etapa.data_fim && (
                <span className="ml-2 text-xs text-gray-500">Fim: {dayjs(etapa.data_fim).format('DD/MM/YYYY')}</span>
              )}
            </List.Item>
          )}
        />
      </div>
    </div>
  </Modal>
);

export default ProjetoEtapaModal;
