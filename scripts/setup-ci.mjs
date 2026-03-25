#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🛠️  Configurando ambiente de CI local...\n");

const steps = [
  {
    name: "Verificar Node.js",
    command: "node --version",
    description: "Node.js version",
  },
  {
    name: "Verificar npm",
    command: "npm --version",
    description: "npm version",
  },
  {
    name: "Instalar act (GitHub Actions local)",
    command: 'which act || echo "act não instalado"',
    description: "act installation",
  },
  {
    name: "Verificar dependências",
    command: "npm ls --depth=0",
    description: "Dependencies",
  },
];

// Função para executar comando
function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  try {
    const output = execSync(command, {
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    }).trim();
    console.log(`✅ ${output}`);
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Executar verificações
console.log("🔍 Verificando ambiente...");
steps.forEach(step => {
  runCommand(step.command, step.name);
});

// Verificar e criar arquivos necessários
console.log("\n📁 Verificando arquivos de configuração...");

const configFiles = [
  ".github/workflows/local-ci.yml",
  ".actrc",
  "lighthouserc.js",
  "eslint.strict.config.js",
  ".storybook/main.ts",
  ".storybook/preview.ts",
];

configFiles.forEach(file => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`⚠️  ${file} não encontrado`);
  }
});

// Criar diretórios necessários
console.log("\n📂 Criando diretórios...");

const directories = [".github/workflows", ".storybook", "src/stories", "scripts"];

directories.forEach(dir => {
  const dirPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Criado: ${dir}`);
  } else {
    console.log(`✅ Existe: ${dir}`);
  }
});

// Verificar scripts no package.json
console.log("\n📦 Verificando scripts...");

try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
  );
  const scripts = packageJson.scripts || {};

  const requiredScripts = [
    "ci:local",
    "ci:act",
    "test:a11y",
    "storybook",
    "build-storybook",
    "lint:strict",
  ];

  requiredScripts.forEach(script => {
    if (scripts[script]) {
      console.log(`✅ Script "${script}" configurado`);
    } else {
      console.log(`⚠️  Script "${script}" não encontrado`);
    }
  });
} catch (error) {
  console.error("❌ Erro ao ler package.json:", error.message);
}

// Instalar act se não estiver instalado
console.log("\n🛠️  Instalando ferramentas necessárias...");

console.log("\n📥 Para instalar act (GitHub Actions local):");
console.log("   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash");
console.log("   # ou via Homebrew (macOS):");
console.log("   brew install act");

console.log("\n📥 Para instalar outras ferramentas úteis:");
console.log("   npm install -g @lhci/cli"); // Lighthouse CI
console.log("   npm install -g audit-ci"); // Security audit

// Criar arquivo de ambiente
console.log("\n⚙️  Criando arquivo de ambiente...");

const envContent = `# Ambiente de desenvolvimento local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# CI/CD local
CI=true
NODE_ENV=test

# Features
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_ENABLE_MSW=true

# Performance
NEXT_PUBLIC_DISABLE_TELEMETRY=1

# Development tools
ESLINT_NO_DEV_ERRORS=true

# Para GitHub Actions local (act)
# GITHUB_TOKEN=your_token_here
# NPM_TOKEN=your_npm_token_here
`;

const envPath = path.join(__dirname, "..", ".env.local.ci");
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log("✅ Arquivo .env.local.ci criado");
} else {
  console.log("✅ Arquivo .env.local.ci já existe");
}

// Criar script de teste rápido
console.log("\n🧪 Criando script de teste rápido...");

const quickTestContent = `#!/bin/bash

echo "🚀 Teste rápido de CI"
echo "===================="

# TypeScript
echo "📋 TypeScript..."
npm run type-check

# Lint
echo "🔍 Lint..."
npm run lint

# Build
echo "🏗️  Build..."
npm run build

echo "✅ Teste rápido concluído!"
`;

const quickTestPath = path.join(__dirname, "..", "quick-test.sh");
fs.writeFileSync(quickTestPath, quickTestContent);
execSync(`chmod +x ${quickTestPath}`);
console.log("✅ Script quick-test.sh criado");

// Instruções finais
console.log("\n📖 INSTRUÇÕES PARA USAR O CI LOCAL:");
console.log("");
console.log("1. Executar CI completo:");
console.log("   npm run ci:local");
console.log("");
console.log("2. Executar com act (GitHub Actions local):");
console.log("   npm run ci:act");
console.log("   # ou para jobs específicos:");
console.log("   act -j quality-check");
console.log("   act -j e2e-tests");
console.log("");
console.log("3. Testes individuais:");
console.log("   npm run test:a11y        # Acessibilidade");
console.log("   npm run storybook        # Storybook");
console.log("   npm run build-storybook  # Build Storybook");
console.log("");
console.log("4. Lint estrito:");
console.log("   npm run lint:strict");
console.log("");
console.log("5. Teste rápido:");
console.log("   ./quick-test.sh");
console.log("");
console.log("✅ Configuração de CI concluída!");
console.log("");
console.log("💡 Dicas:");
console.log('   - Use "npm run ci:local" para testes rápidos');
console.log('   - Use "act" para simular GitHub Actions');
console.log("   - Configure pre-commit hooks para checagens automáticas");
console.log("   - Monitore performance com Lighthouse CI");
