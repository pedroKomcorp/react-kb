# AGENTE.MD

## Objetivo
Este documento orienta agentes e contribuidores técnicos que atuam no `react-kb`.
Use-o como referência rápida para desenvolvimento, revisão e envio de PRs.

## Stack e ferramentas
- Frontend: React 19 + TypeScript + Vite
- UI: Ant Design + Tailwind CSS
- Roteamento: `react-router`
- HTTP: `axios`
- Lint: ESLint

## Scripts principais
- `npm run dev`: sobe o ambiente local com Vite (`--host`)
- `npm run build`: valida TypeScript e gera build de produção
- `npm run lint`: executa lint do projeto
- `npm run preview`: executa preview do build local
- `npm run analyze`: build com modo de análise de bundle

## Variáveis de ambiente
- `VITE_API_URL`: URL base da API
- Fallback padrão em desenvolvimento: `http://localhost:8001`
- Referência: `src/services/api.ts`

## Estrutura do projeto
- `src/pages`: páginas por domínio (`login`, `home`, `gestao`, `operacional`)
- `src/components`: componentes reutilizáveis e componentes por domínio
- `src/services`: camada de integração com API
- `src/context`: estados globais (ex.: autenticação e tratamento de erro)
- `src/types`: tipos compartilhados
- `src/hooks`: hooks utilitários

## Arquitetura e fluxo
- Rotas em `src/app.tsx`, com páginas lazy-loaded e proteção via `ProtectedRoute`.
- Layout principal em `MainLayout`, usado dentro da área autenticada.
- Autenticação em `AuthContext` com token em `localStorage`.
- Cliente HTTP central em `src/services/api.ts`:
  - interceptor para tratar `401`, `422` e erros com `detail`;
  - integração com handlers globais de erro e bloqueio de UI.

## Padrões de contribuição
- Preferir TypeScript tipado (evitar `any` sem necessidade real).
- Manter componentes coesos e pequenos; extrair lógica repetida para hooks/serviços.
- Alterações de API devem passar pela camada `src/services`.
- Evitar lógica de regra de negócio espalhada em componentes de UI.
- Preservar nomenclatura e organização por domínio já existentes.

## Checklist antes de abrir PR
1. Garantir que o código compila com `npm run build`.
2. Rodar `npm run lint` e corrigir problemas relevantes.
3. Validar manualmente os fluxos impactados.
4. Descrever no PR:
   - contexto/problema;
   - solução aplicada;
   - riscos e pontos de atenção;
   - evidências (prints, vídeos, logs), quando aplicável.

## Diretriz de PR
- Título objetivo no formato: `tipo: resumo curto`
- Corpo em pt-BR com:
  - **Contexto**
  - **O que foi feito**
  - **Como validar**
  - **Riscos**

## Deploy
- Existe workflow de deploy em `.github/workflows/deploy.yml`.
- Push em `master` dispara deploy por SSH no servidor configurado por secrets.
