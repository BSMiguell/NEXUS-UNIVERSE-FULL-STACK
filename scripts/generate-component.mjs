#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentName = process.argv[2];

if (!componentName) {
  console.error("❌ Por favor, forneça o nome do componente");
  console.log("💡 Uso: npm run generate:component NomeDoComponente");
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

const pascalName = toPascalCase(componentName);
const kebabName = toKebabCase(componentName);

const componentDir = path.join(__dirname, "..", "src", "components", kebabName);

if (fs.existsSync(componentDir)) {
  console.error(`❌ Componente "${pascalName}" já existe!`);
  process.exit(1);
}

// Criar diretório
fs.mkdirSync(componentDir, { recursive: true });

// Template do componente
const componentTemplate = `import React from 'react';

interface ${pascalName}Props {
  // Adicione suas props aqui
}

export function ${pascalName}({}: ${pascalName}Props) {
  return (
    <div className="${kebabName}">
      <h2>${pascalName} Component</h2>
    </div>
  );
}
`;

// Template do teste
const testTemplate = `import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ${pascalName} } from './${kebabName}';

describe('${pascalName}', () => {
  it('deve renderizar corretamente', () => {
    render(<${pascalName} />);
    
    expect(screen.getByText('${pascalName} Component')).toBeInTheDocument();
  });
});
`;

// Template do CSS
const cssTemplate = `.${kebabName} {
  /* Adicione seus estilos aqui */
}
`;

// Template do Storybook (opcional)
const storyTemplate = `import type { Meta, StoryObj } from '@storybook/react';
import { ${pascalName} } from './${kebabName}';

const meta = {
  title: 'Components/${pascalName}',
  component: ${pascalName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ${pascalName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
`;

// Criar arquivos
try {
  fs.writeFileSync(path.join(componentDir, `${kebabName}.tsx`), componentTemplate);
  fs.writeFileSync(path.join(componentDir, `${kebabName}.test.tsx`), testTemplate);
  fs.writeFileSync(path.join(componentDir, `${kebabName}.css`), cssTemplate);
  fs.writeFileSync(path.join(componentDir, `${kebabName}.stories.tsx`), storyTemplate);

  console.log(`✅ Componente "${pascalName}" criado com sucesso!`);
  console.log(`📁 Local: ${componentDir}`);
  console.log(`\n📄 Arquivos criados:`);
  console.log(`  - ${kebabName}.tsx`);
  console.log(`  - ${kebabName}.test.tsx`);
  console.log(`  - ${kebabName}.css`);
  console.log(`  - ${kebabName}.stories.tsx`);
  console.log(
    `\n💡 Pronto para usar: import { ${pascalName} } from '@/components/${kebabName}/${kebabName}'`
  );
} catch (error) {
  console.error(`❌ Erro ao criar componente:`, error.message);
  process.exit(1);
}
