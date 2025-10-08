import React, { useEffect, useState } from 'react';
import { Modal, List, Button, Input, Select, Space, Typography, Popconfirm, Descriptions, Divider, Tag } from 'antd';
import { FolderOpenOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined, PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import type { Projeto } from '../../types/projeto';
import type { Usuario } from '../../types/usuario';
import type { Etapa, StatusEtapaEnum } from '../../types/etapa';

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
  canEditProjeto?: boolean;
  canAddEtapa?: boolean;
  canEditEtapa?: boolean;
}

const { Title, Text } = Typography;

const statusOptions = [
  { value: 'NI', label: 'Não Iniciada', color: 'default' },
  { value: 'EA', label: 'Em Andamento', color: 'processing' },
  { value: 'C', label: 'Concluída', color: 'success' },
  { value: 'P', label: 'Pausada', color: 'warning' },
];

const getStatusTag = (status: string) => {
  const option = statusOptions.find(opt => opt.value === status);
  return <Tag color={option?.color || 'default'}>{option?.label || status}</Tag>;
};

const priorityOptions = [
    { value: 'UT', label: 'Urgente' },
    { value: 'AL', label: 'Alta' },
    { value: 'MD', label: 'Média' },
    { value: 'BA', label: 'Baixa' },
];

const categoryOptions = [
    { value: 'DV', label: 'Desenvolvimento' },
    { value: 'MK', label: 'Marketing' },
    { value: 'OT', label: 'Outro' },
];

// Helper to format date for input[type="date"]
const formatDateForInput = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};


