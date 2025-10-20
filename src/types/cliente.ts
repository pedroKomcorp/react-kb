export const SimNaoEnum = {
  SIM: "S",
  NAO: "N"
} as const;

export type SimNaoEnum = typeof SimNaoEnum[keyof typeof SimNaoEnum];

export type DadosBancarios = {
  id?: number;
  cliente_id?: number;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  titular?: string;
  documento_titular?: string;
  chave_pix?: string;
};

export type EnderecoEntrega = {
  id?: number;
  cliente_id?: number;
  endereco?: string;
  endereco_numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
  codigo_pais?: string;
};

export type TagCliente = {
  id?: number;
  nome: string;
};

export type Cliente = {
  id?: number;
  // Dados básicos obrigatórios
  razao_social: string;
  cnpj_cpf: string;
  
  // Dados básicos opcionais
  nome_fantasia?: string | null;
  email?: string | null;
  codigo_cliente_omie?: number | null;
  codigo_cliente_integracao?: string | null;
  
  // Tipo de pessoa e flags
  pessoa_fisica: SimNaoEnum;
  inativo: SimNaoEnum;
  exterior: SimNaoEnum;
  
  // Endereço principal
  endereco?: string | null;
  endereco_numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  cidade_ibge?: string | null;
  estado?: string | null;
  cep?: string | null;
  complemento?: string | null;
  codigo_pais?: string | null;
  
  // Contato
  contato?: string | null;
  telefone1_ddd?: string | null;
  telefone1_numero?: string | null;
  telefone2_ddd?: string | null;
  telefone2_numero?: string | null;
  
  // Documentos
  inscricao_estadual?: string | null;
  inscricao_municipal?: string | null;
  
  // Campos legados para compatibilidade
  nome?: string | null;
  cnpj?: string | null;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Relacionamentos
  dados_bancarios?: DadosBancarios | null;
  endereco_entrega?: EnderecoEntrega | null;
  tags?: TagCliente[];
};