export interface ListaTarefas {
  id: number;
  usuario_id: number;
  titulo: string;
  created_at: string;
  updated_at: string;
  total_itens: number;
  total_concluidos: number;
}

export interface ItemListaTarefas {
  id: number;
  lista_id: number;
  conteudo: string;
  concluido: boolean;
  ordem: number;
  concluido_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListaTarefasDetalhe extends ListaTarefas {
  itens: ItemListaTarefas[];
}

export interface CreateListaTarefasData {
  titulo: string;
}

export interface UpdateListaTarefasData {
  titulo: string;
}

export interface CreateItemListaTarefasData {
  conteudo: string;
}

export interface UpdateItemListaTarefasData {
  conteudo?: string;
  concluido?: boolean;
}

export interface ReorderItensListaTarefasData {
  item_ids: number[];
}

export interface ListaTarefasListResponse {
  listas: ListaTarefas[];
  total: number;
}

export interface ClearConcluidosResponse {
  removidos: number;
}
