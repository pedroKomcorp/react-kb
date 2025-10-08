// Status do crédito
export const StatusCreditoEnum = {
  ATIVO: 'ATIVO',
  QUITADO: 'QUITADO',
  CANCELADO: 'CANCELADO'
} as const;

export type StatusCredito = typeof StatusCreditoEnum[keyof typeof StatusCreditoEnum];

// Tipo de movimentação
export const TipoMovimentacaoEnum = {
  COMPENSACAO: 'COMPENSACAO',
  ATUALIZACAO_SELIC: 'ATUALIZACAO_SELIC',
  CALCULO_MENSAL: 'CALCULO_MENSAL',
  DESCONTO: 'DESCONTO',
  AJUSTE_MANUAL: 'AJUSTE_MANUAL'
} as const;

export type TipoMovimentacao = typeof TipoMovimentacaoEnum[keyof typeof TipoMovimentacaoEnum];

// Crédito principal
export interface Credito {
  id: number;
  cliente_id: number;
  valor_original: number;
  saldo_atual: number;
  status: StatusCredito;
  data_vencimento?: string | null;
  descricao: string;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  cliente?: {
    id: number;
    nome: string;
    cnpj: string;
    estado: string;
  };
  movimentacoes?: MovimentacaoCredito[];
}

// Movimentação de crédito
export interface MovimentacaoCredito {
  id: number;
  credito_id: number;
  tipo: TipoMovimentacao;
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao: string;
  referencia_externa?: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamento
  credito?: Credito;
}

// DTOs para criação
export interface CreateCreditoData {
  cliente_id: number;
  valor_original: number;
  data_vencimento?: string | null;
  descricao: string;
}

export interface CreateMovimentacaoData {
  tipo: TipoMovimentacao;
  valor: number;
  descricao: string;
  referencia_externa?: string | null;
}

// DTOs para atualização
export interface UpdateCreditoData {
  valor_original?: number;
  status?: StatusCredito;
  data_vencimento?: string | null;
  descricao?: string;
}

// Tipos para filtros e listagem
export interface CreditoFilters {
  cliente_id?: number;
  status?: StatusCredito;
  page?: number;
  size?: number;
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