import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  Empty,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  clearConcluidosListaTarefas,
  createItemListaTarefas,
  createListaTarefas,
  deleteItemListaTarefas,
  deleteListaTarefas,
  getListaTarefas,
  getListasTarefas,
  reorderItensListaTarefas,
  updateItemListaTarefas,
  updateListaTarefas,
} from '../../../services/listasTarefas';
import type {
  ItemListaTarefas,
  ListaTarefas,
} from '../../../types/listasTarefas';
import './listas-tarefas-widget.css';

const { Text } = Typography;

const ListasTarefasWidget: React.FC = () => {
  const [listas, setListas] = useState<ListaTarefas[]>([]);
  const [listaAtivaId, setListaAtivaId] = useState<number | null>(null);
  const [itens, setItens] = useState<ItemListaTarefas[]>([]);
  const [loadingListas, setLoadingListas] = useState(true);
  const [loadingItens, setLoadingItens] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [newListaTitulo, setNewListaTitulo] = useState('');
  const [renameListaTitulo, setRenameListaTitulo] = useState('');
  const [newItemConteudo, setNewItemConteudo] = useState('');
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemConteudo, setEditingItemConteudo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadListas = useCallback(async () => {
    setLoadingListas(true);
    try {
      const response = await getListasTarefas({ limit: 100 });
      const listasCarregadas = response.listas ?? [];

      setListas(listasCarregadas);
      setListaAtivaId((current) => {
        if (!listasCarregadas.length) {
          return null;
        }

        if (current && listasCarregadas.some((lista) => lista.id === current)) {
          return current;
        }

        return listasCarregadas[0].id;
      });
    } catch (error) {
      console.error('Erro ao carregar listas de tarefas:', error);
    } finally {
      setLoadingListas(false);
    }
  }, []);

  const loadDetalheLista = useCallback(async (listaId: number) => {
    setLoadingItens(true);
    try {
      const detalhe = await getListaTarefas(listaId);
      const itensOrdenados = [...(detalhe.itens ?? [])].sort((a, b) => a.ordem - b.ordem);
      setItens(itensOrdenados);
    } catch (error) {
      console.error('Erro ao carregar itens da lista:', error);
      setItens([]);
    } finally {
      setLoadingItens(false);
    }
  }, []);

  useEffect(() => {
    void loadListas();
  }, [loadListas]);

  useEffect(() => {
    if (!listaAtivaId) {
      setItens([]);
      return;
    }

    void loadDetalheLista(listaAtivaId);
  }, [listaAtivaId, loadDetalheLista]);

  const listaAtiva = useMemo(
    () => listas.find((lista) => lista.id === listaAtivaId) ?? null,
    [listas, listaAtivaId]
  );

  const completedCount = useMemo(
    () => itens.filter((item) => item.concluido).length,
    [itens]
  );

  const handleCreateLista = async () => {
    const titulo = newListaTitulo.trim();
    if (!titulo) {
      message.warning('Informe um título para a lista.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createListaTarefas({ titulo });
      message.success('Lista criada com sucesso.');
      setIsCreateModalOpen(false);
      setNewListaTitulo('');
      await loadListas();
      if (created?.id) {
        setListaAtivaId(created.id);
      }
    } catch (error) {
      console.error('Erro ao criar lista:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRenameLista = async () => {
    if (!listaAtivaId) {
      return;
    }

    const titulo = renameListaTitulo.trim();
    if (!titulo) {
      message.warning('Informe um título para a lista.');
      return;
    }

    setIsSaving(true);
    try {
      await updateListaTarefas(listaAtivaId, { titulo });
      setListas((prev) =>
        prev.map((lista) => (lista.id === listaAtivaId ? { ...lista, titulo } : lista))
      );
      message.success('Lista renomeada com sucesso.');
      setIsRenameModalOpen(false);
      setRenameListaTitulo('');
    } catch (error) {
      console.error('Erro ao renomear lista:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLista = async () => {
    if (!listaAtivaId) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteListaTarefas(listaAtivaId);
      message.success('Lista excluída com sucesso.');
      await loadListas();
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateItem = async () => {
    if (!listaAtivaId) {
      return;
    }

    const conteudo = newItemConteudo.trim();
    if (!conteudo) {
      return;
    }

    setIsSaving(true);
    try {
      await createItemListaTarefas(listaAtivaId, { conteudo });
      setNewItemConteudo('');
      await loadDetalheLista(listaAtivaId);
      await loadListas();
    } catch (error) {
      console.error('Erro ao criar item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleItem = async (item: ItemListaTarefas, concluido: boolean) => {
    if (!listaAtivaId) {
      return;
    }

    setIsSaving(true);
    try {
      const atualizado = await updateItemListaTarefas(listaAtivaId, item.id, { concluido });
      setItens((prev) => prev.map((current) => (current.id === item.id ? atualizado : current)));
      await loadListas();
    } catch (error) {
      console.error('Erro ao marcar item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditItem = (item: ItemListaTarefas) => {
    setEditingItemId(item.id);
    setEditingItemConteudo(item.conteudo);
  };

  const handleSaveItemEdit = async (item: ItemListaTarefas) => {
    if (!listaAtivaId) {
      return;
    }

    const conteudo = editingItemConteudo.trim();
    if (!conteudo) {
      message.warning('O item não pode ficar vazio.');
      return;
    }

    setIsSaving(true);
    try {
      const atualizado = await updateItemListaTarefas(listaAtivaId, item.id, { conteudo });
      setItens((prev) => prev.map((current) => (current.id === item.id ? atualizado : current)));
      setEditingItemId(null);
      setEditingItemConteudo('');
      await loadListas();
    } catch (error) {
      console.error('Erro ao editar item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!listaAtivaId) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteItemListaTarefas(listaAtivaId, itemId);
      await loadDetalheLista(listaAtivaId);
      await loadListas();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMoveItem = async (itemId: number, direction: 'up' | 'down') => {
    if (!listaAtivaId) {
      return;
    }

    const index = itens.findIndex((item) => item.id === itemId);
    if (index < 0) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itens.length) {
      return;
    }

    const novosItens = [...itens];
    const currentItem = novosItens[index];
    novosItens[index] = novosItens[targetIndex];
    novosItens[targetIndex] = currentItem;

    setItens(novosItens.map((item, itemIndex) => ({ ...item, ordem: itemIndex })));

    setIsSaving(true);
    try {
      await reorderItensListaTarefas(listaAtivaId, { item_ids: novosItens.map((item) => item.id) });
    } catch (error) {
      console.error('Erro ao reordenar itens:', error);
      await loadDetalheLista(listaAtivaId);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCompleted = async () => {
    if (!listaAtivaId) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await clearConcluidosListaTarefas(listaAtivaId);
      message.success(`${response.removidos} item(ns) concluído(s) removido(s).`);
      await loadDetalheLista(listaAtivaId);
      await loadListas();
    } catch (error) {
      console.error('Erro ao limpar concluídos:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const openRenameModal = () => {
    if (!listaAtiva) {
      return;
    }

    setRenameListaTitulo(listaAtiva.titulo);
    setIsRenameModalOpen(true);
  };

  return (
    <div className="listas-tarefas-widget w-full h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {loadingListas ? (
          <div className="flex-1 flex items-center justify-center">
            <Spin />
          </div>
        ) : !listas.length ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty
              description={<span className="text-white/75">Nenhuma lista criada</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                className="listas-tarefas-action-btn"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Criar primeira lista
              </Button>
            </Empty>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="min-w-[220px] flex-1"
                popupClassName="listas-tarefas-select-dropdown"
                value={listaAtivaId ?? undefined}
                onChange={(value) => setListaAtivaId(value)}
                options={listas.map((lista) => ({ value: lista.id, label: lista.titulo }))}
              />
              <Button
                type="primary"
                size="small"
                className="listas-tarefas-action-btn"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateModalOpen(true)}
              >
              </Button>
              <Button
                size="small"
                className="listas-tarefas-action-btn listas-tarefas-edit-btn"
                icon={<EditOutlined />}
                onClick={openRenameModal}
                disabled={!listaAtiva}
              >
              </Button>
              <Popconfirm
                overlayClassName="listas-tarefas-popconfirm"
                title="Excluir lista"
                description="Essa ação remove a lista e todos os itens."
                okText="Excluir"
                cancelText="Cancelar"
                onConfirm={() => {
                  void handleDeleteLista();
                }}
              >
                <Button
                  size="small"
                  className="listas-tarefas-action-btn listas-tarefas-delete-btn"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={!listaAtiva}
                >
                  
                </Button>
              </Popconfirm>
            </div>

            <div className="flex items-center justify-between">
             
              <Popconfirm
                overlayClassName="listas-tarefas-popconfirm"
                title="Limpar concluídos"
                description="Remover todos os itens concluídos da lista?"
                okText="Limpar"
                cancelText="Cancelar"
                onConfirm={() => {
                  void handleClearCompleted();
                }}
                disabled={completedCount === 0}
              >
              
              </Popconfirm>
            </div>

            <div className="flex items-center gap-2">
              <Input
                value={newItemConteudo}
                placeholder="Adicionar novo item"
                onChange={(event) => setNewItemConteudo(event.target.value)}
                onPressEnter={() => {
                  void handleCreateItem();
                }}
                disabled={!listaAtivaId || isSaving}
              />
              <Button
                type="primary"
                className="listas-tarefas-action-btn"
                icon={<PlusOutlined />}
                onClick={() => {
                  void handleCreateItem();
                }}
                disabled={!listaAtivaId || !newItemConteudo.trim() || isSaving}
              >
                
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-auto pr-1 widget-no-scrollbar">
              {loadingItens ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Spin size="small" />
                </div>
              ) : itens.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Empty
                    description={<span className="text-white/75">Sem itens nesta lista</span>}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {itens.map((item, index) => {
                    const isEditing = editingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-black/10 bg-black/5"
                      >
                        <Checkbox
                          checked={item.concluido}
                          onChange={(event) => {
                            void handleToggleItem(item, event.target.checked);
                          }}
                          disabled={isSaving}
                        />

                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <Input
                              value={editingItemConteudo}
                              onChange={(event) => setEditingItemConteudo(event.target.value)}
                              onPressEnter={() => {
                                void handleSaveItemEdit(item);
                              }}
                              onBlur={() => {
                                void handleSaveItemEdit(item);
                              }}
                              size="small"
                              autoFocus
                            />
                          ) : (
                            <Text
                              className={`block truncate ${
                                item.concluido ? 'line-through text-white/45' : 'text-white'
                              }`}
                              title={item.conteudo}
                            >
                              {item.conteudo}
                            </Text>
                          )}
                        </div>

                        <Space size={2}>
                          <Button
                            type="text"
                            size="small"
                            className="listas-tarefas-action-btn"
                            icon={<ArrowUpOutlined />}
                            disabled={index === 0 || isSaving}
                            onClick={() => {
                              void handleMoveItem(item.id, 'up');
                            }}
                          />
                          <Button
                            type="text"
                            size="small"
                            className="listas-tarefas-action-btn"
                            icon={<ArrowDownOutlined />}
                            disabled={index === itens.length - 1 || isSaving}
                            onClick={() => {
                              void handleMoveItem(item.id, 'down');
                            }}
                          />
                          {!isEditing && (
                            <Button
                              type="text"
                              size="small"
                              className="listas-tarefas-action-btn listas-tarefas-edit-btn"
                              icon={<EditOutlined />}
                              disabled={isSaving}
                              onClick={() => startEditItem(item)}
                            />
                          )}
                          <Popconfirm
                            overlayClassName="listas-tarefas-popconfirm"
                            title="Excluir item"
                            description="Deseja remover este item?"
                            okText="Excluir"
                            cancelText="Cancelar"
                            onConfirm={() => {
                              void handleDeleteItem(item.id);
                            }}
                          >
                            <Button
                              type="text"
                              size="small"
                              className="listas-tarefas-action-btn listas-tarefas-delete-btn"
                              danger
                              icon={<DeleteOutlined />}
                              disabled={isSaving}
                            />
                          </Popconfirm>
                        </Space>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <Modal
        title="Nova lista"
        open={isCreateModalOpen}
        onOk={() => {
          void handleCreateLista();
        }}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setNewListaTitulo('');
        }}
        okText="Criar"
        cancelText="Cancelar"
        confirmLoading={isSaving}
      >
        <Input
          value={newListaTitulo}
          onChange={(event) => setNewListaTitulo(event.target.value)}
          placeholder="Ex.: Pessoal"
          maxLength={80}
          onPressEnter={() => {
            void handleCreateLista();
          }}
        />
      </Modal>

      <Modal
        title="Renomear lista"
        open={isRenameModalOpen}
        onOk={() => {
          void handleRenameLista();
        }}
        onCancel={() => {
          setIsRenameModalOpen(false);
          setRenameListaTitulo('');
        }}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={isSaving}
      >
        <Input
          value={renameListaTitulo}
          onChange={(event) => setRenameListaTitulo(event.target.value)}
          placeholder="Novo título"
          maxLength={80}
          onPressEnter={() => {
            void handleRenameLista();
          }}
        />
      </Modal>
    </div>
  );
};

export default ListasTarefasWidget;
