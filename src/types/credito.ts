// Status do crédito
export const StatusCreditoEnum = {
  EM_ANDAMENTO: 'em_andamento',
  HABILITADO: 'habilitado',
  COMPENSADO: 'compensado',
  INDEFERIDO: 'indeferido',
  PARCIALMENTE_COMPENSADO: 'parcialmente_compensado',
  AGUARDANDO_HABILITACAO: 'aguardando_habilitacao'
} as const;

export type StatusCredito = typeof StatusCreditoEnum[keyof typeof StatusCreditoEnum];

// Crédito principal
export interface Credito {
  id: number;
  cliente_id: number;
  nome: string;
  descricao?: string;
  valor_original: number;
  saldo_atual: number;
  status: StatusCredito;
  tem_atualizacao_selic: boolean;
  created_at: string;
  updated_at: string;
  cliente?: {
    id: number;
    nome: string;
    cnpj: string;
    estado: string;
  };
}

export interface CreateCreditoData {
  cliente_id: number;
  nome: string;
  descricao?: string;
  valor_original: number;
  status?: StatusCredito;
  tem_atualizacao_selic?: boolean;
  created_at?: string;
}

export interface UpdateCreditoData {
  nome?: string;
  descricao?: string;
  valor_original?: number;
  saldo_atual?: number;
  status?: StatusCredito;
  tem_atualizacao_selic?: boolean;
}

export interface CreditoFilters {
  cliente_id?: number;
  status?: StatusCredito;
  page?: number;
  size?: number;
}

export const TipoMovimentacaoEnum = {
  COMPENSACAO: 'COMPENSACAO',
  ATUALIZACAO_SELIC: 'ATUALIZACAO_SELIC',
  REAJUSTE: 'REAJUSTE'
} as const;

export type TipoMovimentacao = typeof TipoMovimentacaoEnum[keyof typeof TipoMovimentacaoEnum];

// Movimentação de crédito
export interface MovimentacaoCredito {
  id: number;
  credito_id: number;
  tipo: TipoMovimentacao;
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMovimentacaoData {
  tipo: TipoMovimentacao;
  valor: number;
  descricao: string;
  created_at?: string; // Data customizável para a movimentação
}

export interface UpdateMovimentacaoData {
  tipo?: TipoMovimentacao;
  valor?: number;
  descricao?: string;
  created_at?: string;
}

// Response types
export interface CreditoListResponse {
  creditos: Credito[];
  total: number;
  page: number;
  size: number;
  total_pages: number;
}

export interface ClienteCreditosResponse {
  creditos: Credito[];
  cliente: {
    id: number;
    nome: string;
    cnpj: string;
    estado: string;
  };
}

export interface CreditoListResponse {
  creditos: Credito[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Response for client-specific credits
export interface ClienteCreditosResponse {
  creditos: Credito[];
}

// Response for movimentações
export interface MovimentacoesResponse {
  movimentacoes: MovimentacaoCredito[];
}