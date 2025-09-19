export const StatusEtapaEnum = {
  NI:"NI",
  EA:"EA",
  C:"C",
  P:"P"

} as const;

export type StatusEtapaEnum = typeof StatusEtapaEnum[keyof typeof StatusEtapaEnum];

export interface Etapa {
  id: number;
  nome: string;
  status: StatusEtapaEnum;
  projeto_id: number;
  usuario_id: number;
  descricao?: string | null;
  data_inicio?: string | null;
  data_prazo?: string | null;
  data_fim?: string | null;
  created_at?: string;
}
