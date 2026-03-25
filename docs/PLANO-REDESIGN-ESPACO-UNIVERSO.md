# Plano Master: Redesign Total (Tema Espaco e Universo)

## Status Atual
- Fase atual: home, modelos, favoritos, perfil de personagem, autenticacao (login/register), fluxo de criacao/edicao de personagem, painel admin e batalhas alinhados ao novo sistema cosmico.
- Escopo entregue nesta rodada:
  - Hero cosmico refeito com narrativa mais cinematica.
  - Home reorganizada em secoes de Missao, Tecnologia, Provas, Roadmap e CTA para a galeria.
  - Galeria funcional preservada com filtros, paginacao e atalhos.
  - Novo conjunto inicial de estilos "cosmos" adicionado ao tema global.
  - Ajustes mobile-first e reduced-motion adicionados na home.
  - Reveals sutis por secao e microinteracoes de hover refinadas.
  - Pagina `modelos` redesenhada como arsenal tridimensional do mesmo universo visual.
  - Filtros, cards e empty state de `modelos` atualizados para o novo sistema.
  - Pagina `favoritos` redesenhada com hero cosmico, telemetria da colecao e galeria virtualizada integrada.
  - Pagina de perfil de personagem (`/personagem/[id]`) redesenhada no mesmo idioma visual com capitulos, metricas e leitura operacional.
  - Paginas `login` e `register` migradas para o tema cosmico com paineis narrativos, estados de formulario e reduced-motion.
  - Build de validacao executado com sucesso apos a migracao de autenticacao (`npm.cmd run build`).
  - Fluxo de cadastro de personagem (`/characters/new` e `/characters/[id]/edit`) refinado com layout cosmico por blocos, sinalizacao de modo e formulario mais legivel.
  - Build de validacao executado com sucesso apos a rodada de formulario (`npm.cmd run build`).
  - Painel admin (`/admin/users`) elevado para o idioma cosmico com hero de comando, telemetria visual e refinamento dos controles de filtro.
  - Build de validacao executado com sucesso apos a rodada do admin (`npm.cmd run build`).
  - Rotas de batalha (`/batalha` e `/batalha-2d`) refinadas com hero cosmico, entrada animada consistente e melhoria de navegacao para reduced-motion.
  - Build de validacao executado com sucesso apos a rodada de batalhas (`npm.cmd run build`).
  - Camada de servico de personagens endurecida para QA final (normalizacao de filtros, paginacao segura e deduplicacao por ID).
  - Build de validacao executado com sucesso apos o hardening de servicos (`npm.cmd run build`).
- Proximo alvo:
  - Expandir o sistema visual para rotas administrativas e experiencia de batalha.

## Objetivo
Refazer o site inteiro do zero com um visual espacial/cosmico, alto impacto (11/10), com animacoes, transicoes e elementos 3D. O resultado precisa ter alma: visual autoral, intencional e nada "generico de IA".

## Principios de Design (anti-IA)
- Direcao criativa clara e consistente (tema, narrativa, linguagem visual).
- Tipografia com personalidade (sem stacks comuns; fontes escolhidas por voz da marca).
- Paleta propria (contraste cromatico e temperatura definida, sem roxo padrao).
- Composicao cinematica (profundidade, escala, respiro, foco).
- Detalhes humanos: micro-texturas, imperfeicoes controladas, padroes organicos.
- Ritmo visual variado (quebra de grades, gestos grandes e pequenos).

## Fase 0: Diagnostico e Alinhamento
- Inventario de paginas e funcoes essenciais.
- Mapear fluxo principal (home -> produto -> conversao).
- Definir KPI visual: tempo de permanencia, scroll depth, conversao.
- Identificar restricoes tecnicas (stack, performance, SEO).
- Status:
  - Stack confirmada: Next.js + React + TypeScript + Tailwind + Framer Motion + Three.js/R3F.
  - Home identificada como melhor ponto de entrada para o redesign sem quebrar fluxo principal.

## Fase 1: Direcao Criativa e Narrativa
- Conceito central: "Viagem pelo cosmos" (capitulos por secao).
- Moodboard com referencias espaciais (sem copiar estilos prontos).
- Definir linguagem de movimento (lento, gravitacional, elegante).
- Criar "sistema de luz": brilho, neblina, estrelas, volumetria.
- Status:
  - Direcao escolhida na implementacao: observatorio cosmico com atmosfera cinematica, brilho controlado e cobre estelar como contraste.
  - Linguagem da home passou a usar capitulos narrativos em vez de apenas blocos funcionais.

## Fase 2: Sistema Visual
- Tipografia:
  - Titulo: fonte com carater sci-fi sobrio (nao futurista generico).
  - Texto: fonte legivel, humana, com contraste de pesos.
- Cores:
  - Base: noite profunda (azul/indigo/charcoal).
  - Acentos: cobre, gelo, neon suave (1-2 cores).
- Grid:
  - 12 colunas no desktop com quebras intencionais.
  - Camadas com offsets para profundidade.
