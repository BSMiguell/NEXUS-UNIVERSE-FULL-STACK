#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("♿ Iniciando testes de acessibilidade...\n");

const testCases = [
  {
    name: "Componentes UI",
    pattern: "src/components/**/*.test.tsx",
    testFile: "a11y-components.test.tsx",
  },
  {
    name: "Páginas",
    pattern: "src/app/**/*.test.tsx",
    testFile: "a11y-pages.test.tsx",
  },
  {
    name: "Utils",
    pattern: "src/utils/**/*.test.ts",
    testFile: "a11y-utils.test.ts",
  },
];

function runTest(testCase) {
  console.log(`\n📋 Testando: ${testCase.name}`);
  console.log(`Padrão: ${testCase.pattern}`);

  try {
    // Procurar arquivos de teste que contenham "a11y" ou "accessibility"
    const files = execSync(
      `find ${path.join(__dirname, "..")} -path "${testCase.pattern}" -type f`,
      { encoding: "utf8" }
    )
      .split("\n")
      .filter(file => file && (file.includes("a11y") || file.includes("accessibility")));

    if (files.length === 0) {
      console.log("⚠️  Nenhum teste de acessibilidade encontrado");
      return { skipped: true };
    }

    console.log(`📁 Arquivos encontrados: ${files.length}`);

    // Executar testes
    const result = execSync(`npm test -- ${files.join(" ")} --coverage`, {
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    });

    console.log("✅ Testes passaram");
    return { success: true, output: result };
  } catch (error) {
    console.error("❌ Testes falharam");
    return { success: false, error: error.message, output: error.stdout || "" };
  }
}

// Executar testes por categoria
const results = [];

testCases.forEach(testCase => {
  const result = runTest(testCase);
  results.push({
    name: testCase.name,
    ...result,
  });
});

// Executar testes gerais de acessibilidade
console.log("\n🔍 Executando testes gerais de acessibilidade...");

try {
  execSync('npm test -- --testNamePattern="accessibility|a11y" --coverage', {
    encoding: "utf8",
    cwd: path.join(__dirname, ".."),
  });
  console.log("✅ Testes gerais passaram");
  results.push({ name: "Geral", success: true });
} catch (error) {
  console.error("❌ Testes gerais falharam");
  results.push({ name: "Geral", success: false, error: error.message });
}

// Verificar se há testes de acessibilidade em componentes
console.log("\n📊 Análise de cobertura de acessibilidade...");

try {
  const componentFiles = execSync('find src/components -name "*.tsx" -type f | wc -l', {
    encoding: "utf8",
  });
  const testFiles = execSync(
    'find src/components -name "*.test.tsx" -type f | grep -E "(a11y|accessibility)" | wc -l',
    { encoding: "utf8" }
  );

  const totalComponents = parseInt(componentFiles.trim());
  const testedComponents = parseInt(testFiles.trim());
  const coverage =
    totalComponents > 0 ? ((testedComponents / totalComponents) * 100).toFixed(1) : "0";

  console.log(`📈 Componentes: ${totalComponents}`);
  console.log(`🧪 Testados: ${testedComponents}`);
  console.log(`📊 Cobertura: ${coverage}%`);
} catch (error) {
  console.log("⚠️  Não foi possível calcular cobertura");
}

// Gerar relatório
console.log("\n📄 Gerando relatório de acessibilidade...");

const report = {
  timestamp: new Date().toISOString(),
  summary: {
    total: results.length,
    passed: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success && !r.skipped).length,
    skipped: results.filter(r => r.skipped).length,
  },
  results: results.map(r => ({
    name: r.name,
    status: r.skipped ? "skipped" : r.success ? "passed" : "failed",
    error: r.error,
  })),
};

const reportPath = path.join(__dirname, "..", "a11y-report.json");
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`\n✅ Relatório salvo em: ${reportPath}`);

// Verificar WCAG guidelines básicas
console.log("\n📋 Verificação WCAG 2.1 básica:");

const wcagChecks = [
  {
    name: "Todos os elementos <img> têm alt?",
    check:
      'find src -name "*.tsx" -type f -exec grep -l "<img" {} \; | xargs grep -L "alt=" | wc -l',
    expected: "0",
  },
  {
    name: "Todos os botões têm texto acessível?",
    check:
      'find src -name "*.tsx" -type f -exec grep -l "<button" {} \; | xargs grep -L "aria-label\\|aria-labelledby" | wc -l',
    expected: "0",
  },
  {
    name: "Formulários têm labels?",
    check:
      'find src -name "*.tsx" -type f -exec grep -l "<input\\|<select\\|<textarea" {} \; | xargs grep -L "label\\|aria-label" | wc -l',
    expected: "0",
  },
];

wcagChecks.forEach(check => {
  try {
    const result = execSync(check.check, {
      encoding: "utf8",
      cwd: path.join(__dirname, ".."),
    }).trim();
    const status = result === check.expected ? "✅" : "⚠️";
    console.log(`${status} ${check.name} (${result})`);
  } catch (error) {
    console.log(`❌ ${check.name} - erro ao verificar`);
  }
});

// Recomendações finais
console.log("\n💡 Recomendações para melhorar acessibilidade:");
console.log("1. Adicione testes de acessibilidade para todos os componentes");
console.log("2. Use @testing-library/jest-dom para matchers adicionais");
console.log("3. Configure eslint-plugin-jsx-a11y para checagem automática");
console.log("4. Teste com leitores de tela reais");
console.log("5. Use ferramentas como WAVE ou axe DevTools");
console.log("6. Implemente testes de contraste de cores");
console.log("7. Teste navegação por teclado em todas as páginas");

console.log("\n✅ Testes de acessibilidade concluídos!");

// Status final
const failedTests = results.filter(r => !r.success && !r.skipped).length;
process.exit(failedTests > 0 ? 1 : 0);
