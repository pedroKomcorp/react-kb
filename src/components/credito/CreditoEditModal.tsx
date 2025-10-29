import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import type { FormInstance } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { Credito, StatusCredito } from '../../types/credito';
import { StatusCreditoEnum } from '../../types/credito';

export interface UpdateFormValues {
  nome: string;
  descricao?: string;
  valor_original: number;
  saldo_atual: number;
  status: StatusCredito;
  tem_atualizacao_selic: boolean;
}

interface CreditoEditModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  form: FormInstance;
  onFinish: (values: UpdateFormValues) => void;
  loading: boolean;
  editingCredito: Credito | null;
}

const CreditoEditModal: React.FC<CreditoEditModalProps> = ({
  open,
  onCancel,
  onOk,
  form,
  onFinish,
  loading,
  editingCredito
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          <EditOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span className="text-xl font-semibold">
            Editar Crédito - {editingCredito?.nome}
          </span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      okText="💾 Atualizar"
      cancelText="Cancelar"
      confirmLoading={loading}
      width={700}
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
                  prefix={<EditOutlined className="text-gray-400" />}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="valor_original"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Valor Original <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Por favor, insira o valor original' },
                    { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    precision={2}
                    prefix="R$"
                  />
                </Form.Item>

                <Form.Item
                  name="saldo_atual"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Saldo Atual <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[
                    { required: true, message: 'Por favor, insira o saldo atual' }
                  ]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="0.00"
                    precision={2}
                    prefix="R$"
                  />
                </Form.Item>
              </div>
            </div>

            {/* Status and Settings */}
            <div>
              <h3 className="text-base font-semibold mb-4 text-gray-800 border-b pb-2">
                Status e Configurações
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  name="status"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: 'Por favor, selecione o status' }]}
                >
                  <Select placeholder="Selecione o status">
                    <Select.Option value={StatusCreditoEnum.EM_ANDAMENTO}>📋 Em Andamento</Select.Option>
                    <Select.Option value={StatusCreditoEnum.HABILITADO}>✅ Habilitado</Select.Option>
                    <Select.Option value={StatusCreditoEnum.COMPENSADO}>💰 Compensado</Select.Option>
                    <Select.Option value={StatusCreditoEnum.INDEFERIDO}>❌ Indeferido</Select.Option>
                    <Select.Option value={StatusCreditoEnum.PARCIALMENTE_COMPENSADO}>📊 Parcialmente Compensado</Select.Option>
                    <Select.Option value={StatusCreditoEnum.AGUARDANDO_HABILITACAO}>⏳ Aguardando Habilitação</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="tem_atualizacao_selic"
                  label={
                    <span className="text-sm font-medium text-gray-700">
                      Tem Atualização SELIC
                    </span>
                  }
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="Sim" 
                    unCheckedChildren="Não"
                  />
                </Form.Item>
              </div>
            </div>

            {editingCredito && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 text-xl">ℹ️</div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Informações do Registro:</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-700">
                        <strong>ID:</strong> #{editingCredito.id}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Criado em:</strong> {new Date(editingCredito.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-blue-700">
                        <strong>Atualizado em:</strong> {new Date(editingCredito.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
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

export default CreditoEditModal;