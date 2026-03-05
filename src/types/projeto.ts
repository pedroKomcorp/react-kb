import type { Etapa } from "./etapa";
import type { Credito } from "./credito";

export type CategoriaProjeto =
  | 'CP'
  | 'RC'
  | 'AO'
  | 'AU'
  | 'CM'
  | 'PL'
  | 'CO'
  | 'ES'
  | 'RA'
  | 'ST'
  | 'SR'
  | 'OT';

export type StatusProjeto = 'NI' | 'EA' | 'C' | 'P';

export type Projeto = {
  id: number;
  nome: string;
  prioridade: 'UT' | 'AL' | 'MD' | 'BA';
  status: StatusProjeto;
  categoria: CategoriaProjeto;
  responsavel_id: number;
  cliente_id?: number | null;
  descricao?: string | null;
  data_inicio?: string | null;
  data_prazo?: string | null;
  data_fim?: string | null;
  recorrencia_ativa?: boolean | null;
  recorrencia_intervalo_dias?: number | null;
  recorrencia_status_reinicio?: StatusProjeto | null;
  recorrencia_ultima_execucao?: string | null;
  recorrencia_proxima_execucao?: string | null;
  anexados: AnexadoUser[]; // Use the interface we defined above
  etapas?: Etapa[];
  usuarios_anexados?: number[]; // IDs of attached users
  creditos?: Credito[]; 
  isPinned?: boolean;
};

interface AnexadoUser {
  id: number;
  nome: string;
  email: string;
}
