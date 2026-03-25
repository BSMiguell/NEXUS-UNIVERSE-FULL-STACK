# React Migration Plan

## O que ja foi feito

- Base com `Vite + React + TypeScript`
- `React Router` com paginas iniciais
- `TanStack Query` configurado
- `Zustand` para filtros e favoritos
- `Tailwind CSS` configurado
- Estrutura pronta para `Shadcn UI`
- Dataset legado reaproveitado via `src/data/legacy-characters.js`
- Versao antiga preservada em `index.legacy.html`

## Arquivos que eu assumi

- `package.json`
- `index.html`
- `vite.config.ts`
- `tsconfig*.json`
- `tailwind.config.ts`
- `postcss.config.js`
- `eslint.config.js`
- `components.json`
- `src/main.tsx`
- `src/app/**`
- `src/lib/**`
- `src/services/**`
- `src/store/**`
- `src/types/**`
- `src/hooks/**`
- `src/styles/**`

## Tarefas para o Zencoder

- Migrar o hero principal do `index.legacy.html` para um componente React em `src/components/home/hero-section.tsx`
- Migrar o painel de filtros visual para componentes menores sem mudar a regra de negocio atual
- Separar os cards em subcomponentes visuais quando necessario
- Portar secoes estaticas e decorativas do layout legado para Tailwind
- Criar pagina de detalhes do personagem usando dados existentes

## Tarefas para eu continuar depois

- Migrar busca fuzzy do sistema legado para hooks React
- Migrar favoritos completos com ordenacao e interface de gerenciamento
- Criar pagina de modelos 3D com viewer e filtros
- Planejar code splitting para reduzir o bundle inicial
- Integrar chamadas reais de API com Axios quando o backend estiver definido

## Regra de colaboracao

- O Zencoder deve evitar editar `src/app/**`, `src/lib/**`, `src/store/**` e `src/services/**`
- O foco dele deve ficar em `src/components/**` e, se necessario, `src/pages/**`
- Antes de mover alguma regra de negocio do legado, conferir se ela ja existe em Zustand ou TanStack Query
