import React from 'react';
import { Modal, Typography, Input, Select, Button } from 'antd';
import type { Etapa } from '../../types/etapa';

interface EtapaWithProjeto extends Etapa {
  projetoNome: string;
  projetoId: number;
}

interface EtapaDetailModalProps {
  etapa: EtapaWithProjeto | null;
  open: boolean;
  onClose: () => void;
}

const { Text } = Typography;

const EtapaDetailModal: React.FC<EtapaDetailModalProps & { width?: number, onUpdateEtapa?: (etapa: Partial<import('../../types/etapa').Etapa> & { id: number }) => void }> = ({ etapa, open, onClose, width, onUpdateEtapa }) => {
  const [edit, setEdit] = React.useState(false);
  const [nome, setNome] = React.useState(etapa?.nome || '');
  const [descricao, setDescricao] = React.useState(etapa?.descricao || '');
  const [status, setStatus] = React.useState(etapa?.status || 'NI');
  const [data_inicio, setDataInicio] = React.useState(etapa?.data_inicio || '');
  const [data_prazo, setDataPrazo] = React.useState(etapa?.data_prazo || '');
  const [data_fim, setDataFim] = React.useState(etapa?.data_fim || '');
  React.useEffect(() => {
    setNome(etapa?.nome || '');
    setDescricao(etapa?.descricao || '');
    setStatus(etapa?.status || 'NI');
    setDataInicio(etapa?.data_inicio || '');
    setDataPrazo(etapa?.data_prazo || '');
    setDataFim(etapa?.data_fim || '');
  }, [etapa]);
  if (!etapa) return null;
  return (
    <Modal
      title={edit ? 'Editar Etapa' : etapa.nome}
      open={open}
      onCancel={onClose}
      footer={null}
      width={width || 600}
    >
      <div className="space-y-2">
        {edit ? (
          <>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" />
            <Input.TextArea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" />
            <Select value={status} onChange={setStatus} options={[
              { value: 'NI', label: 'Não Iniciada' },
              { value: 'EA', label: 'Em Andamento' },
              { value: 'C', label: 'Concluída' },
              { value: 'P', label: 'Pausada' },
            ]} style={{ width: 200 }} />
            <Input value={data_inicio} onChange={e => setDataInicio(e.target.value)} type="date" style={{ width: 150 }} />
            <Input value={data_prazo} onChange={e => setDataPrazo(e.target.value)} type="date" style={{ width: 150 }} />
            <Input value={data_fim} onChange={e => setDataFim(e.target.value)} type="date" style={{ width: 150 }} />
            <Button type="primary" onClick={() => {
              if (onUpdateEtapa) {
                onUpdateEtapa({
                  id: etapa.id,
                  nome,
                  descricao,
                  status: status as import('../../types/etapa').StatusEtapaEnum,
                  data_inicio,
                  data_prazo,
                  data_fim
                });
              }
              setEdit(false);
            }}>Salvar</Button>
            <Button type="link" onClick={() => setEdit(false)}>Cancelar</Button>
          </>
        ) : (
          <>
            <div className="mb-2">
              <Text type="secondary">Projeto: {etapa.projetoNome}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Status: {etapa.status || '-'}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">ID: {etapa.id}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Descrição: {etapa.descricao || '-'}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Início: {etapa.data_inicio || '-'}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Prazo: {etapa.data_prazo || '-'}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Fim: {etapa.data_fim || '-'}</Text>
            </div>
            <div className="mb-2">
              <Text type="secondary">Criada em: {etapa.created_at ? new Date(etapa.created_at).toLocaleString() : '-'}</Text>
            </div>
            <Button type="link" onClick={() => setEdit(true)}>Editar</Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EtapaDetailModal;
