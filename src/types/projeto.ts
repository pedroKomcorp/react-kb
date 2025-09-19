import type { Etapa } from "./etapa";

export type Projeto = {
  id: number;
  nome: string;
  prioridade: 'UT' | 'AL' | 'MD' | 'BA';
  status: 'NI' | 'EA' | 'C' | 'P';
  categoria: 'DV' | 'MK' | 'OT';
  responsavel_id: number;
  descricao?: string | null;
  data_inicio?: string | null;
  data_prazo?: string | null;
  data_fim?: string | null;
  anexados?: unknown[];
  etapas?: Etapa[];
  usuarios_anexados?: number[]; // IDs of attached users
};