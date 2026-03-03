# Rotas - Listas de Tarefas

Este documento define o contrato de backend esperado pelo frontend para o widget de listas de tarefas na Home.

## Regras gerais
- Todas as rotas exigem autenticação (`Bearer token`).
- Escopo por usuário autenticado.
- Formato de erro sugerido: `detail` com mensagem textual.

## Entidades

### ListaTarefas
```json
{
  "id": 1,
  "usuario_id": 10,
  "titulo": "Pessoal",
  "created_at": "2026-03-03T12:00:00Z",
  "updated_at": "2026-03-03T12:30:00Z",
  "total_itens": 3,
  "total_concluidos": 1
}
```

### ItemListaTarefas
```json
{
  "id": 11,
  "lista_id": 1,
  "conteudo": "Enviar proposta",
  "concluido": false,
  "ordem": 0,
  "concluido_em": null,
  "created_at": "2026-03-03T12:10:00Z",
  "updated_at": "2026-03-03T12:10:00Z"
}
```

## Rotas

### 1) Listar listas
- `GET /listas-tarefas/?offset=0&limit=50`
- Resposta:
```json
{
  "listas": [],
  "total": 0
}
```

### 2) Criar lista
- `POST /listas-tarefas/`
- Body:
```json
{ "titulo": "Pessoal" }
```
- Resposta: `ListaTarefas`

### 3) Obter lista detalhada
- `GET /listas-tarefas/{lista_id}`
- Resposta:
```json
{
  "id": 1,
  "usuario_id": 10,
  "titulo": "Pessoal",
  "created_at": "2026-03-03T12:00:00Z",
  "updated_at": "2026-03-03T12:30:00Z",
  "total_itens": 3,
  "total_concluidos": 1,
  "itens": []
}
```

### 4) Atualizar lista
- `PUT /listas-tarefas/{lista_id}`
- Body:
```json
{ "titulo": "Trabalho" }
```
- Resposta: `ListaTarefas`

### 5) Excluir lista
- `DELETE /listas-tarefas/{lista_id}`
- Resposta:
```json
{ "message": "Lista removida com sucesso" }
```

### 6) Criar item
- `POST /listas-tarefas/{lista_id}/itens`
- Body:
```json
{ "conteudo": "Nova tarefa" }
```
- Resposta: `ItemListaTarefas`

### 7) Atualizar item (conteúdo/conclusão)
- `PATCH /listas-tarefas/{lista_id}/itens/{item_id}`
- Body parcial:
```json
{ "conteudo": "Texto atualizado", "concluido": true }
```
- Resposta: `ItemListaTarefas`

### 8) Excluir item
- `DELETE /listas-tarefas/{lista_id}/itens/{item_id}`
- Resposta:
```json
{ "message": "Item removido com sucesso" }
```

### 9) Reordenar itens
- `PUT /listas-tarefas/{lista_id}/itens/ordem`
- Body:
```json
{ "item_ids": [12, 11, 13] }
```
- Resposta:
```json
{ "message": "Ordem atualizada com sucesso" }
```

### 10) Limpar concluídos
- `POST /listas-tarefas/{lista_id}/limpar-concluidos`
- Resposta:
```json
{ "removidos": 2 }
```

## Códigos de status esperados
- `200`/`201`: sucesso
- `401`: não autenticado
- `403`: lista não pertence ao usuário
- `404`: recurso não encontrado
- `409`: conflito de ordenação
- `422`: validação de payload
