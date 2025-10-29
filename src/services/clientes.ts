import api from './api';
import type { Cliente, DadosBancarios, EnderecoEntrega, TagCliente, SimNaoEnum } from '../types/cliente';
import { authHeaders, safeString, safeEnum, getAuthToken } from './utils';

// Helper to normalize cliente data based on backend model structure
const normalizeCliente = (cliente: unknown): Cliente => {
  const c = cliente as Record<string, unknown>;
  
  // Ensure required fields have valid values
  const razaoSocial = safeString(c.razao_social || c.nome, 'Cliente sem nome');
  const cnpjCpf = safeString(c.cnpj_cpf || c.cnpj, '00.000.000/0000-00');
  
  return {
    // Basic required fields
    id: c.id as number,
    razao_social: razaoSocial,
    cnpj_cpf: cnpjCpf,
    
    // Basic optional fields
    nome_fantasia: c.nome_fantasia as string | null,
    email: c.email as string | null,
    codigo_cliente_omie: c.codigo_cliente_omie as number | null,
    codigo_cliente_integracao: c.codigo_cliente_integracao as string | null,
    
    // Flags - ensure they're never null by providing defaults
    pessoa_fisica: safeEnum(c.pessoa_fisica, ['S', 'N'], 'N') as SimNaoEnum,
    inativo: safeEnum(c.inativo, ['S', 'N'], 'N') as SimNaoEnum,
    exterior: safeEnum(c.exterior, ['S', 'N'], 'N') as SimNaoEnum,
    
    // Address fields
    endereco: c.endereco as string | null,
    endereco_numero: c.endereco_numero as string | null,
    bairro: c.bairro as string | null,
    cidade: c.cidade as string | null,
    cidade_ibge: c.cidade_ibge as string | null,
    estado: c.estado as string | null,
    cep: c.cep as string | null,
    complemento: c.complemento as string | null,
    codigo_pais: c.codigo_pais as string | null,
    
    // Contact fields
    contato: c.contato as string | null,
    telefone1_ddd: c.telefone1_ddd as string | null,
    telefone1_numero: c.telefone1_numero as string | null,
    telefone2_ddd: c.telefone2_ddd as string | null,
    telefone2_numero: c.telefone2_numero as string | null,
    
    // Document fields
    inscricao_estadual: c.inscricao_estadual as string | null,
    inscricao_municipal: c.inscricao_municipal as string | null,
    
    // Legacy compatibility fields
    nome: c.nome as string | null,
    cnpj: c.cnpj as string | null,
    
    // Timestamps
    created_at: c.created_at as string,
    updated_at: c.updated_at as string,
    
    // Relationships
    dados_bancarios: c.dados_bancarios as DadosBancarios | null,
    endereco_entrega: c.endereco_entrega as EnderecoEntrega | null,
    tags: (c.tags as TagCliente[]) || []
  };
};

export const getClientes = async (token?: string): Promise<Cliente[]> => {

  
  try {
    const res = await api.get<{ clientes: unknown[] }>(
      '/clientes/',
      token ? authHeaders(token) : undefined
    );
    // Debug: log raw data to help identify issues
    
    const normalizedClientes = res.data.clientes.map((cliente, index) => {
      try {
        return normalizeCliente(cliente);
      } catch (error) {
        console.error(`Error normalizing cliente at index ${index}:`, cliente, error);
        throw error;
      }
    });
    return normalizedClientes;
  } catch (error) {
    console.error('Error in getClientes:', error);
    return [];
  }
};

export const getCliente = async (id: number, token?: string): Promise<Cliente> => {
  
  try {
    const res = await api.get<unknown>(
      `/clientes/${id}`,
      token ? authHeaders(token) : undefined
    );
    return normalizeCliente(res.data);
  } catch (error) {
    console.error('Error in getCliente:', error);
    throw error;
  }
};

// Helper to prepare data for backend (only send fields the backend understands)
const prepareClienteForBackend = (cliente: Partial<Cliente>) => {
  // Send only the basic fields that the backend expects
  return {
    nome: cliente.nome_fantasia || cliente.nome,
    cnpj: cliente.cnpj_cpf || cliente.cnpj,
    estado: cliente.estado || '',
    razao_social: cliente.razao_social,
    nome_fantasia: cliente.nome_fantasia,
    cidade: cliente.cidade,
    endereco: cliente.endereco,
    telefone1_ddd: cliente.telefone1_ddd,
    telefone1_numero: cliente.telefone1_numero,
    contato: cliente.contato,
    cep: cliente.cep,
    bairro: cliente.bairro,
    endereco_numero: cliente.endereco_numero,
    complemento: cliente.complemento,
    pessoa_fisica: cliente.pessoa_fisica,
    inativo: cliente.inativo
  };
};

export const createCliente = async (
  cliente: Omit<Cliente, 'id'>,
  token?: string
): Promise<Cliente> => {
  try {
    const backendData = prepareClienteForBackend(cliente);
    const res = await api.post<unknown>(
      '/clientes/',
      backendData,
      token ? authHeaders(token) : undefined
    );
    return normalizeCliente(res.data);
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw error;
  }
};

export const updateCliente = async (
  id: number,
  cliente: Partial<Omit<Cliente, 'id'>>,
  token?: string
): Promise<Cliente> => {
  const authToken = getAuthToken(token);
  const backendData = prepareClienteForBackend(cliente);
  
  try {
    const res = await api.put<unknown>(
      `/clientes/${id}`,
      backendData,
      authHeaders(authToken)
    );
    
    return normalizeCliente(res.data);
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw error;
  }
};

export const deleteCliente = async (id: number, token?: string) => {
  const authToken = getAuthToken(token);
  const res = await api.delete<{ message: string }>(
    `/clientes/${id}`,
    authHeaders(authToken)
  );
  return res.data;
};