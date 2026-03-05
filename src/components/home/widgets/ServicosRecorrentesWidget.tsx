import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getInstanciasRecorrentesPendentes } from '../../../services/servicosRecorrentes';
import type { ServicoRecorrenteInstancia } from '../../../types/recorrencia';

type BadgeTone = 'red' | 'amber' | 'blue' | 'green' | 'gray';

interface NormalizedInstancia {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  dataVencimento: Date | null;
  dataVencimentoRaw: string;
  contexto: string;
  actionUrl: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const readString = (obj: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
  }
  return '';
};

const readRecord = (obj: Record<string, unknown>, keys: string[]): Record<string, unknown> => {
  for (const key of keys) {
    const value = obj[key];
    if (isRecord(value)) {
      return value;
    }
  }
  return {};
};

const parseDate = (value: string): Date | null => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDueDate = (date: Date | null, raw: string): string => {
  if (!date) {
    return raw || 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const statusToTone = (status: string): BadgeTone => {
  const normalized = status.toLowerCase();

  if (normalized.includes('venc') || normalized.includes('atras')) {
    return 'red';
  }
  if (normalized.includes('andamento') || normalized.includes('exec')) {
    return 'blue';
  }
  if (normalized.includes('concl') || normalized.includes('done')) {
    return 'green';
  }
  if (normalized.includes('pend')) {
    return 'amber';
  }
  return 'gray';
};

const badgeClasses: Record<BadgeTone, string> = {
  red: 'bg-red-100 text-red-800 border-red-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
};

const normalizeInstancia = (
  item: ServicoRecorrenteInstancia,
  index: number
): NormalizedInstancia => {
  const source = isRecord(item) ? item : {};
  const template = readRecord(source, [
    'template',
    'servico_template',
    'servico_recorrente',
    'template_servico',
  ]);
  const cliente = readRecord(source, ['cliente']);
  const projeto = readRecord(source, ['projeto']);

  const rawId = readString(source, ['id', 'instancia_id', 'instance_id']);
  const titulo =
    readString(source, ['nome', 'titulo', 'servico_nome', 'nome_servico']) ||
    readString(template, ['nome', 'titulo']) ||
    `Serviço recorrente ${rawId || `#${index + 1}`}`;

  const descricao =
    readString(source, ['descricao', 'detalhes', 'observacao', 'observações']) ||
    readString(template, ['descricao', 'detalhes']);

  const status =
    readString(source, ['status', 'situacao', 'state']) ||
    readString(template, ['status']) ||
    'pendente';

  const dueRaw =
    readString(source, [
      'data_vencimento',
      'vencimento',
      'due_date',
      'data_prevista',
      'data_execucao',
      'proxima_execucao',
    ]) ||
    readString(template, ['proxima_execucao', 'data_vencimento']);

  const clienteNome = readString(cliente, ['nome', 'razao_social']);
  const projetoNome = readString(projeto, ['nome']);
  const frequencia = readString(template, ['frequencia']);

  const contextoParts = [clienteNome, projetoNome, frequencia && `Freq. ${frequencia}`]
    .filter(Boolean)
    .join(' • ');

  const actionUrl = readString(source, [
    'url',
    'link',
    'details_url',
    'detalhes_url',
    'detail_url',
  ]);

  return {
    id: rawId || `temp-${index}`,
    titulo,
    descricao,
    status,
    dataVencimento: parseDate(dueRaw),
    dataVencimentoRaw: dueRaw,
    contexto: contextoParts,
    actionUrl,
  };
};

const compareByDueDate = (a: NormalizedInstancia, b: NormalizedInstancia): number => {
  if (!a.dataVencimento && !b.dataVencimento) {
    return a.titulo.localeCompare(b.titulo);
  }
  if (!a.dataVencimento) {
    return 1;
  }
  if (!b.dataVencimento) {
    return -1;
  }
  return a.dataVencimento.getTime() - b.dataVencimento.getTime();
};

const ServicosRecorrentesWidget: React.FC = () => {
  const [instancias, setInstancias] = useState<NormalizedInstancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInstancias = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getInstanciasRecorrentesPendentes(
        {
          includeOverdue: true,
          limit: 20,
        }
      );

      const normalized = data.map((item, index) => normalizeInstancia(item, index));
      normalized.sort(compareByDueDate);
      setInstancias(normalized);
    } catch (loadError) {
      console.error('Erro ao carregar serviços recorrentes pendentes:', loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os serviços recorrentes.'
      );
      setInstancias([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstancias();
  }, [loadInstancias]);

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="w-full h-full flex items-center justify-center text-sm text-gray-700">
          Carregando serviços recorrentes...
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-sm text-red-700">{error}</div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50"
            onClick={() => void loadInstancias()}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (instancias.length === 0) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-sm text-gray-700">Nenhuma instância pendente encontrada.</div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50"
            onClick={() => void loadInstancias()}
          >
            Atualizar
          </button>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between pb-2 px-1">
          <span className="text-xs font-medium text-gray-700">
            {instancias.length} pendentes
          </span>
          <button
            type="button"
            className="px-2 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50"
            onClick={() => void loadInstancias()}
          >
            Atualizar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
          {instancias.map((instancia) => {
            const tone = statusToTone(instancia.status);
            const dueDateLabel = formatDueDate(instancia.dataVencimento, instancia.dataVencimentoRaw);
            const canOpen = Boolean(instancia.actionUrl);

            return (
              <div
                key={instancia.id}
                className="rounded-lg border border-gray-200 bg-white/70 p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 leading-5">{instancia.titulo}</h4>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeClasses[tone]}`}
                  >
                    {instancia.status}
                  </span>
                </div>

                {instancia.descricao ? (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">{instancia.descricao}</p>
                ) : null}

                <div className="mt-2 text-xs text-gray-700">
                  <span className="font-medium">Vencimento:</span> {dueDateLabel}
                </div>

                {instancia.contexto ? (
                  <div className="mt-1 text-[11px] text-gray-500">{instancia.contexto}</div>
                ) : null}

                <div className="mt-2">
                  <button
                    type="button"
                    disabled={!canOpen}
                    className="px-2 py-1 rounded-md text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => {
                      if (canOpen) {
                        window.open(instancia.actionUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {canOpen ? 'Abrir' : 'Sem link'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [error, instancias, loadInstancias, loading]);

  return <div className="w-full h-full min-h-0">{content}</div>;
};

export default ServicosRecorrentesWidget;