- UI tokens:
  - espacamento, raios, sombras, blur, glow.
- Iconografia:
  - set unico com traco e brilho coerentes.
- Status:
  - Primeira camada de tokens e classes visuais "cosmos" implementada no CSS global.
  - Superficies, brilhos, orbitas, metricas e paineis narrativos adicionados.

## Fase 3: Arquitetura da Pagina (One-page narrativa)
- Hero:
  - Cena 3D principal (planeta / nave / astrolabio).
  - Headline curta e poetica + CTA forte.
- Secao 1: "Missao"
  - Texto + mini animacao orbital.
- Secao 2: "Tecnologia"
  - Cards com hover 3D (parallax e tilt).
- Secao 3: "Provas"
  - Depoimentos em orbitas / carrossel.
- Secao 4: "Roadmap"
  - Linha do tempo como constelacao.
- Secao 5: "CTA Final"
  - Cena de pouso, botao principal.
- Status:
  - Estrutura narrativa da home implementada com Hero, Missao, Tecnologia, Provas, Roadmap e CTA para o hangar/galeria.
  - A galeria real do produto foi mantida como parte final da jornada.

## Fase 4: 3D e Motion
- 3D:
  - Biblioteca: Three.js ou React Three Fiber.
  - Assets: modelos low/med poly otimizados, com normal maps leves.
  - Fallback 2D para mobile fraco.
- Motion:
  - Scroll-driven reveals (stagger + depth).
  - Parallax em 3-4 camadas.
  - Micro-interacoes com easing suave e fisica leve.
- Transicoes:
  - Pagina: fade + zoom sutil.
  - Secoes: blur + glow, sem excesso.
- Status:
  - Cena 3D do hero reaproveitada e recontextualizada dentro do novo observatorio visual.
  - Motion base refinado com reveals por secao, hover mais suave e suporte a `prefers-reduced-motion`.
  - Ainda pode receber uma rodada dedicada de fallback e polimento fino de cena 3D.

## Fase 5: Conteudo com Alma
- Copy poetico com linguagem espacial.
- Frases curtas, sugestivas e confiantes.
- Misturar tecnico com emocional (credibilidade + encantamento).

## Fase 6: Implementacao
- Setup base:
  - Tokens CSS, variaveis e tema.
  - Layouts responsivos (desktop-first + mobile refinado).
- Componentes:
  - Hero 3D
  - Cards com hover 3D
  - Timeline constelacao
  - CTA final cinematica
- Status:
  - Home implementada com narrativa completa.
  - Pagina de modelos migrada para a nova direcao visual com arsenal, telemetria e biblioteca 3D.
  - Pagina de favoritos migrada para o mesmo idioma visual, mantendo ordenacao, limpeza e carregamento progressivo.
  - Pagina de detalhe do personagem migrada com hero, estado de erro/loading consistente e narrativa cosmica.
  - Paginas de autenticacao (`/login` e `/register`) migradas mantendo validacao, toasts e redirecionamentos.
  - Pagina de criacao/edicao de personagem migrada para o tema cosmico, preservando validacao Zod, JSON de detalhes e fluxo de submit.
  - Pagina administrativa de usuarios/auditoria/personagens migrada para o mesmo sistema visual cosmico.
  - Paginas de batalha 3D e 2D integradas ao mesmo ritmo visual e de animacao do sistema.

## Fase 7: Performance e Acessibilidade
- Lazy-load de 3D e efeitos.
- Prefer-reduced-motion respeitado.
- Imagens WebP/AVIF.
- Contraste minimo AA.
- Status:
  - Reduced-motion aplicado tambem nas arenas de batalha.
  - Build geral ok e type-check completo normalizado.
  - Compatibilidade do teste legado de botao restabelecida em `src/components/ui/Button/Button.tsx`.
  - Suite focada de testes Vitest executada com sucesso: 7 arquivos / 37 testes aprovados.

## Fase 8: QA e Polimento
- Testar em desktop, tablet e mobile.
- Afinar animacoes (duracao, delays, ritmo).
- Ajustar tipografia (tracking, leading).
- Revisar consistencia visual e narrativa.

## Entregaveis
- Sistema visual completo (tokens).
- Layout final de todas as secoes.
- Arquivos 3D otimizados.
- Implementacao com animacoes + transicoes.
- Checklist de qualidade final.

## Criterios de Sucesso
- Identidade visual unica e memoravel.
- Fluidez e ritmo (nada rigido ou artificial).
- Performance aceitavel mesmo com 3D.
- Conversao melhor ou igual ao layout anterior.

## Proximos Passos Imediatos
1. Refinar responsividade e ritmo de animacoes da nova home.
2. Ajustar tipografia e paleta fina com base no visual ja implementado.
3. Evoluir o hero 3D com uma cena ainda mais autoral e fallback dedicado.
4. Executar rodada de QA final (mobile, acessibilidade e consistencia narrativa entre rotas).
