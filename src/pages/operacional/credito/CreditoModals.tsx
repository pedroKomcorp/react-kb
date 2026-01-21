import React from 'react';
import { Modal } from 'antd';
import type { FormInstance } from 'antd';
import type { Cliente } from '../../../types/cliente';
import type { Credito } from '../../../types/credito';
import type { MovimentacaoCredito } from '../../../types/movimentacao';
import {
  CreditoCreateModal,
  CreditoEditModal,
  CreditoDetailModal,
  MovimentacaoForm,
  type CreateFormValues,
  type UpdateFormValues,
  type MovimentacaoFormValues,
} from '../../../components/credito';
import { formatCurrency } from '../../../utils/creditoHelpers';

interface CreditoModalsProps {
  // Create Credit Modal
  showCreateModal: boolean;
  onCloseCreateModal: () => void;
  createForm: FormInstance<CreateFormValues>;
  onCreateCredito: (values: CreateFormValues) => Promise<void>;
  creatingCredito: boolean;
  selectedClient: Cliente | null;

  // Edit Credit Modal
  showEditModal: boolean;
  onCloseEditModal: () => void;
  editForm: FormInstance<UpdateFormValues>;
  onUpdateCredito: (values: UpdateFormValues) => Promise<void>;
  updatingCredito: boolean;
  editingCredito: Credito | null;

  // Credit Detail Modal
  showDetailModal: boolean;
  onCloseDetailModal: () => void;
  selectedCredito: Credito | null;
  movimentacoes: MovimentacaoCredito[];
  loadingMovimentacoes: boolean;
  onNovaMovimentacao: () => void;
  onEditMovimentacao: (movimentacao: MovimentacaoCredito) => void;
  onDeleteMovimentacao: (id: number) => Promise<void>;

  // Create Movimentacao Modal
  showCreateMovimentacaoModal: boolean;
  onCloseCreateMovimentacaoModal: () => void;
  createMovimentacaoForm: FormInstance<MovimentacaoFormValues>;
  onCreateMovimentacao: (values: MovimentacaoFormValues) => Promise<void>;
  creatingMovimentacao: boolean;

  // Edit Movimentacao Modal
  showEditMovimentacaoModal: boolean;
  onCloseEditMovimentacaoModal: () => void;
  editMovimentacaoForm: FormInstance<MovimentacaoFormValues>;
  onUpdateMovimentacao: (values: MovimentacaoFormValues) => Promise<void>;
  updatingMovimentacao: boolean;
  editingMovimentacao: MovimentacaoCredito | null;
}

export const CreditoModals: React.FC<CreditoModalsProps> = ({
  showCreateModal,
  onCloseCreateModal,
  createForm,
  onCreateCredito,
  creatingCredito,
  selectedClient,
  showEditModal,
  onCloseEditModal,
  editForm,
  onUpdateCredito,
  updatingCredito,
  editingCredito,
  showDetailModal,
  onCloseDetailModal,
  selectedCredito,
  movimentacoes,
  loadingMovimentacoes,
  onNovaMovimentacao,
  onEditMovimentacao,
  onDeleteMovimentacao,
  showCreateMovimentacaoModal,
  onCloseCreateMovimentacaoModal,
  createMovimentacaoForm,
  onCreateMovimentacao,
  creatingMovimentacao,
  showEditMovimentacaoModal,
  onCloseEditMovimentacaoModal,
  editMovimentacaoForm,
  onUpdateMovimentacao,
  updatingMovimentacao,
  editingMovimentacao,
}) => {
  return (
    <>
      {/* Create Credit Modal */}
      <CreditoCreateModal
        open={showCreateModal}
        onCancel={onCloseCreateModal}
        onOk={() => createForm.submit()}
        form={createForm}
        onFinish={onCreateCredito}
        loading={creatingCredito}
        selectedClient={selectedClient}
      />

      {/* Edit Credit Modal */}
      <CreditoEditModal
        open={showEditModal}
        onCancel={onCloseEditModal}
        onOk={() => editForm.submit()}
        form={editForm}
        onFinish={onUpdateCredito}
        loading={updatingCredito}
        editingCredito={editingCredito}
      />

      {/* Credit Detail Modal */}
      <CreditoDetailModal
        open={showDetailModal}
        onCancel={onCloseDetailModal}
        credito={selectedCredito}
        movimentacoes={movimentacoes}
        loading={loadingMovimentacoes}
        onNovaMovimentacao={onNovaMovimentacao}
        onEditMovimentacao={onEditMovimentacao}
        onDeleteMovimentacao={onDeleteMovimentacao}
      />

      {/* Create Movimentacao Modal */}
      <Modal
        title="Nova Movimentação"
        open={showCreateMovimentacaoModal}
        onCancel={onCloseCreateMovimentacaoModal}
        onOk={() => createMovimentacaoForm.submit()}
        confirmLoading={creatingMovimentacao}
        width={500}
      >
        <MovimentacaoForm
          form={createMovimentacaoForm}
          onFinish={onCreateMovimentacao}
        />
        {selectedCredito && (
          <div className="bg-gray-50 p-3 rounded-md mt-4">
            <p className="text-sm text-gray-600">
              <strong>Crédito:</strong> {selectedCredito.nome}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Saldo Atual:</strong> {formatCurrency(selectedCredito.saldo_atual)}
            </p>
          </div>
        )}
      </Modal>

      {/* Edit Movimentacao Modal */}
      <Modal
        title="Editar Movimentação"
        open={showEditMovimentacaoModal}
        onCancel={onCloseEditMovimentacaoModal}
        onOk={() => editMovimentacaoForm.submit()}
        confirmLoading={updatingMovimentacao}
        width={500}
      >
        <MovimentacaoForm
          form={editMovimentacaoForm}
          onFinish={onUpdateMovimentacao}
        />
        {editingMovimentacao && (
          <div className="bg-blue-50 p-3 rounded-md mt-4">
            <p className="text-sm text-blue-800">
              <strong>Editando:</strong> Movimentação #{editingMovimentacao.id}
            </p>
            <p className="text-sm text-blue-600">
              <strong>Saldo Anterior:</strong> {formatCurrency(editingMovimentacao.saldo_anterior)}
            </p>
            <p className="text-sm text-blue-600">
              <strong>Saldo Posterior:</strong> {formatCurrency(editingMovimentacao.saldo_posterior)}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
};
