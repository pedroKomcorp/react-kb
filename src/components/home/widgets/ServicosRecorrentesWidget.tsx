import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Empty, Input, List, Spin, Tag, Typography, message } from 'antd';
import { CheckCircleOutlined, RollbackOutlined } from '@ant-design/icons';
import { getUsuarios } from '../../../services/usuarios';
import { getServicosRecorrentes, updateServicoRecorrente, type ServicoRecorrente } from '../../../services/servicosRecorrentes';
import type { ProjetoStatus } from '../../../types/projeto';
import type { Usuario } from '../../../types/usuario';
import './servicos-recorrentes-widget.css';

const { Text } = Typography;

const statusOptions: Array<{ value: ProjetoStatus; label: string }> = [
  { value: 'NI', label: 'Não Iniciado' },
  { value: 'EA', label: 'Em Andamento' },
  { value: 'P', label: 'Pausado' },
  { value: 'C', label: 'Concluído' },
];

const statusColor: Record<ProjetoStatus, string> = {
  NI: 'default',
  EA: 'processing',
  P: 'warning',
  C: 'success',
};

const statusLabel = (status: ProjetoStatus) => {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Não definido';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Não definido';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ServicosRecorrentesWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [servicos, setServicos] = useState<ServicoRecorrente[]>([]);
  const [filterNome, setFilterNome] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usuariosRes, servicosRes] = await Promise.all([
        getUsuarios(),
        getServicosRecorrentes(),
      ]);
      setUsuarios(usuariosRes);
      setServicos(servicosRes.projetos);
    } catch (error) {
      console.error('Erro ao carregar serviços recorrentes:', error);
      message.error('Não foi possível carregar os serviços recorrentes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredServicos = useMemo(() => {
    return servicos.filter((servico) => {
      return !filterNome || servico.nome.toLowerCase().includes(filterNome.toLowerCase());
    });
  }, [filterNome, servicos]);

  const getResponsavelNome = (responsavelId: number) => {
    return usuarios.find((usuario) => usuario.id === responsavelId)?.nome ?? 'Não definido';
  };

  const handleToggleConclusao = async (servico: ServicoRecorrente) => {
    const isDone = servico.status === 'C';
    const nextStatus: ProjetoStatus = isDone
      ? (servico.recorrencia_status_reinicio ?? 'NI')
      : 'C';

    setUpdatingId(servico.id);
    try {
      const updated = await updateServicoRecorrente(servico.id, {
        status: nextStatus,
        data_fim: null,
      });
      setServicos((prev) => prev.map((item) => (item.id === servico.id ? updated : item)));
      message.success(
        isDone ? 'Conclusão desfeita com sucesso.' : 'Serviço marcado como concluído.'
      );
    } catch (error) {
      console.error('Erro ao atualizar conclusão do serviço recorrente:', error);
      message.error('Falha ao atualizar o status do serviço recorrente.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="servicos-recorrentes-widget w-full h-full flex flex-col overflow-hidden p-3 gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          value={filterNome}
          onChange={(event) => setFilterNome(event.target.value)}
          placeholder="Buscar serviço recorrente"
          allowClear
          className="min-w-[220px] max-w-[360px] servicos-recorrentes-control"
        />
      </div>

      {filteredServicos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Empty description="Nenhum serviço recorrente encontrado" />
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto pr-1">
          <List
            dataSource={filteredServicos}
            split={false}
            renderItem={(servico) => {
              const done = servico.status === 'C';
              const recorrenciaStatus = servico.recorrencia_status_reinicio ?? 'NI';
              const intervalo = servico.recorrencia_intervalo_dias ?? 'Não definido';

              return (
                <List.Item className="!py-0 !mb-2">
                  <Card className="w-full !rounded-lg !border-slate-200 !shadow-sm hover:!shadow-md transition-shadow">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Text strong className="block text-sm truncate">
                            {servico.nome}
                          </Text>
                          <Text type="secondary" className="text-[11px]">
                            {getResponsavelNome(servico.responsavel_id)}
                          </Text>
                        </div>
                        <Tag className="!m-0" color={statusColor[servico.status]}>
                          {statusLabel(servico.status)}
                        </Tag>
                      </div>

                      <div className="flex flex-wrap gap-1 text-[11px]">
                        <Tag className="!m-0">Intervalo: {intervalo}d</Tag>
                        <Tag className="!m-0">Reinício: {statusLabel(recorrenciaStatus)}</Tag>
                      </div>

                      <div className="text-[11px] text-gray-500 leading-tight">
                        <div>Último: {formatDateTime(servico.recorrencia_ultima_execucao)}</div>
                        <div>Próximo: {formatDateTime(servico.recorrencia_proxima_execucao)}</div>
                      </div>

                      <Button
                        size="small"
                        type={done ? 'default' : 'primary'}
                        icon={done ? <RollbackOutlined /> : <CheckCircleOutlined />}
                        loading={updatingId === servico.id}
                        onClick={() => handleToggleConclusao(servico)}
                        className="self-end"
                      >
                        {done ? 'Desfazer' : 'Concluir'}
                      </Button>
                    </div>
                  </Card>
                </List.Item>
              );
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ServicosRecorrentesWidget;
