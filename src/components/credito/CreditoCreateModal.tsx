import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch, DatePicker } from 'antd';
import type { FormInstance } from 'antd';
import { CreditCardOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { Cliente } from '../../types/cliente';
import type { StatusCredito } from '../../types/credito';

export interface CreateFormValues {
  nome: string;
  descricao?: string;
  saldo_inicial: number;
  status: StatusCredito;
  tem_atualizacao_selic: boolean;
  created_at?: Dayjs;
}

interface CreditoCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: FormInstance;
  onFinish: (values: CreateFormValues) => void;
  loading: boolean;
  selectedClient: Cliente | null;
}

const CreditoCreateModal: React.FC<CreditoCreateModalProps> = ({
  open,
  onCancel,
  onOk,
  form,
  onFinish,
  loading,
  selectedClient
}) => {
  const formatInputCurrency = (value: string | number | undefined) => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue).replace('R$', 'R$').replace(/\s/, '');
  };

  const parseInputCurrency = (value: string | undefined) => {
    if (!value) return '';
    return value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <CreditCardOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span className="text-xl font-semibold">Criar Novo Crédito</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="✨ Criar Crédito"
      cancelText="Cancelar"
      confirmLoading={loading}
      width={600}
      style={{ top: 20 }}
      okButtonProps={{ size: 'large' }}
      cancelButtonProps={{ size: 'large' }}
    >
      <div className="py-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                Informações Básicas
              </h3>
              <Form.Item
                name="nome"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Nome do Crédito <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Por favor, insira o nome do crédito' },
                  { min: 3, message: 'O nome deve ter pelo menos 3 caracteres' }
                ]}
              >
                <Input 
                  placeholder="Ex: Crédito Rotativo, Capital de Giro, etc." 
                  prefix={<CreditCardOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                name="descricao"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Descrição (Opcional)
                  </span>
                }
              >
                <Input.TextArea 
                  placeholder="Descrição detalhada do crédito, finalidade e condições..."
                  rows={3}
                  showCount
                  maxLength={300}
                />
              </Form.Item>
            </div>

            {/* Financial Information */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                Informações Financeiras
              </h3>
              <Form.Item
                name="saldo_inicial"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Saldo Inicial <span className="text-red-500">*</span>
                  </span>
                }
                rules={[
                  { required: true, message: 'Por favor, insira o saldo inicial' },
                  { 
                    validator: (_, value) => {
                      if (!value || parseFloat(value.toString().replace(/[^\d,]/g, '').replace(',', '.')) > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('O valor deve ser maior que zero'));
                    }
                  }
                ]}
              >
                <Input
                  style={{ width: '100%' }}
                  placeholder="R$ 0,00"
                  onChange={(e) => {
                    const input = e.target.value;
                    let value = input.replace(/\D/g, '');
                    
                    if (value === '') {
                      form.setFieldValue('saldo_inicial', '');
                      return value;
                    }
                    
                    // Convert to number and format
                    const numValue = parseInt(value) / 100;
                    const formatted = numValue.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    });
                    
                    form.setFieldValue('saldo_inicial', formatted);
                  }}
                />
              </Form.Item>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                Configurações
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="created_at"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Data de Criação <span className="text-red-500">*</span>
                    </span>
                  }
                  initialValue={dayjs()}
                  rules={[{ required: true, message: 'Por favor, selecione a data de criação' }]}
                >
                  <DatePicker
                    showTime={{ format: 'HH:mm' }}
                    format="DD/MM/YYYY HH:mm"
                    placeholder="Selecione a data e hora"
                    style={{ width: '100%' }}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                  />
                </Form.Item>

                <Form.Item
                  name="status"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Status Inicial
                    </span>
                  }
                  initialValue="em_andamento"
                >
                  <Select placeholder="Selecione o status inicial">
                    <Select.Option value="em_andamento">📋 Em Andamento</Select.Option>
                    <Select.Option value="habilitado">✅ Habilitado</Select.Option>
                    <Select.Option value="compensado">💰 Compensado</Select.Option>
                    <Select.Option value="indeferido">❌ Indeferido</Select.Option>
                    <Select.Option value="parcialmente_compensado">📊 Parcialmente Compensado</Select.Option>
                    <Select.Option value="aguardando_habilitacao">⏳ Aguardando Habilitação</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <Form.Item
                name="tem_atualizacao_selic"
                label={
                  <span className="text-sm font-medium text-gray-700">
                    Tem Atualização SELIC
                  </span>
                }
                valuePropName="checked"
                initialValue={false}
              >
                <Switch 
                  checkedChildren="Sim" 
                  unCheckedChildren="Não"
                />
              </Form.Item>
            </div>

            {selectedClient && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">👤</div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Cliente Selecionado:</h4>
                    <p className="text-sm text-blue-700">
                      <strong>Nome:</strong> {selectedClient.nome}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>CNPJ:</strong> {selectedClient.cnpj}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default CreditoCreateModal;