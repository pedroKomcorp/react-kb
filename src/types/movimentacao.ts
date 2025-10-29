export const TipoMovimentacaoEnum = {
  CREDITO: 'CREDITO',
  DEBITO: 'DEBITO',
  COMPENSACAO: 'COMPENSACAO',
  TRANSFERENCIA: 'TRANSFERENCIA',
  AJUSTE: 'AJUSTE'
} as const;

export type TipoMovimentacaoEnum = typeof TipoMovimentacaoEnum[keyof typeof TipoMovimentacaoEnum];

export type MovimentacaoCredito = {
  id: number;
  credito_id: number;
  tipo: TipoMovimentacaoEnum;
  valor: number;
  descricao: string;
  saldo_anterior: number;
  saldo_posterior: number;
  referencia_externa?: string | null;
  created_at: string;
  updated_at: string;
  // Relations - using unknown for now to avoid any
  credito?: unknown;
  guias?: unknown[];
};

export type CreateMovimentacaoData = {
  credito_id: number;
  tipo: TipoMovimentacaoEnum;
  valor: number;
  descricao: string;
  referencia_externa?: string | null;
};

export type UpdateMovimentacaoData = {
  tipo?: TipoMovimentacaoEnum;
  valor?: number;
  descricao?: string;
  referencia_externa?: string | null;
};