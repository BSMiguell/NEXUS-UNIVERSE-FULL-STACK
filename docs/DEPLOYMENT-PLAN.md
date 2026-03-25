# Deployment Plan

## Objetivo

Publicar o frontend React/Vite e o backend Express em um ambiente de producao real com deploy continuo.

## Stack de hosting recomendada

- Frontend: Vercel
- Backend: Render
- Repositorio: GitHub

## O que ja ficou preparado neste repositorio

- O frontend agora suporta `VITE_API_BASE_URL` em `src/lib/api-client.ts`.
- O arquivo `.env.example` documenta a variavel do frontend.
- O arquivo `server/.env.example` documenta as variaveis esperadas no backend.
- O arquivo `vercel.json` adiciona rewrite para SPA com React Router.
- O arquivo `render.yaml` descreve o servico Node do backend no Render.

## Pre-requisitos antes do deploy

- Subir o projeto para um repositorio GitHub.
- Confirmar que o backend tenha:
  - `JWT_SECRET` lido de `process.env.JWT_SECRET`
  - CORS restrito ao dominio do frontend em producao
  - script `npm start` funcional em `server/package.json`

## Frontend na Vercel

### Importacao

- Criar um projeto novo na Vercel conectado ao repositorio GitHub.
- Selecionar a raiz do projeto como o diretorio principal.

### Configuracao esperada

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

### Variaveis de ambiente

- `VITE_API_BASE_URL=https://SEU-BACKEND.onrender.com`

### Observacoes

- Sempre que alterar `VITE_API_BASE_URL`, faca um novo deploy.
- O `vercel.json` garante fallback para `index.html` nas rotas do React Router.

## Backend no Render

### Importacao

- Criar um novo Web Service no Render apontando para o mesmo repositorio GitHub.
- O `render.yaml` ja define o `rootDir` como `server`.

### Configuracao esperada

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

### Variaveis de ambiente

- `JWT_SECRET=<valor-longo-e-seguro>`
- `FRONTEND_ORIGIN=https://SEU-FRONTEND.vercel.app`

## Ordem recomendada de publicacao

1. Ajustar backend para producao.
2. Publicar backend no Render.
3. Copiar a URL publica do backend.
4. Configurar `VITE_API_BASE_URL` na Vercel com essa URL.
5. Publicar frontend na Vercel.
6. Voltar ao backend e restringir CORS para a URL final do frontend.

## Checklist final

- O frontend abre diretamente em rotas como `/login`, `/register` e `/favoritos`.
- O login funciona com o backend publicado.
- Favoritos persistem no servidor.
- Requests do frontend vao para o dominio do Render, nao para `localhost`.
- `JWT_SECRET` nao esta hardcoded no backend.
