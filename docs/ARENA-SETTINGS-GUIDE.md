# 🎮 Painel de Configurações da Arena 2D - Guia de Uso

## O que foi implementado?

Você agora tem um **painel de controle completo** para personalizar todos os elementos visuais da arena de batalha 2D em tempo real!

---

## 📍 Como Acessar

1. **Inicie uma batalha 2D**
2. **Clique no botão ⚙️ CONFIGURAÇÕES** no canto superior direito da tela
3. O painel se abrirá com várias abas de controle

---

## 🎨 O que Pode Ser Personalizado

### 1️⃣ **NOMES dos Personagens** (Aba: Nomes)

- **Tamanho do Nome**: Ajuste de 8px a 32px
- **Cor do Nome**: Escolha qualquer cor com o seletor de cores
- **Posição Vertical**: Mova o nome para cima ou para baixo (-50px a +50px)
- **Sombra de Texto**: Ative/desative o efeito de sombra

![Nomes Customizados](Personalize o tamanho, cor e posição dos nomes)

### 2️⃣ **BARRAS DE VIDA** (Aba: Vida)

- **Altura da Barra**: Redimensione as barras de 8px a 48px
- **Tema de Cores**:
  - 🟢 **Padrão**: Verde/Vermelho (original)
  - 🔵 **Ciano**: Ciano/Laranja (moderno)
  - 🟣 **Roxo**: Roxo/Rosa (premium)
  - 🟡 **Amarelo**: Amarelo/Vermelho (retrô)
- **Animação de Pulso**: Ative/desative a animação
- **Efeito Brilho**: Ative/desative o glow efeito

![Barras de Vida Personalizadas](Escolha entre múltiplos temas)

### 3️⃣ **LABELS** (Aba: Labels)

- **Texto do Jogador**: Customize o texto "JOGADOR" (até 20 caracteres)
- **Texto do Bot**: Customize o texto "BOT" (até 20 caracteres)
- **Visibilidade**: Mostre/esconda os labels completamente

![Labels Customizados](Mude os textos e controle a visibilidade)

---

## 💾 Salvamento Automático

Todas as suas configurações são **salvas automaticamente** no navegador (localStorage). Quando você retornar para uma nova batalha, as mesmas personalizações serão aplicadas!

---

## 🔄 Restaurar Padrão

Clique no botão **"Descartar Configurações"** na seção de Ações para voltar a todos os valores padrão.

---

## 🚀 Dicas de Uso

### Para Melhor Performance:

- Em dispositivos mais lentos, desative a "Animação de Pulso" e o "Efeito Brilho"

### Para Maximizar a Legibilidade:

- Aumente o "Tamanho do Nome" para 24px ou mais
- Escolha cores contrastantes com o fundo da arena

### Para um Look Retro:

- Uso o tema "Amarelo"
- Aumente a altura das barras para 40px+

### Para um Look Futurista:

- Use o tema "Ciano"
- Mantenha tamanho de nome em 14-18px
- Ative "Animação de Pulso" e "Efeito Brilho"

---

## 🎯 Exemplos de Configuração

### Configuração Clássica

```
Nome: 14px, Branco, Offset -28, Sombra ON
Barra: 32px altura, Tema Padrão, Animação ON, Glow ON
Label: "JOGADOR" e "BOT", Visível
```

### Configuração Gamer Hardcore

```
Nome: 20px, #FF00FF (Rosa Neon), Offset -35, Sombra ON
Barra: 40px altura, Tema Roxo, Animação ON, Glow ON
Label: "P1" e "IA", Visível
```

### Configuração Minimalista

```
Nome: 12px, #CCCCCC (Cinza claro), Offset -25, Sombra OFF
Barra: 20px altura, Tema Padrão, Animação OFF, Glow OFF
Label: Nomes padrão, Visível
```

---

## 🛠️ Integração Técnica

### Arquivos Criados:

- `src/js/systems/arena-settings.js` - Gerenciador de configurações
- Estilos adicionados em `src/css/components/battle-system-2.css`

### HTML Modificado:

- Painel adicionado no arquivo `index.html`

### JavaScript Modificado:

- `src/js/systems/battle-system-v2.js` - Integração com sistema de batalha

### Características:

- ✅ Persistência via localStorage
- ✅ Interface responsiva
- ✅ Controles intuitivos (sliders, color picker, text inputs)
- ✅ Renderização em tempo real
- ✅ 4 Temas de cores pré-definidos
- ✅ Restauração para padrão com confirmação

---

## 📞 Suporte

Se houver dúvidas sobre as configurações ou encontrar algum problema:

1. Verifique se o localStorage está habilitado no navegador
2. Tente restaurar para o padrão
3. Limpe o cache do navegador e recarregue

---

**Divirta-se personalizando sua arena! 🎮✨**