const ProjetoDetailModal: React.FC<ProjetoDetailModalProps> = ({
  projeto,
  usuarios,
  open,
  onClose,
  onAddEtapa,
  onSelectEtapa,
  onUpdateProjeto,
  onUpdateEtapa,
  onDeleteEtapa,
  loading,
  // --- DESTRUCTURED WITH DEFAULT VALUE ---
  canEditProjeto = true,
  canAddEtapa = true,
  canEditEtapa = true,
}) => {
  // State for toggling UI sections
  const [isAddingEtapa, setIsAddingEtapa] = useState(false);
  const [isEditingProjeto, setIsEditingProjeto] = useState(false);
  const [editingEtapaId, setEditingEtapaId] = useState<number | null>(null);

  // Consolidated state for new etapa form
  const [newEtapa, setNewEtapa] = useState<Partial<Etapa>>({ nome: '', status: 'NI', descricao: '', data_inicio: '', data_prazo: '', data_fim: '', usuario_id: undefined });

  // Consolidated state for the project being edited
  const [editedProjeto, setEditedProjeto] = useState<Projeto | null>(null);
  
  // Consolidated state for the etapa being edited
  const [editedEtapa, setEditedEtapa] = useState<Partial<Etapa> & { id: number } | null>(null);

  useEffect(() => {
    if (projeto) {
      const projectWithNormalizedUsers = { ...projeto } as Projeto;
      if (projectWithNormalizedUsers.anexados && !projectWithNormalizedUsers.usuarios_anexados) {
        projectWithNormalizedUsers.usuarios_anexados = (projectWithNormalizedUsers.anexados as Usuario[])
          .filter(item => item && typeof item.id !== 'undefined')
          .map(user => user.id);
      }
      setEditedProjeto(projectWithNormalizedUsers);
    }
    setIsEditingProjeto(false);
    setIsAddingEtapa(false);
    setEditingEtapaId(null);
  }, [projeto, open]);

  const handleUpdateProjeto = () => {
    if (editedProjeto) {
      onUpdateProjeto(editedProjeto);
      setIsEditingProjeto(false);
    }
  };

  const handleCancelEditProjeto = () => {
    setEditedProjeto(projeto); // Revert changes
    setIsEditingProjeto(false);
  }

  const handleAddEtapa = () => {
    const payload = { ...newEtapa };
    
    const formattedPayload: Partial<Etapa> = {
      ...payload,
      projeto_id: projeto?.id,
      data_inicio: payload.data_inicio ? new Date(`${payload.data_inicio}T00:00:00`).toISOString() : undefined,
      data_prazo: payload.data_prazo ? new Date(`${payload.data_prazo}T00:00:00`).toISOString() : undefined,
      data_fim: payload.data_fim ? new Date(`${payload.data_fim}T00:00:00`).toISOString() : undefined,
    };
    
    Object.keys(formattedPayload).forEach(key => {
        if (formattedPayload[key as keyof Etapa] === undefined) {
            delete formattedPayload[key as keyof Etapa];
        }
    });

    onAddEtapa(formattedPayload);
    setNewEtapa({ nome: '', status: 'NI', descricao: '', data_inicio: '', data_prazo: '', data_fim: '', usuario_id: undefined });
    setIsAddingEtapa(false);
  }

  const handleStartEditEtapa = (etapa: Etapa) => {
    setEditingEtapaId(etapa.id);
    setEditedEtapa({ ...etapa });
  };

  const handleCancelEditEtapa = () => {
    setEditingEtapaId(null);
    setEditedEtapa(null);
  };
  
  const handleUpdateEtapa = () => {
    if (editedEtapa) {
      const payload = { ...editedEtapa };

      const formattedPayload = {
        ...payload,
        data_inicio: payload.data_inicio ? new Date(`${payload.data_inicio.split('T')[0]}T00:00:00`).toISOString() : undefined,
        data_prazo: payload.data_prazo ? new Date(`${payload.data_prazo.split('T')[0]}T00:00:00`).toISOString() : undefined,
        data_fim: payload.data_fim ? new Date(`${payload.data_fim.split('T')[0]}T00:00:00`).toISOString() : undefined,
      };

      Object.keys(formattedPayload).forEach(key => {
        if (formattedPayload[key as keyof typeof formattedPayload] === undefined) {
            delete formattedPayload[key as keyof typeof formattedPayload];
        }
      });
      
      onUpdateEtapa(formattedPayload as Partial<Etapa> & { id: number });
      handleCancelEditEtapa();
    }
  };

  if (!projeto || !editedProjeto) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      title={
        <Space align="center" size="middle">
            <FolderOpenOutlined style={{ color: '#1890ff' }} />
            <Title level={4} style={{ margin: 0 }}>{editedProjeto.nome}</Title>
        </Space>
      }
    >
      <div className="space-y-4 pt-4">
        <div className="flex justify-end gap-2">
            {/* --- CONDITIONAL RENDERING APPLIED --- */}
            {!isEditingProjeto ? (
                canEditProjeto && <Button icon={<EditOutlined />} onClick={() => setIsEditingProjeto(true)}>Editar Projeto</Button>
            ) : (
                <>
                    <Button icon={<CloseCircleOutlined />} onClick={handleCancelEditProjeto}>Cancelar</Button>
                    <Button type="primary" icon={<SaveOutlined />} onClick={handleUpdateProjeto}>Salvar Projeto</Button>
                </>
            )}
        </div>

        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Nome do Projeto">
            {isEditingProjeto ? <Input value={editedProjeto.nome} onChange={e => setEditedProjeto(p => p ? { ...p, nome: e.target.value } : null)} /> : <strong>{editedProjeto.nome}</strong>}
          </Descriptions.Item>
          <Descriptions.Item label="Responsável">
            {isEditingProjeto ? <Select value={editedProjeto.responsavel_id} onChange={val => setEditedProjeto(p => p ? { ...p, responsavel_id: val } : null)} options={usuarios.map(u => ({ value: u.id, label: u.nome }))} style={{ width: '100%' }} /> : (usuarios.find(u => u.id === editedProjeto.responsavel_id)?.nome || 'N/A')}
          </Descriptions.Item>

          <Descriptions.Item label="Status">
            {isEditingProjeto ? <Select value={editedProjeto.status} onChange={val => setEditedProjeto(p => p ? { ...p, status: val } : null)} options={statusOptions.map(s=> ({value: s.value, label: s.label}))} style={{ width: '100%' }} /> : getStatusTag(editedProjeto.status)}
          </Descriptions.Item>
           <Descriptions.Item label="Prioridade">
            {isEditingProjeto ? <Select value={editedProjeto.prioridade} onChange={val => setEditedProjeto(p => p ? { ...p, prioridade: val } : null)} options={priorityOptions} style={{ width: '100%' }} /> : editedProjeto.prioridade}
          </Descriptions.Item>

          <Descriptions.Item label="Categoria">
            {isEditingProjeto ? <Select value={editedProjeto.categoria} onChange={val => setEditedProjeto(p => p ? { ...p, categoria: val } : null)} options={categoryOptions} style={{ width: '100%' }} /> : categoryOptions.find(c=>c.value === editedProjeto.categoria)?.label}
          </Descriptions.Item>
          <Descriptions.Item label="Anexos">
            {Array.isArray(editedProjeto.anexados) ? editedProjeto.anexados.length : 0}
          </Descriptions.Item>

          <Descriptions.Item label="Data de Início" span={1}>
             {isEditingProjeto ? <Input type="date" value={formatDateForInput(editedProjeto.data_inicio)} onChange={e => setEditedProjeto(p => p ? { ...p, data_inicio: e.target.value } : null)} /> : (formatDateForInput(editedProjeto.data_inicio) || '-')}
          </Descriptions.Item>
          <Descriptions.Item label="Prazo Final" span={1}>
             {isEditingProjeto ? <Input type="date" value={formatDateForInput(editedProjeto.data_prazo)} onChange={e => setEditedProjeto(p => p ? { ...p, data_prazo: e.target.value } : null)} /> : (formatDateForInput(editedProjeto.data_prazo) || '-')}
          </Descriptions.Item>

          <Descriptions.Item label="Descrição" span={2}>
            {isEditingProjeto ? <Input.TextArea value={editedProjeto.descricao || ''} onChange={e => setEditedProjeto(p => p ? { ...p, descricao: e.target.value } : null)} rows={3}/> : (editedProjeto.descricao || '-')}
          </Descriptions.Item>
           <Descriptions.Item label="Usuários Anexados" span={2}>
            {isEditingProjeto ? (
              <Select mode="multiple" value={editedProjeto.usuarios_anexados} onChange={val => setEditedProjeto(p => p ? { ...p, usuarios_anexados: val } : null)} options={usuarios.map(u => ({ value: u.id, label: u.nome }))} style={{ width: '100%' }} placeholder="Selecione usuários"/>
            ) : (
                (editedProjeto.usuarios_anexados && editedProjeto.usuarios_anexados.length > 0)
                ? editedProjeto.usuarios_anexados.map(id => usuarios.find(u => u.id === id)?.nome || id).join(', ')
                : '-'
            )}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <div>
            <div className="flex justify-between items-center mb-2">
                <Title level={5}>Etapas ({Array.isArray(editedProjeto.etapas) ? editedProjeto.etapas.length : 0})</Title>
                {canAddEtapa && (
                    <Button type="primary" ghost icon={<PlusOutlined />} onClick={() => setIsAddingEtapa(v => !v)}>
                        {isAddingEtapa ? 'Cancelar' : 'Adicionar Etapa'}
                    </Button>
                )}
            </div>

            {isAddingEtapa && canAddEtapa && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-dashed">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Input value={newEtapa.nome} onChange={e => setNewEtapa(s => ({...s, nome: e.target.value}))} placeholder="Nome da nova etapa" />
                    <Input.TextArea value={newEtapa.descricao || ''} onChange={e => setNewEtapa(s => ({...s, descricao: e.target.value}))} placeholder="Descrição da etapa" rows={2}/>
                    <Select
                      showSearch
                      placeholder="Selecione o responsável pela etapa"
                      value={newEtapa.usuario_id}
                      onChange={val => setNewEtapa(e => ({...e, usuario_id: val}))}
                      options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
                      style={{ width: '100%' }}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                    />
                    <Space wrap>
                        <Select value={newEtapa.status} onChange={val => setNewEtapa(s => ({...s, status: val as StatusEtapaEnum}))} options={statusOptions.map(s => ({value: s.value, label: s.label}))} style={{ width: 150 }} placeholder="Status" />
                        <Input addonBefore="Início" value={newEtapa.data_inicio || ''} onChange={e => setNewEtapa(s => ({...s, data_inicio: e.target.value}))} type="date" style={{ width: 200 }} />
                        <Input addonBefore="Prazo" value={newEtapa.data_prazo || ''} onChange={e => setNewEtapa(s => ({...s, data_prazo: e.target.value}))} type="date" style={{ width: 200 }} />
                        <Input addonBefore="Fim" value={newEtapa.data_fim || ''} onChange={e => setNewEtapa(s => ({...s, data_fim: e.target.value}))} type="date" style={{ width: 200 }} />
                    </Space>
                    <Button type="primary" loading={loading} onClick={handleAddEtapa} icon={<SaveOutlined />}>Salvar Etapa</Button>
                </Space>
              </div>
            )}

            <List
              size="large"
              dataSource={Array.isArray(editedProjeto.etapas) ? editedProjeto.etapas : []}
              locale={{ emptyText: 'Nenhuma etapa cadastrada para este projeto.' }}
              renderItem={etapa => {
                  const isEditingThisEtapa = editingEtapaId === etapa.id && editedEtapa;
                  if (isEditingThisEtapa) {
                      return (
                          <List.Item className="bg-blue-50 p-4 rounded-md">
                             <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                  <Input value={editedEtapa.nome} onChange={e => setEditedEtapa(et => et ? {...et, nome: e.target.value} : null)} placeholder="Nome da etapa" />
                                  <Input.TextArea value={editedEtapa.descricao || ''} onChange={e => setEditedEtapa(et => et ? {...et, descricao: e.target.value} : null)} placeholder="Descrição" rows={2}/>
                                  <Select
                                    showSearch
                                    placeholder="Selecione o responsável pela etapa"
                                    value={editedEtapa.usuario_id}
                                    onChange={val => setEditedEtapa(et => et ? {...et, usuario_id: val} : null)}
                                    options={usuarios.map(u => ({ value: u.id, label: u.nome }))}
                                    style={{ width: '100%' }}
                                    filterOption={(input, option) =>
                                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                  />
                                  <Space wrap>
                                      <Select value={editedEtapa.status} onChange={val => setEditedEtapa(et => et ? {...et, status: val as StatusEtapaEnum} : null)} options={statusOptions.map(s=> ({value: s.value, label: s.label}))} style={{ width: 150 }}/>
                                      <Input addonBefore="Início" value={formatDateForInput(editedEtapa.data_inicio)} onChange={e => setEditedEtapa(et => et ? {...et, data_inicio: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                      <Input addonBefore="Prazo" value={formatDateForInput(editedEtapa.data_prazo)} onChange={e => setEditedEtapa(et => et ? {...et, data_prazo: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                      <Input addonBefore="Fim" value={formatDateForInput(editedEtapa.data_fim)} onChange={e => setEditedEtapa(et => et ? {...et, data_fim: e.target.value} : null)} type="date" style={{ width: 200 }} />
                                  </Space>
                                  <Space>
                                      <Button type="primary" onClick={handleUpdateEtapa} icon={<SaveOutlined />}>Salvar</Button>
                                      <Button onClick={handleCancelEditEtapa}>Cancelar</Button>
                                       <Popconfirm title="Tem certeza que deseja deletar?" onConfirm={() => onDeleteEtapa(etapa.id)} okText="Sim" cancelText="Não">
                                           <Button danger icon={<DeleteOutlined />}>Deletar</Button>
                                       </Popconfirm>
                                  </Space>
                             </Space>
                          </List.Item>
                      );
                  }

                  const responsavel = usuarios.find(u => u.id === etapa.usuario_id);

                  return (
                      <List.Item
                          actions={canEditEtapa ? [
                              <Button type="link" onClick={(e) => { e.stopPropagation(); handleStartEditEtapa(etapa); }}>Editar</Button>
                          ] : []}
                          className="hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => onSelectEtapa(etapa)}
                      >
                          <List.Item.Meta
                              title={<Text strong>{etapa.nome}</Text>}
                              description={etapa.descricao || '-'}
                          />
                          <div className="flex items-center gap-4">
                              {responsavel && (
                                <Tag icon={<UserOutlined />}>
                                  {responsavel.nome}
                                </Tag>
                              )}
                              {getStatusTag(etapa.status)}
                          </div>
                      </List.Item>
                  );
              }}
            />
        </div>
      </div>
    </Modal>
  );
};

export default ProjetoDetailModal;