import React from 'react';
import { Form, Select, InputNumber, Input, DatePicker } from 'antd';
import type { FormInstance } from 'antd';
import { TipoMovimentacaoEnum } from '../../types/movimentacao';
import dayjs, { Dayjs } from 'dayjs';
import type { TipoMovimentacaoEnum as MovServiceTipo } from '../../types/movimentacao';

export interface MovimentacaoFormValues {
  tipo: MovServiceTipo;
  valor: number;
  descricao: string;
  created_at?: Dayjs;
}

interface MovimentacaoFormProps {
  form: FormInstance;
  onFinish: (values: MovimentacaoFormValues) => void;
  isEditing?: boolean;
}

const MovimentacaoForm: React.FC<MovimentacaoFormProps> = ({
  form,
  onFinish,
  isEditing = false
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
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      size="large"
    >
      <Form.Item
        name="tipo"
        label="Tipo de Movimentação"
        rules={[{ required: true, message: 'Por favor, selecione o tipo de movimentação' }]}
      >
        <Select placeholder="Selecione o tipo">
          <Select.Option value={TipoMovimentacaoEnum.CREDITO}>Crédito</Select.Option>
          <Select.Option value={TipoMovimentacaoEnum.DEBITO}>Débito</Select.Option>
          <Select.Option value={TipoMovimentacaoEnum.COMPENSACAO}>Compensação</Select.Option>
          <Select.Option value={TipoMovimentacaoEnum.AJUSTE}>Ajuste</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="valor"
        label="Valor da Movimentação"
        rules={[
          { required: true, message: 'Por favor, insira o valor' },
          { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' }
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="0,00"
          formatter={formatInputCurrency}
          parser={parseInputCurrency}
          precision={2}
        />
      </Form.Item>

      <Form.Item
        name="descricao"
        label="Descrição"
        rules={[
          { required: true, message: 'Por favor, insira uma descrição' },
          { min: 5, message: 'A descrição deve ter pelo menos 5 caracteres' }
        ]}
      >
        <Input.TextArea 
          placeholder="Descreva o motivo ou detalhes da movimentação..."
          rows={3}
        />
      </Form.Item>

      <Form.Item
        name="created_at"
        label="Data da Movimentação"
        initialValue={isEditing ? undefined : dayjs()}
        rules={[{ required: true, message: 'Por favor, selecione a data da movimentação' }]}
      >
        <DatePicker
          showTime={{ format: 'HH:mm' }}
          format="DD/MM/YYYY HH:mm"
          placeholder="Selecione a data e hora"
          style={{ width: '100%' }}
          disabledDate={(current) => current && current > dayjs().endOf('day')}
        />
      </Form.Item>
    </Form>
  );
};

export default MovimentacaoForm;