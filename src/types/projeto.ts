import type { Etapa } from "./etapa";
import type { Credito } from "./credito";

export type Projeto = {
  id: number;
  nome: string;
  prioridade: 'UT' | 'AL' | 'MD' | 'BA';
  status: 'NI' | 'EA' | 'C' | 'P';
  categoria: 'CP' | 'RC' | 'AO' | 'AU' | 'CM' | 'PL' | 'CO' | 'ES' | 'RA' | 'ST' | 'OT';
  responsavel_id: number;
  cliente_id?: number | null;
  descricao?: string | null;
  data_inicio?: string | null;
  data_prazo?: string | null;
  data_fim?: string | null;
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