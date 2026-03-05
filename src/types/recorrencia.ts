export const FrequenciaRecorrenciaEnum = {
  DIARIA: 'diaria',
  SEMANAL: 'semanal',
  QUINZENAL: 'quinzenal',
  MENSAL: 'mensal',
  BIMESTRAL: 'bimestral',
  TRIMESTRAL: 'trimestral',
  SEMESTRAL: 'semestral',
  ANUAL: 'anual',
  PERSONALIZADA: 'personalizada',
} as const;

export type FrequenciaRecorrencia = typeof FrequenciaRecorrenciaEnum[keyof typeof FrequenciaRecorrenciaEnum];

export const StatusTemplateRecorrenciaEnum = {
  ATIVO: 'ativo',
  PAUSADO: 'pausado',
  INATIVO: 'inativo',
} as const;

export type StatusTemplateRecorrencia =
  typeof StatusTemplateRecorrenciaEnum[keyof typeof StatusTemplateRecorrenciaEnum];

export const StatusInstanciaRecorrenciaEnum = {
  PENDENTE: 'pendente',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado',
  VENCIDO: 'vencido',
} as const;

export type StatusInstanciaRecorrencia =
  typeof StatusInstanciaRecorrenciaEnum[keyof typeof StatusInstanciaRecorrenciaEnum];

export interface ServicoRecorrenteTemplate {
  id: number;
  nome: string;
  descricao?: string | null;
  frequencia: FrequenciaRecorrencia;
  status?: StatusTemplateRecorrencia;
  ativo?: boolean;
  cliente_id?: number | null;
  projeto_id?: number | null;
  proxima_execucao?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ServicoRecorrenteInstancia {
  id: number;
  template_id?: number;
  nome?: string;
  descricao?: string | null;
  status?: StatusInstanciaRecorrencia | string;
  data_vencimento?: string | null;
  data_prevista?: string | null;
  data_execucao?: string | null;
  created_at?: string;
  updated_at?: string;
  template?: Partial<ServicoRecorrenteTemplate>;
  cliente?: {
    id?: number;
    nome?: string;
  };
  projeto?: {
    id?: number;
    nome?: string;
  };
  [key: string]: unknown;
}

export interface ServicosRecorrentesTemplateListResponse {
  templates: ServicoRecorrenteTemplate[];
  total?: number;
}

export interface ServicosRecorrentesInstanciaListResponse {
  instancias: ServicoRecorrenteInstancia[];
  total?: number;
}
