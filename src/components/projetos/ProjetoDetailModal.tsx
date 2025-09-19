import React from 'react';
import { Modal, List, Button, Input, Select, Space, Typography, Popconfirm } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import type { Projeto } from '../../types/projeto';
import type { Usuario } from '../../types/usuario';
import type { Etapa } from '../../types/etapa';

interface ProjetoDetailModalProps {
  projeto: Projeto | null;
  usuarios: Usuario[];
  open: boolean;
  onClose: () => void;
  onAddEtapa: (etapa: Partial<Etapa>) => void;
  onSelectEtapa: (etapa: Etapa) => void;
  onUpdateProjeto: (projeto: Partial<Projeto>) => void;
  onUpdateEtapa: (etapa: Partial<Etapa> & { id: number }) => void;
  onDeleteEtapa: (etapaId: number) => void;
  loading?: boolean;
}

const { Text } = Typography;

const statusOptions = [
  { value: 'NI', label: 'Não Iniciada' },
  { value: 'EA', label: 'Em Andamento' },
  { value: 'C', label: 'Concluída' },
  { value: 'P', label: 'Pausada' },
];

const ProjetoDetailModal: React.FC<ProjetoDetailModalProps> = ({ projeto, usuarios, open, onClose, onAddEtapa, onSelectEtapa, onUpdateProjeto, onUpdateEtapa, onDeleteEtapa, loading }) => {
  const [showAdd, setShowAdd] = React.useState(false);
  const [editProjeto, setEditProjeto] = React.useState(false);
  const [editEtapaId, setEditEtapaId] = React.useState<number | null>(null);
  // Local state for etapa editing
  const [etapaEditFields, setEtapaEditFields] = React.useState<{
    nome: string;
    status: import('../../types/etapa').StatusEtapaEnum;
    descricao: string;
    data_inicio: string;
    data_prazo: string;
    data_fim: string;
  } | null>(null);
  const [nome, setNome] = React.useState('');
  const [status, setStatus] = React.useState<import('../../types/etapa').StatusEtapaEnum>('NI');
  const [descricao, setDescricao] = React.useState('');
  const [data_inicio, setDataInicio] = React.useState('');
  const [data_prazo, setDataPrazo] = React.useState('');
  const [data_fim, setDataFim] = React.useState('');
  // Projeto edit state (must always be called)
  const [editNome, setEditNome] = React.useState('');
  const [editDescricao, setEditDescricao] = React.useState('');
  const [editStatus, setEditStatus] = React.useState<'NI' | 'EA' | 'C' | 'P'>('NI');
  const [editPrioridade, setEditPrioridade] = React.useState<'UT' | 'AL' | 'MD' | 'BA'>('MD');
  const [editCategoria, setEditCategoria] = React.useState<'DV' | 'MK' | 'OT'>('OT');
  const [editResponsavel, setEditResponsavel] = React.useState<number | undefined>(undefined);
  const [editDataInicio, setEditDataInicio] = React.useState('');
  const [editDataPrazo, setEditDataPrazo] = React.useState('');
  const [editDataFim, setEditDataFim] = React.useState('');
  const [editUsuariosAnexados, setEditUsuariosAnexados] = React.useState<number[]>([]);
  React.useEffect(() => {
    if (projeto) {
      setEditNome(projeto.nome);
      setEditDescricao(projeto.descricao || '');
      setEditStatus(projeto.status);
      setEditPrioridade(projeto.prioridade);
      setEditCategoria(projeto.categoria);
      setEditResponsavel(projeto.responsavel_id);
      setEditDataInicio(projeto.data_inicio || '');
      setEditDataPrazo(projeto.data_prazo || '');
      setEditDataFim(projeto.data_fim || '');
      setEditUsuariosAnexados(projeto.usuarios_anexados || []);
    }
  }, [projeto, open]);
  if (!projeto) return null;
  return (
    <Modal
      title={editProjeto ? 'Editar Projeto' : projeto.nome}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      className="rounded-lg"
    >
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2 text-xl font-semibold text-blue-700">
          <FolderOpenOutlined />
          {editProjeto ? (
            <Input value={editNome} onChange={e => setEditNome(e.target.value)} className="w-1/2" />
          ) : (
            projeto.nome
          )}
          <Button type="link" onClick={() => setEditProjeto(v => !v)}>{editProjeto ? 'Cancelar' : 'Editar Projeto'}</Button>
          {editProjeto && (
            <Button type="primary" onClick={() => {
              onUpdateProjeto({
                id: projeto.id,
                nome: editNome,
                descricao: editDescricao,
                status: editStatus as 'NI' | 'EA' | 'C' | 'P',
                prioridade: editPrioridade as 'UT' | 'AL' | 'MD' | 'BA',
                categoria: editCategoria as 'DV' | 'MK' | 'OT',
                responsavel_id: editResponsavel,
                data_inicio: editDataInicio,
                data_prazo: editDataPrazo,
                data_fim: editDataFim,
                usuarios_anexados: editUsuariosAnexados,
              });
              setEditProjeto(false);
            }}>Salvar</Button>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-base text-gray-600">
          <span>Prioridade: {editProjeto ? <Select value={editPrioridade} onChange={v => setEditPrioridade(v as 'UT' | 'AL' | 'MD' | 'BA')} options={['UT','AL','MD','BA'].map(v=>({value:v,label:v}))} style={{width:100}} /> : <span className="font-medium">{projeto.prioridade}</span>}</span>
          <span>Categoria: {editProjeto ? <Select value={editCategoria} onChange={v => setEditCategoria(v as 'DV' | 'MK' | 'OT')} options={['DV','MK','OT'].map(v=>({value:v,label:v}))} style={{width:120}} /> : <span className="font-medium">{projeto.categoria}</span>}</span>
          <span>Status: {editProjeto ? <Select value={editStatus} onChange={v => setEditStatus(v as 'NI' | 'EA' | 'C' | 'P')} options={statusOptions} style={{width:150}} /> : <span className="font-medium">{projeto.status}</span>}</span>
        </div>
        <div className="text-base text-gray-600">Responsável: {editProjeto ? <Select value={editResponsavel} onChange={setEditResponsavel} options={usuarios.map(u=>({value:u.id,label:u.nome}))} style={{width:200}} /> : <span className="font-medium">{usuarios.find(u => u.id === projeto.responsavel_id)?.nome || projeto.responsavel_id}</span>}</div>
        <div className="text-base text-gray-600">Usuários Anexados: {editProjeto ? (
          <Select
            mode="multiple"
            value={editUsuariosAnexados}
            onChange={setEditUsuariosAnexados}
            options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
            style={{ minWidth: 250 }}
            placeholder="Selecione usuários para anexar"
          />
        ) : (
          <span className="font-medium">
            {(projeto.usuarios_anexados && projeto.usuarios_anexados.length > 0)
              ? projeto.usuarios_anexados.map(id => usuarios.find(u => u.id === id)?.nome || id).join(', ')
              : '-'}
          </span>
        )}
        </div>
        <div className="text-base text-gray-600">Descrição: {editProjeto ? <Input.TextArea value={editDescricao} onChange={e=>setEditDescricao(e.target.value)} /> : <span className="font-medium">{projeto.descricao || '-'}</span>}</div>
        <div className="text-base text-gray-600">Início: {editProjeto ? <Input value={editDataInicio} onChange={e=>setEditDataInicio(e.target.value)} type="date" style={{width:150}} /> : <span className="font-medium">{projeto.data_inicio || '-'}</span>} | Prazo: {editProjeto ? <Input value={editDataPrazo} onChange={e=>setEditDataPrazo(e.target.value)} type="date" style={{width:150}} /> : <span className="font-medium">{projeto.data_prazo || '-'}</span>} | Fim: {editProjeto ? <Input value={editDataFim} onChange={e=>setEditDataFim(e.target.value)} type="date" style={{width:150}} /> : <span className="font-medium">{projeto.data_fim || '-'}</span>}</div>
        <div className="text-base text-gray-600">Anexos: <span className="font-medium">{(Array.isArray(projeto.anexados) ? projeto.anexados.length : 0)}</span></div>
        <div className="text-base text-gray-600 mb-2">
          Etapas: <span className="font-semibold">{Array.isArray(projeto.etapas) ? projeto.etapas.length : 0}</span>
          <Button type="link" onClick={() => setShowAdd(v => !v)}>{showAdd ? 'Cancelar' : 'Adicionar Etapa'}</Button>
        </div>
        {showAdd && (
          <div className="bg-gray-50 p-4 rounded-lg mb-2 flex flex-col gap-2">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome da etapa" />
              <Select value={status} onChange={v => setStatus(v as import('../../types/etapa').StatusEtapaEnum)} options={statusOptions} style={{ width: 200 }} />
              <Input.TextArea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição" />
              <Space>
                <Input value={data_inicio} onChange={e => setDataInicio(e.target.value)} placeholder="Data início" type="date" style={{ width: 150 }} />
                <Input value={data_prazo} onChange={e => setDataPrazo(e.target.value)} placeholder="Prazo" type="date" style={{ width: 150 }} />
                <Input value={data_fim} onChange={e => setDataFim(e.target.value)} placeholder="Data fim" type="date" style={{ width: 150 }} />
              </Space>
              <Button type="primary" loading={loading} onClick={() => {
                onAddEtapa({
                  nome,
                  status: status as import('../../types/etapa').StatusEtapaEnum,
                  descricao, data_inicio, data_prazo, data_fim,
                  projeto_id: projeto.id,
                  usuario_id: projeto.responsavel_id
                });
                setNome(''); setStatus('NI'); setDescricao(''); setDataInicio(''); setDataPrazo(''); setDataFim(''); setShowAdd(false);
              }}>Salvar Etapa</Button>
            </Space>
          </div>
        )}
        <List
          size="large"
          header={<span className="font-semibold text-gray-700">Etapas</span>}
          dataSource={Array.isArray(projeto.etapas) ? projeto.etapas : []}
          locale={{ emptyText: 'Nenhuma etapa.' }}
          renderItem={etapa => {
            if (editEtapaId === etapa.id && etapaEditFields) {
              return (
                <List.Item className="pl-2 flex flex-col gap-2 bg-gray-50">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input value={etapaEditFields.nome} onChange={e => setEtapaEditFields(f => f ? { ...f, nome: e.target.value } : f)} />
                    <Select value={etapaEditFields.status} onChange={v => setEtapaEditFields(f => f ? { ...f, status: v } : f)} options={statusOptions} style={{ width: 200 }} />
                    <Input.TextArea value={etapaEditFields.descricao} onChange={e => setEtapaEditFields(f => f ? { ...f, descricao: e.target.value } : f)} />
                    <Space>
                      <Input value={etapaEditFields.data_inicio} onChange={e => setEtapaEditFields(f => f ? { ...f, data_inicio: e.target.value } : f)} type="date" style={{ width: 150 }} />
                      <Input value={etapaEditFields.data_prazo} onChange={e => setEtapaEditFields(f => f ? { ...f, data_prazo: e.target.value } : f)} type="date" style={{ width: 150 }} />
                      <Input value={etapaEditFields.data_fim} onChange={e => setEtapaEditFields(f => f ? { ...f, data_fim: e.target.value } : f)} type="date" style={{ width: 150 }} />
                    </Space>
                    <Button type="primary" onClick={() => {
                      if (onUpdateEtapa) {
                        onUpdateEtapa({
                          ...etapa,
                          ...etapaEditFields,
                          id: etapa.id
                        });
                      }
                      setEditEtapaId(null);
                      setEtapaEditFields(null);
                    }}>Salvar</Button>
                    <Popconfirm title="Tem certeza que deseja deletar esta etapa?" onConfirm={() => { onDeleteEtapa(etapa.id); setEditEtapaId(null); setEtapaEditFields(null); }} okText="Sim" cancelText="Não">
                      <Button danger size="small">Deletar Etapa</Button>
                    </Popconfirm>
                    <Button type="link" onClick={() => { setEditEtapaId(null); setEtapaEditFields(null); }}>Cancelar</Button>
                  </Space>
                </List.Item>
              );
            }
            return (
              <List.Item className="pl-2 flex items-center gap-2 hover:bg-gray-100 cursor-pointer" onClick={() => onSelectEtapa(etapa)}>
                <div className="flex flex-col flex-1">
                  <Text strong>{etapa.nome}</Text>
                  <Text type="secondary" className="text-xs">{etapa.descricao || '-'}</Text>
                </div>
                <span className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 text-gray-700">{etapa.status || '-'}</span>
                <Button type="link" onClick={e => { e.stopPropagation(); setEditEtapaId(etapa.id); setEtapaEditFields({
                  nome: etapa.nome,
                  status: etapa.status,
                  descricao: etapa.descricao || '',
                  data_inicio: etapa.data_inicio || '',
                  data_prazo: etapa.data_prazo || '',
                  data_fim: etapa.data_fim || ''
                }); }}>Editar</Button>
              </List.Item>
            );
          }}
        />
      </div>
    </Modal>
  );
};

export default ProjetoDetailModal;
