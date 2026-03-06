import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, Modal, Popconfirm, Space, Spin, Tag, Typography, message } from 'antd';
import { CheckOutlined, ReloadOutlined, UndoOutlined } from '@ant-design/icons';
import {
  getServicosRecorrentes,
  updateServicoRecorrente,
} from '../../../services/servicosRecorrentes';
import type { Projeto } from '../../../types/projeto';

const statusColorMap: Record<Projeto['status'], string> = {
  NI: 'default',
  EA: 'processing',
  C: 'success',
  P: 'warning',
};

const statusLabelMap: Record<Projeto['status'], string> = {
  NI: 'Não Iniciado',
  EA: 'Em Andamento',
  C: 'Concluído',
  P: 'Pausado',
};

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const ServicosRecorrentesWidget: React.FC = () => {
  const [servicos, setServicos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [selectedServico, setSelectedServico] = useState<Projeto | null>(null);

  const loadServicos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getServicosRecorrentes({ limit: 30 });
      setServicos(response.servicos);
    } catch (loadError) {
      console.error('Erro ao carregar serviços recorrentes:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os serviços recorrentes.'
      );
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServicos();
  }, [loadServicos]);

  const sortedServicos = useMemo(() => {
    return [...servicos].sort((a, b) => {
      const aDate = a.recorrencia_proxima_execucao
        ? new Date(a.recorrencia_proxima_execucao).getTime()
        : Number.MAX_SAFE_INTEGER;
      const bDate = b.recorrencia_proxima_execucao
        ? new Date(b.recorrencia_proxima_execucao).getTime()
        : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  }, [servicos]);

  const handleToggleConclusao = async (servico: Projeto) => {
    const nextStatus: Projeto['status'] =
      servico.status === 'C' ? servico.recorrencia_status_reinicio ?? 'EA' : 'C';

    setUpdatingStatusId(servico.id);
    try {
      await updateServicoRecorrente(servico.id, { status: nextStatus });
      message.success(
        servico.status === 'C'
          ? `Serviço "${servico.nome}" reaberto com sucesso.`
          : `Serviço "${servico.nome}" concluído com sucesso.`
      );
      await loadServicos();
    } catch (statusError) {
      console.error('Erro ao atualizar status do serviço recorrente:', statusError);
      message.error(
        statusError instanceof Error
          ? statusError.message
          : 'Não foi possível atualizar o status do serviço recorrente.'
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Space direction="vertical" align="center" size={8}>
          <Spin size="small" />
          <Typography.Text type="secondary">Carregando serviços recorrentes...</Typography.Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center px-2">
        <Space direction="vertical" align="center" size={10}>
          <Typography.Text type="danger" className="text-center">
            {error}
          </Typography.Text>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => void loadServicos()}>
            Tentar novamente
          </Button>
        </Space>
      </div>
    );
  }

  if (!sortedServicos.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhum serviço recorrente encontrado."
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0 overflow-auto pr-1 widget-no-scrollbar">
        <div className="servicos-recorrentes-grid grid gap-3">
          {sortedServicos.map((servico) => (
            <article
              key={servico.id}
              className="servicos-recorrentes-card rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
            >
              <button
                type="button"
                className="w-full rounded-lg text-center transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                onClick={() => setSelectedServico(servico)}
              >
                <Typography.Text
                  strong
                  className="servicos-recorrentes-card-title block truncate text-center text-slate-900"
                >
                  {servico.nome}
                </Typography.Text>
              </button>

              <div className="servicos-recorrentes-card-status mt-2 flex flex-wrap justify-center gap-2">
                <Tag className="servicos-recorrentes-card-tag" color={statusColorMap[servico.status]}>
                  {statusLabelMap[servico.status]}
                </Tag>
                {servico.recorrencia_ativa === false && <Tag color="default">Inativa</Tag>}
              </div>

              <div className="servicos-recorrentes-card-actions mt-3 flex flex-wrap justify-center gap-2">
                <Button
                  size="small"
                  type="default"
                  className="servicos-recorrentes-card-button servicos-recorrentes-card-button-details"
                  onClick={() => setSelectedServico(servico)}
                >
                  Ver detalhes
                </Button>
                {servico.status === 'C' ? (
                  <Button
                    size="small"
                    type="default"
                    icon={<UndoOutlined />}
                    className="servicos-recorrentes-card-button shrink-0"
                    loading={updatingStatusId === servico.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleToggleConclusao(servico);
                    }}
                  >
                    Desfazer
                  </Button>
                ) : (
                  <Popconfirm
                    title="Concluir serviço?"
                    description="Isso marcará o serviço como concluído."
                    okText="Concluir"
                    cancelText="Cancelar"
                    onConfirm={() => void handleToggleConclusao(servico)}
                  >
                    <Button
                      size="small"
                      type="primary"
                      icon={<CheckOutlined />}
                      className="servicos-recorrentes-card-button shrink-0"
                      loading={updatingStatusId === servico.id}
                      onClick={(event) => event.stopPropagation()}
                    >
                      Concluir
                    </Button>
                  </Popconfirm>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      <Modal
        open={!!selectedServico}
        title={selectedServico?.nome}
        footer={null}
        onCancel={() => setSelectedServico(null)}
      >
        {selectedServico ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Tag color={statusColorMap[selectedServico.status]}>
                {statusLabelMap[selectedServico.status]}
              </Tag>
              {selectedServico.recorrencia_ativa === false && <Tag color="default">Inativa</Tag>}
            </div>
            <Typography.Paragraph className="mb-0">
              {selectedServico.descricao || 'Sem descrição.'}
            </Typography.Paragraph>
            <Typography.Text type="secondary" className="block">
              Próxima execução: {formatDateTime(selectedServico.recorrencia_proxima_execucao)}
            </Typography.Text>
            <Typography.Text type="secondary" className="block">
              Última execução: {formatDateTime(selectedServico.recorrencia_ultima_execucao)}
            </Typography.Text>
            <Typography.Text type="secondary" className="block">
              Intervalo: {selectedServico.recorrencia_intervalo_dias ?? '-'} dia(s)
            </Typography.Text>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ServicosRecorrentesWidget;
