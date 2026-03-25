const fs = require("fs");
const path = require("path");

// Função para importar o clipboardy dinamicamente
async function getClipboardy() {
  const { default: clipboardy } = await import("clipboardy");
  return clipboardy;
}

const commandFilePath = path.join(__dirname, ".ai-sync", "codex_command.txt");

console.log("[Watcher] Observador de comandos iniciado.");
console.log(
  `[Watcher] Aguardando por novas instruções no arquivo: ${commandFilePath}`,
);

// Garante que o arquivo de comando exista
if (!fs.existsSync(commandFilePath)) {
  fs.writeFileSync(commandFilePath, "Nenhuma instrução no momento.", "utf8");
}

let lastContent = fs.readFileSync(commandFilePath, "utf8");

fs.watchFile(commandFilePath, { interval: 1000 }, async (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    try {
      const newContent = fs.readFileSync(commandFilePath, "utf8");

      // Evita disparar com a mesma instrução ou arquivo vazio
      if (
        newContent &&
        newContent.trim() !== "" &&
        newContent !== lastContent
      ) {
        lastContent = newContent;
        const clipboardy = await getClipboardy();
        await clipboardy.write(newContent);

        console.log("--------------------------------------------------");
        console.log("🚀 Nova instrução para o Codex foi copiada!");
        console.log("👉 Agora é só colar (Ctrl+V) no chat dele.");
        console.log("--------------------------------------------------");
      }
    } catch (error) {
      console.error(
        "[Watcher] Erro ao ler o arquivo de comando ou copiar para a área de transferência:",
        error,
      );
    }
  }
});

// Mantém o processo rodando
process.stdin.resume();
