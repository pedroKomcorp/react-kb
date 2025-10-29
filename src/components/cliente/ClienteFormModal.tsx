import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Tabs, 
  Row, 
  Col, 
  Button, 
  message,
} from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  BankOutlined, 
} from '@ant-design/icons';
import { createCliente, updateCliente } from '../../services/clientes';
import type { Cliente } from '../../types/cliente';

interface ClienteFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (cliente: Cliente) => void;
  cliente?: Cliente | null;
  mode: 'create' | 'edit';
}

const { TabPane } = Tabs;
const { Option } = Select;

const ClienteFormModal: React.FC<ClienteFormModalProps> = ({
  visible,
  onClose,
  onSuccess,
  cliente,
  mode
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && cliente) {
        // Populate form with client data
        const formData = {
          ...cliente,
          tags_array: cliente.tags?.map(t => t.nome) || [],
          dados_bancarios: {
            banco: cliente.dados_bancarios?.banco || '',
            agencia: cliente.dados_bancarios?.agencia || '',
            conta: cliente.dados_bancarios?.conta || '',
            tipo_conta: cliente.dados_bancarios?.tipo_conta || '',
            titular: cliente.dados_bancarios?.titular || '',
            documento_titular: cliente.dados_bancarios?.documento_titular || '',
            chave_pix: cliente.dados_bancarios?.chave_pix || ''
          },
          endereco_entrega: {
            bairro: cliente.endereco_entrega?.bairro || '',
            cep: cliente.endereco_entrega?.cep || '',
            cidade: cliente.endereco_entrega?.cidade || '',
            complemento: cliente.endereco_entrega?.complemento || '',
            endereco: cliente.endereco_entrega?.endereco || '',
            endereco_numero: cliente.endereco_entrega?.endereco_numero || '',
            estado: cliente.endereco_entrega?.estado || ''
          }
        };
          form.setFieldsValue(formData);
        }
      }
    }, [visible, mode, cliente, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare client data based on new backend model structure
      const clienteData: Omit<Cliente, 'id' | 'created_at' | 'updated_at'> = {
        razao_social: (values.razao_social as string) || '',
        cnpj_cpf: (values.cnpj_cpf as string) || '',

        // Optional basic fields
        nome_fantasia: (values.nome_fantasia as string) || null,
        email: (values.email as string) || null,
        codigo_cliente_omie: (values.codigo_cliente_omie as number) || null,
        codigo_cliente_integracao: (values.codigo_cliente_integracao as string) || null,

        // Address fields
        endereco: (values.endereco as string) || null,
        endereco_numero: (values.endereco_numero as string) || null,
        bairro: (values.bairro as string) || null,
        cidade: (values.cidade as string) || null,
        cidade_ibge: (values.cidade_ibge as string) || null,
        estado: (values.estado as string) || null,
        cep: (values.cep as string) || null,
        complemento: (values.complemento as string) || null,
        codigo_pais: (values.codigo_pais as string) || null,

        // Contact fields
        contato: (values.contato as string) || null,
        telefone1_ddd: (values.telefone1_ddd as string) || null,
        telefone1_numero: (values.telefone1_numero as string) || null,
        telefone2_ddd: (values.telefone2_ddd as string) || null,
        telefone2_numero: (values.telefone2_numero as string) || null,

        // Document fields
        inscricao_estadual: (values.inscricao_estadual as string) || null,
        inscricao_municipal: (values.inscricao_municipal as string) || null,

        // Legacy compatibility fields
        nome: (values.nome_fantasia as string) || (values.razao_social as string) || null,
        cnpj: (values.cnpj_cpf as string) || null,

        // Relationships will be handled separately if needed
        dados_bancarios: undefined,
        endereco_entrega: null,
        pessoa_fisica: 'S',
        inativo: 'S',
        exterior: 'S'
      };

      let result: Cliente;
      if (mode === 'edit' && cliente?.id) {
        result = await updateCliente(cliente.id, clienteData, token || undefined);
        message.success('Cliente atualizado com sucesso!');
      } else {
        result = await createCliente(clienteData, token || undefined);
        message.success('Cliente criado com sucesso!');
      }

      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      message.error('Erro ao salvar cliente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };


  const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <UserOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span className="text-xl font-semibold">
            {mode === 'edit' ? 'Editar Cliente' : 'Criar Novo Cliente'}
          </span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={900}
      style={{ top: 20 }}
      footer={[
        <Button 
          key="cancel" 
          onClick={onClose} 
          disabled={loading}
          size="large"
        >
          Cancelar
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading}
          onClick={() => form.submit()}
          size="large"
        >
          {mode === 'edit' ? '💾 Atualizar' : '✨ Criar'} Cliente
        </Button>
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        scrollToFirstError
        size="large"
      >
        <Tabs 
          defaultActiveKey="1" 
          type="card"
          className="mb-4"
        >
          {/* Dados Básicos */}
          <TabPane 
            tab={
              <span className="flex items-center space-x-2 px-2">
                <UserOutlined />
                <span>Dados Básicos</span>
              </span>
            } 
            key="1"
          >
            <div className="space-y-6">
              {/* Company Info Section */}
              <div>
                <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                  Informações da Empresa
                </h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="razao_social"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Razão Social <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: 'Razão social é obrigatória' }]}
                    >
                      <Input 
                        placeholder="Digite a razão social da empresa..." 
                        prefix={<UserOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="nome_fantasia"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Nome Fantasia
                        </span>
                      }
                    >
                      <Input placeholder="Nome fantasia (se diferente)" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Tax Info Section */}
              <div>
                <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                  Informações Fiscais
                </h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="inscricao_estadual"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Inscrição Estadual
                        </span>
                      }
                    >
                      <Input placeholder="Número da inscrição estadual" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="inscricao_municipal"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Inscrição Municipal
                        </span>
                      }
                    >
                      <Input placeholder="Número da inscrição municipal" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Contact Info Section */}
              <div>
                <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                  Informações de Contato
                </h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="contato"
                      label={
                        <span className="text-sm font-medium text-gray-700">
                          Pessoa de Contato
                        </span>
                      }
                    >
                  <Input placeholder="Nome do contato" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="telefone1_ddd"
                  label="DDD"
                >
                  <Input placeholder="11" maxLength={2} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="telefone1_numero"
                  label="Telefone"
                >
                  <Input placeholder="99999-9999" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="cnpj_cpf"
                  label="CNPJ/CPF"
                  rules={[{ required: true, message: 'CNPJ/CPF é obrigatório' }]}
                >
                  <Input placeholder="00.000.000/0000-00" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="E-mail"
                >
                  <Input placeholder="cliente@email.com" />
                </Form.Item>
              </Col>
                </Row>
              </div>
            </div>
          </TabPane>          {/* Endereço */}
          <TabPane 
            tab={<span><HomeOutlined />Endereço</span>} 
            key="2"
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="endereco"
                  label="Logradouro"
                >
                  <Input placeholder="Rua, Avenida, etc." />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endereco_numero"
                  label="Número"
                >
                  <Input placeholder="Número" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="complemento"
                  label="Complemento"
                >
                  <Input placeholder="Apto, Sala, etc." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="bairro"
                  label="Bairro"
                >
                  <Input placeholder="Bairro" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="cep"
                  label="CEP"
                >
                  <Input placeholder="00000-000" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="cidade"
                  label="Cidade"
                >
                  <Input placeholder="Cidade" />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item
                  name="estado"
                  label="UF"
                >
                  <Select placeholder="UF">
                    {estadosBrasil.map(uf => (
                      <Option key={uf} value={uf}>{uf}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="codigo_pais"
              label="Código do País"
            >
              <Input placeholder="1058" />
            </Form.Item>
          </TabPane>

          {/* Dados Bancários */}
          <TabPane 
            tab={<span><BankOutlined />Dados Bancários</span>} 
            key="3"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'banco']}
                  label="Banco"
                >
                  <Input placeholder="Nome do banco" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'agencia']}
                  label="Agência"
                >
                  <Input placeholder="0000" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'conta']}
                  label="Conta"
                >
                  <Input placeholder="00000-0" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'tipo_conta']}
                  label="Tipo de Conta"
                >
                  <Select placeholder="Selecione o tipo">
                    <Option value="Corrente">Corrente</Option>
                    <Option value="Poupança">Poupança</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'titular']}
                  label="Titular"
                >
                  <Input placeholder="Nome completo" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name={['dados_bancarios', 'documento_titular']}
                  label="Documento do Titular"
                >
                  <Input placeholder="CPF/CNPJ do titular" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name={['dados_bancarios', 'chave_pix']}
              label="Chave PIX"
            >
              <Input placeholder="Chave PIX" />
            </Form.Item>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default ClienteFormModal;
