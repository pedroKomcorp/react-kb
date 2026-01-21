
import React, { useState } from 'react';
import { Button } from 'antd';
import { CreditCardOutlined, PlusOutlined } from '@ant-design/icons';
import type { Cliente } from '../../../types/cliente';
import {
  CreditoCard,
  CreditoSummary,
  CreditoFilters,
} from '../../../components/credito';
import { useCreditos } from '../../../hooks/useCreditos';
import { useMovimentacoes } from '../../../hooks/useMovimentacoes';
import { CreditoModals } from './CreditoModals';





const CreditoPage: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Use custom hooks for state management
  const creditos = useCreditos(selectedClient);
  const movimentacoes = useMovimentacoes({
    onCreditoUpdate: async () => {
      if (selectedClient?.id) {
        await creditos.loadCreditos(selectedClient.id);
      }
    },
  });

  const handleClientSelect = (client: Cliente | null) => {
    setSelectedClient(client);
  };

  const handleCreditoClick = async (credito: any) => {
    movimentacoes.openCreditoDetail(credito);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    movimentacoes.closeCreditoDetail();
  };



  return (
    <div className="w-full h-full flex flex-col">
      <div className="bg-transparent rounded-lg pl-20 p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl pl-5 font-bold text-white">
          CONTROLE DE CRÉDITO
        </h1>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full pl-20">
          {/* Main Content Container */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              {/* Filters */}
              <CreditoFilters
                selectedClient={selectedClient}
                onClientSelect={handleClientSelect}
                nomeFilter={creditos.nomeFilter}
                onNomeFilterChange={creditos.setNomeFilter}
                onCreateCredito={creditos.openCreateModal}
              />
              {!selectedClient ? (
                <div className="text-center py-12">
                  <CreditCardOutlined className="text-6xl text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecione um cliente
                  </h3>
                  <p className="text-gray-500">
                    Para visualizar as informações de crédito, selecione um cliente no campo acima.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Client Info Header */}
                  <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      
                      <p className="text-gray-600">
                        CNPJ: {selectedClient.cnpj} | Estado: {selectedClient.estado}
                      </p>
                    </div>
                
                  </div>

                  {/* Credits List */}
                  {creditos.loading ? (
                    <div className="text-center py-8">
                      <p>Carregando créditos...</p>
                    </div>
                  ) : creditos.filteredCreditos.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        {creditos.nomeFilter.trim() ? 
                          `Nenhum crédito encontrado com o nome "${creditos.nomeFilter}".` :
                          'Nenhum crédito encontrado para este cliente.'
                        }
                      </p>
                      <Button 
                        type="dashed" 
                        icon={<PlusOutlined />}
                        onClick={creditos.openCreateModal}
                      >
                        Criar Primeiro Crédito
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Créditos do Cliente ({creditos.filteredCreditos.length}
                          {creditos.nomeFilter.trim() && ` de ${creditos.creditos.length} total`})
                        </h4>
                        {creditos.nomeFilter.trim() && (
                          <Button 
                            type="link" 
                            onClick={() => creditos.setNomeFilter('')}
                            className="text-sm"
                          >
                            Limpar filtro
                          </Button>
                        )}
                      </div>
                      
                      {/* Credit Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {creditos.filteredCreditos.map((credito) => (
                          <CreditoCard
                            key={credito.id}
                            credito={credito}
                            onEdit={creditos.openEditModal}
                            onDelete={creditos.handleDeleteCredito}
                            onClick={handleCreditoClick}
                            isDeleting={creditos.deleting === credito.id}
                          />
                        ))}
                      </div>

                      {/* Summary */}
                      <CreditoSummary
                        creditos={creditos.filteredCreditos}
                        isFiltered={!!creditos.nomeFilter.trim()}
                        totalCreditos={creditos.creditos.length}
                        filterName={creditos.nomeFilter}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CreditoModals
        showCreateModal={creditos.showCreateModal}
        onCloseCreateModal={creditos.closeCreateModal}
        createForm={creditos.createForm}
        onCreateCredito={creditos.handleCreateCredito}
        creatingCredito={creditos.creating}
        selectedClient={selectedClient}
        showEditModal={creditos.showEditModal}
        onCloseEditModal={creditos.closeEditModal}
        editForm={creditos.editForm}
        onUpdateCredito={creditos.handleUpdateCredito}
        updatingCredito={creditos.updating}
        editingCredito={creditos.editingCredito}
        showDetailModal={showDetailModal}
        onCloseDetailModal={handleCloseDetailModal}
        selectedCredito={movimentacoes.selectedCredito}
        movimentacoes={movimentacoes.movimentacoes}
        loadingMovimentacoes={movimentacoes.loadingMovimentacoes}
        onNovaMovimentacao={movimentacoes.openCreateModal}
        onEditMovimentacao={movimentacoes.openEditModal}
        onDeleteMovimentacao={movimentacoes.handleDeleteMovimentacao}
        showCreateMovimentacaoModal={movimentacoes.showCreateModal}
        onCloseCreateMovimentacaoModal={movimentacoes.closeCreateModal}
        createMovimentacaoForm={movimentacoes.createForm}
        onCreateMovimentacao={movimentacoes.handleCreateMovimentacao}
        creatingMovimentacao={movimentacoes.creatingMovimentacao}
        showEditMovimentacaoModal={movimentacoes.showEditModal}
        onCloseEditMovimentacaoModal={movimentacoes.closeEditModal}
        editMovimentacaoForm={movimentacoes.editForm}
        onUpdateMovimentacao={movimentacoes.handleUpdateMovimentacao}
        updatingMovimentacao={movimentacoes.updatingMovimentacao}
        editingMovimentacao={movimentacoes.editingMovimentacao}
      />
    </div>
  );
}

export default CreditoPage;