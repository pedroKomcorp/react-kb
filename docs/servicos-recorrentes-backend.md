# Serviços Recorrentes - Escopo Backend (`fast-kb`)

## Objetivo
Adicionar uma categoria de projeto exclusiva para serviços recorrentes (`categoria = "SR"`), com regra de reinício automático de status por intervalo de tempo, sem prazo final.

## Mudanças de modelo de dados
Atualizar entidade/tabela `projetos` para suportar recorrência:

- `categoria`: incluir valor `SR` no enum/check.
- `recorrencia_ativa`: `boolean`, default `false`.
- `recorrencia_intervalo_dias`: `int`, nullable.
- `recorrencia_status_reinicio`: enum de status (`NI | EA | P | C`), nullable.
- `recorrencia_ultima_execucao`: `datetime`, nullable.
- `recorrencia_proxima_execucao`: `datetime`, nullable.

Regras de validação sugeridas:

- Se `categoria = SR`:
  - `recorrencia_ativa = true`.
  - `recorrencia_intervalo_dias` obrigatório e `> 0`.
  - `data_prazo = null` e `data_fim = null`.
- Se `categoria != SR`:
  - campos de recorrência podem ser `null`.

## Rotas novas
### 1) `GET /servicos-recorrentes/`
Lista apenas projetos com `categoria = SR`.

Query params sugeridos:
- `offset`, `limit`
- `status` (opcional)
- `responsavel_id` (opcional)
- `search` (opcional, por nome)

Resposta:
- `{ projetos: ProjetoSR[], total: number }`

### 2) `POST /servicos-recorrentes/`
Cria um novo serviço recorrente.

Payload mínimo:
- `nome`
- `prioridade`
- `status`
- `responsavel_id`
- `recorrencia_intervalo_dias`
- `recorrencia_status_reinicio`

Regras:
- Forçar `categoria = "SR"`.
- Forçar `data_prazo = null` e `data_fim = null`.
- Calcular `recorrencia_proxima_execucao` com base em `data_inicio` (ou `agora`) + intervalo.

### 3) `GET /servicos-recorrentes/{id}`
Retorna um serviço recorrente por id (404 se não for `SR`).

### 4) `PATCH /servicos-recorrentes/{id}`
Atualiza status, descrição, responsável e campos de recorrência.

Campos principais:
- `status`
- `recorrencia_intervalo_dias`
- `recorrencia_status_reinicio`
- `recorrencia_ativa`

Se `recorrencia_intervalo_dias` mudar, recalcular `recorrencia_proxima_execucao`.

### 5) `POST /servicos-recorrentes/{id}/reiniciar`
Reinício manual imediato:

- Atualizar `status = recorrencia_status_reinicio`.
- Atualizar `recorrencia_ultima_execucao = agora`.
- Recalcular `recorrencia_proxima_execucao = agora + intervalo`.

Resposta:
- Serviço recorrente atualizado.

## Ajustes em rotas existentes de projetos
### `POST /projetos/` e `PUT/PATCH /projetos/{id}`
Devem aceitar `categoria = "SR"` e respeitar as regras de validação de recorrência.

### `GET /projetos/`
Não precisa mudar formato, mas deve incluir campos de recorrência no schema de resposta.

## Processamento automático (scheduler)
Adicionar job recorrente (cron/celery/worker):

- Buscar serviços com:
  - `categoria = SR`
  - `recorrencia_ativa = true`
  - `recorrencia_proxima_execucao <= agora`
- Para cada registro:
  - `status = recorrencia_status_reinicio`
  - `recorrencia_ultima_execucao = agora`
  - `recorrencia_proxima_execucao = agora + recorrencia_intervalo_dias`
- Persistir log de execução (sucesso/erro) para auditoria.

## Contrato esperado pelo frontend
Campos adicionais retornados para projetos SR:

- `recorrencia_ativa`
- `recorrencia_intervalo_dias`
- `recorrencia_status_reinicio`
- `recorrencia_ultima_execucao`
- `recorrencia_proxima_execucao`

Com isso o frontend consegue:
- Exibir widget exclusivo de serviços recorrentes.
- Manter intervalo/status de reinício.
- Executar reinício manual.
