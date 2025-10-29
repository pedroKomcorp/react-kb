export const StatusGuiaEnum = {
  PENDENTE: 'PENDENTE',
  PAGO: 'PAGO',
  CANCELADO: 'CANCELADO',
  VENCIDO: 'VENCIDO'
} as const;

export type StatusGuiaEnum = typeof StatusGuiaEnum[keyof typeof StatusGuiaEnum];

export type Guia = {
  id: number;
  tipo_guia: string;
  valor_principal: number;
  valor_total: number;
  data_vencimento: string;
  status: StatusGuiaEnum;
  codigo_receita?: string | null;
  periodo_apuracao?: string | null; // YYYY-MM
  valor_juros?: number | null;
  valor_multa?: number | null;
  data_pagamento?: string | null;
  data_competencia?: string | null;
  cnpj_contribuinte?: string | null;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  movimentacoes?: unknown[];
};

export type CreateGuiaData = {
  tipo_guia: string;
  valor_principal: number;
  valor_total: number;
  data_vencimento: string;
  status?: StatusGuiaEnum;
  codigo_receita?: string | null;
  periodo_apuracao?: string | null;
  valor_juros?: number | null;
  valor_multa?: number | null;
  data_pagamento?: string | null;
  data_competencia?: string | null;
  cnpj_contribuinte?: string | null;
  observacoes?: string | null;
};

export type UpdateGuiaData = {
  tipo_guia?: string;
  valor_principal?: number;
  valor_total?: number;
  data_vencimento?: string;
  status?: StatusGuiaEnum;
  codigo_receita?: string | null;
  periodo_apuracao?: string | null;
  valor_juros?: number | null;
  valor_multa?: number | null;
  data_pagamento?: string | null;
  data_competencia?: string | null;
  cnpj_contribuinte?: string | null;
  observacoes?: string | null;
};