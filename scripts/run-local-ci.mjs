#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Iniciando CI Local...\n");

const startTime = Date.now();
const results = [];

function runCommand(command, description) {
  console.log(`\n📋 ${description}`);
  console.log(`Comando: ${command}`);

  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: path.join(__dirname, ".."),
    });

    console.log("✅ Sucesso");
    results.push({ description, status: "success", output });
    return { success: true, output };
  } catch (error) {
    console.error("❌ Falhou");
    console.error(error.message);
    results.push({
      description,
      status: "failed",
      error: error.message,
      output: error.stdout || "",
    });
    return { success: false, error: error.message };
  }
}

// Verificar se act está instalado
function checkAct() {
  try {
    execSync("which act", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// Executar checks
console.log("🔍 Verificando ambiente...");

// 1. Type Check
runCommand("npm run type-check", "TypeScript Type Check");

// 2. Lint
runCommand("npm run lint", "ESLint Check");

// 3. Format Check
runCommand("npm run format:check", "Prettier Format Check");

// 4. Unit Tests
runCommand("npm run test:coverage", "Unit Tests with Coverage");

// 5. Build
runCommand("npm run build", "Next.js Build");

// 6. Accessibility Tests
console.log("\n♿ Testes de Acessibilidade");
runCommand("npm run test:a11y || true", "Acessibilidade (não falha o CI)");

// 7. Security Audit
console.log("\n🔒 Security Audit");
runCommand("npm audit --audit-level=high || true", "Security Audit");

// 8. Bundle Analysis
console.log("\n📦 Bundle Analysis");
runCommand("npm run analyze || true", "Bundle Analysis");

// 9. Testar Storybook Build
console.log("\n📚 Storybook Build Test");
runCommand("npm run build-storybook || true", "Storybook Build");

// 10. Verificar se há console.log
console.log("\n🔍 Checking for console.log statements...");
try {
  const grepResult = execSync(
    'grep -r "console\\.log" src/ --include="*.ts" --include="*.tsx" || true',
    { encoding: "utf8" }
  );
  if (grepResult.trim()) {
    console.log("⚠️ Console.log encontrado:");
    console.log(grepResult);
  } else {
    console.log("✅ Nenhum console.log encontrado");
  }
} catch (error) {
  console.log("✅ Nenhum console.log encontrado");
}

// Resumo final
const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log("\n" + "=".repeat(50));
console.log("📊 RESUMO DO CI LOCAL");
console.log("=".repeat(50));
console.log(`⏱️  Duração: ${duration}s`);

const successCount = results.filter(r => r.status === "success").length;
const failedCount = results.filter(r => r.status === "failed").length;

console.log(`✅ Passou: ${successCount}`);
console.log(`❌ Falhou: ${failedCount}`);
console.log(`📋 Total: ${results.length}`);

if (failedCount > 0) {
  console.log("\n🔍 Falhas encontradas:");
  results
    .filter(r => r.status === "failed")
    .forEach(r => {
      console.log(`  - ${r.description}: ${r.error}`);
    });
}

// Criar relatório
const reportPath = path.join(__dirname, "..", "ci-report.json");
const report = {
  timestamp: new Date().toISOString(),
  duration: `${duration}s`,
  results,
  summary: {
    total: results.length,
    passed: successCount,
    failed: failedCount,
    successRate: ((successCount / results.length) * 100).toFixed(1) + "%",
  },
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Relatório salvo em: ${reportPath}`);

// Verificar se act está disponível para CI completo
if (checkAct()) {
  console.log("\n🎯 Para executar o CI completo com GitHub Actions localmente:");
  console.log("   act -j quality-check");
  console.log("   act -j e2e-tests");
} else {
  console.log("\n💡 Para executar CI completo com GitHub Actions localmente:");
  console.log(
    "   Instale: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash"
  );
  console.log("   Execute: act");
}

console.log("\n✅ CI Local concluído!");

// Exit code baseado nos resultados
process.exit(failedCount > 0 ? 1 : 0);
