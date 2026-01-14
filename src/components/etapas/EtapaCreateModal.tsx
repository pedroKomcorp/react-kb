import React from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined, UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import type { Usuario } from '../../types/usuario';
import dayjs from 'dayjs';

interface EtapaCreateModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: {
    nome: string;
    descricao?: string;
    data_prazo?: dayjs.Dayjs;
    usuario_id: number;
  }) => Promise<void>;
  usuarios: Usuario[];
  projetoNome?: string;
  loading?: boolean;
  form: any;
}

const EtapaCreateModal: React.FC<EtapaCreateModalProps> = ({
  open,
  onCancel,
  onFinish,
  usuarios,
  projetoNome,
  loading,
  form,
}) => {
  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg">
            <PlusOutlined className="text-white text-lg" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-800">Nova Etapa</div>
            {projetoNome && (
              <div className="text-xs font-normal text-gray-500">{projetoNome}</div>
            )}
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Criar Etapa"
      cancelText="Cancelar"
      width={580}
      okButtonProps={{
        style: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
          borderColor: '#3b82f6',
          fontWeight: 600,
        },
      }}
      cancelButtonProps={{
        style: {
          fontWeight: 600,
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ usuario_id: Number(localStorage.getItem('user_id')) }}
        className="mt-6"
      >
        {/* Nome da Etapa */}
        <Form.Item
          name="nome"
          label={
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-blue-500" />
              <span className="font-semibold text-gray-700">
                Nome da Etapa <span className="text-red-500">*</span>
              </span>
            </div>
          }
          rules={[{ required: true, message: 'Por favor, informe o nome da etapa' }]}
          className="mb-6"
        >
          <Input
            placeholder="Ex: Análise de documentos, Revisão técnica..."
            className="rounded-lg"
            size="large"
            style={{
              borderColor: '#d1d5db',
              borderWidth: '2px',
            }}
          />
        </Form.Item>

        {/* Descrição */}
        <Form.Item
          name="descricao"
          label={
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-gray-400" />
              <span className="font-semibold text-gray-700">
                Descrição <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </span>
            </div>
          }
          className="mb-6"
        >
          <Input.TextArea
            rows={3}
            placeholder="Descreva os detalhes e objetivos desta etapa..."
            className="rounded-lg"
            size="large"
            style={{
              borderColor: '#d1d5db',
              borderWidth: '2px',
            }}
          />
        </Form.Item>

        {/* Row: Responsável e Prazo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Responsável */}
          <Form.Item
            name="usuario_id"
            label={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                <span className="font-semibold text-gray-700">
                  Responsável <span className="text-red-500">*</span>
                </span>
              </div>
            }
            rules={[{ required: true, message: 'Selecione o responsável' }]}
            className="mb-4"
          >
            <Select
              placeholder="Escolha o responsável"
              className="rounded-lg"
              size="large"
              showSearch
              optionFilterProp="children"
              style={{
                borderRadius: '8px',
              }}
            >
              {usuarios.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold"
                    >
                      {u.nome
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>
                    <span>{u.nome}</span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Prazo */}
          <Form.Item
            name="data_prazo"
            label={
              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-orange-500" />
                <span className="font-semibold text-gray-700">
                  Prazo <span className="text-gray-400 font-normal text-xs">(opcional)</span>
                </span>
              </div>
            }
            className="mb-4"
          >
            <DatePicker
              className="w-full rounded-lg"
              format="DD/MM/YYYY"
              placeholder="Selecione a data limite"
              size="large"
              style={{
                borderColor: '#d1d5db',
                borderWidth: '2px',
              }}
            />
          </Form.Item>
        </div>

        {/* Info box */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-lg mt-0.5">💡</div>
            <div>
              <div className="text-sm font-semibold text-blue-900 mb-1">Dica</div>
              <div className="text-xs text-blue-700 leading-relaxed">
                Etapas bem definidas ajudam a acompanhar o progresso do projeto. 
                Defina nomes claros e atribua responsáveis para cada tarefa.
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default EtapaCreateModal;
