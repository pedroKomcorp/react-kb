import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Empty, List, Space, Spin, Tag, Typography, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  getServicosRecorrentes,
  reiniciarServicoRecorrente,
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
  const [restartingId, setRestartingId] = useState<number | null>(null);

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

  const handleReiniciar = async (servico: Projeto) => {
    setRestartingId(servico.id);
    try {
      await reiniciarServicoRecorrente(servico.id);
      message.success(`Serviço "${servico.nome}" reiniciado com sucesso.`);
      await loadServicos();
    } catch (restartError) {
      console.error('Erro ao reiniciar serviço recorrente:', restartError);
      message.error(
        restartError instanceof Error
          ? restartError.message
          : 'Não foi possível reiniciar o serviço recorrente.'
      );
    } finally {
      setRestartingId(null);
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
    <div className="w-full h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <Typography.Text type="secondary">{sortedServicos.length} serviços</Typography.Text>
        <Button size="small" icon={<ReloadOutlined />} onClick={() => void loadServicos()}>
          Atualizar
        </Button>
      </div>

      <List
        size="small"
        className="max-h-full overflow-y-auto pr-1"
        dataSource={sortedServicos}
        renderItem={(servico) => (
          <List.Item
            key={servico.id}
            style={{ alignItems: 'flex-start' }}
            actions={[
              <Button
                key="reiniciar"
                size="small"
                type="text"
                loading={restartingId === servico.id}
                onClick={() => void handleReiniciar(servico)}
              >
                Reiniciar
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space size={8} wrap>
                  <Typography.Text strong>{servico.nome}</Typography.Text>
                  <Tag color={statusColorMap[servico.status]}>{statusLabelMap[servico.status]}</Tag>
                  {servico.recorrencia_ativa === false && <Tag color="default">Inativa</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size={0}>
                  <Typography.Text type="secondary">
                    Próxima execução: {formatDateTime(servico.recorrencia_proxima_execucao)}
                  </Typography.Text>
                  <Typography.Text type="secondary">
                    Intervalo: {servico.recorrencia_intervalo_dias ?? '-'} dia(s)
                  </Typography.Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default ServicosRecorrentesWidget;
