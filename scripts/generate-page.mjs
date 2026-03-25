#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pageName = process.argv[2];

if (!pageName) {
  console.error("❌ Por favor, forneça o nome da página");
  console.log("💡 Uso: npm run generate:page NomeDaPagina");
  process.exit(1);
}

// Função para converter para PascalCase
function toPascalCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

// Função para converter para kebab-case
function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

const pascalName = toPascalCase(pageName);
const kebabName = toKebabCase(pageName);

const pageDir = path.join(__dirname, "..", "src", "app", kebabName);
const pageFile = path.join(__dirname, "..", "src", "app", `${kebabName}.tsx`);

// Verificar se já existe
if (fs.existsSync(pageFile) || fs.existsSync(pageDir)) {
  console.error(`❌ Página "${pascalName}" já existe!`);
  process.exit(1);
}

// Template para App Router (Next.js 13+)
const appRouterTemplate = `'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ${pascalName}Content } from '@/components/${kebabName}/${kebabName}-content';

export default function ${pascalName}Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <${pascalName}Content />
      </main>
      <Footer />
    </div>
  );
}`;

// Template para componente de conteúdo
const contentTemplate = `import { useState } from 'react';

export function ${pascalName}Content() {
  const [count, setCount] = useState(0);

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          ${pascalName} Page
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Esta é a página ${pascalName}. Customize conforme necessário.
        </p>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Estado de Exemplo</h2>
          <p className="text-lg mb-4">Contador: {count}</p>
          <button
            onClick={() => setCount(count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Incrementar
          </button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Seção 1</h3>
          <p className="text-gray-300">
            Adicione conteúdo relevante aqui. Use imagens, textos e elementos interativos.
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Seção 2</h3>
          <p className="text-gray-300">
            Mais conteúdo para compor a página. Mantenha consistência com o design do site.
          </p>
        </div>
      </section>

      <section className="text-center">
        <h3 className="text-2xl font-semibold mb-4">Próximos Passos</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
            Adicionar conteúdo
          </span>
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
            Customizar estilos
          </span>
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            Implementar lógica
          </span>
        </div>
      </section>
    </div>
  );
}`;

// Template para testes
const testTemplate = `import { render, screen } from '@testing-library/react';
import { ${pascalName}Content } from './${kebabName}-content';

describe('${pascalName}Content', () => {
  it('deve renderizar o título corretamente', () => {
    render(<${pascalName}Content />);
    
    expect(screen.getByText('${pascalName} Page')).toBeInTheDocument();
  });

  it('deve renderizar o contador e botão', () => {
    render(<${pascalName}Content />);
    
    expect(screen.getByText('Contador: 0')).toBeInTheDocument();
    expect(screen.getByText('Incrementar')).toBeInTheDocument();
  });

  it('deve incrementar o contador ao clicar no botão', () => {
    render(<${pascalName}Content />);
    
    const button = screen.getByText('Incrementar');
    button.click();
    
    expect(screen.getByText('Contador: 1')).toBeInTheDocument();
  });
});`;

// Template para Storybook
const storyTemplate = `import type { Meta, StoryObj } from '@storybook/react';
import { ${pascalName}Content } from './${kebabName}-content';

const meta = {
  title: 'Pages/${pascalName}',
  component: ${pascalName}Content,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ${pascalName}Content>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomContent: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Exemplo com conteúdo personalizado',
      },
    },
  },
};`;

// Criar diretório e arquivos
try {
  // Criar diretório do componente
  const componentDir = path.join(__dirname, "..", "src", "components", kebabName);
  fs.mkdirSync(componentDir, { recursive: true });

  // Criar página principal
  fs.writeFileSync(pageFile, appRouterTemplate);

  // Criar componente de conteúdo
  fs.writeFileSync(path.join(componentDir, `${kebabName}-content.tsx`), contentTemplate);

  // Criar testes
  fs.writeFileSync(path.join(componentDir, `${kebabName}-content.test.tsx`), testTemplate);

  // Criar Storybook
  fs.writeFileSync(path.join(componentDir, `${kebabName}-content.stories.tsx`), storyTemplate);

  console.log(`✅ Página "${pascalName}" criada com sucesso!`);
  console.log(`📁 Arquivos criados:`);
  console.log(`  - src/app/${kebabName}.tsx (página principal)`);
  console.log(`  - src/components/${kebabName}/${kebabName}-content.tsx`);
  console.log(`  - src/components/${kebabName}/${kebabName}-content.test.tsx`);
  console.log(`  - src/components/${kebabName}/${kebabName}-content.stories.tsx`);
  console.log(`\n🌐 Acesse: http://localhost:3000/${kebabName}`);
  console.log(`📖 Storybook: http://localhost:6006/?path=/story/pages-${kebabName}`);
} catch (error) {
  console.error(`❌ Erro ao criar página:`, error.message);
  process.exit(1);
}
