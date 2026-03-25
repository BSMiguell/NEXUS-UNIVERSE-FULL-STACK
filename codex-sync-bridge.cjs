/**
 * Bridge do Codex para sincronização com Kimi (Trae IDE)
 * Coloque este arquivo no seu workspace do VS Code
 */

const fs = require("fs");
const path = require("path");

class CodexSyncBridge {
  constructor() {
    this.syncFolder = ".ai-sync";
    this.config = this.loadConfig();
    this.initialize();
  }

  initialize() {
    console.log("[Codex] Iniciando bridge de sincronização...");

    // Monitora mudanças do Kimi
    this.watchForKimiUpdates();

    // Envia heartbeat inicial
    this.sendHeartbeat();
  }

  loadConfig() {
    const configPath = path.join(process.cwd(), ".ai-sync-config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
    return { bridge: { autoSync: true } };
  }

  watchForKimiUpdates() {
    const contextFile = path.join(this.syncFolder, "context.json");

    if (fs.existsSync(contextFile)) {
      fs.watchFile(contextFile, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          this.processKimiUpdate(contextFile);
        }
      });
    }
  }

  processKimiUpdate(filePath) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (data.source === "kimi" && data.target === "codex") {
        console.log("[Codex] Atualização recebida do Kimi:", data.context);

        // Processa o contexto recebido
        if (data.context.suggestions) {
          this.showSuggestions(data.context.suggestions);
        }

        if (data.context.message) {
          this.showNotification(data.context.message);
        }
      }
    } catch (error) {
      console.error("[Codex] Erro ao processar atualização:", error);
    }
  }

  // Envia código gerado ou modificado para o Kimi
  sendCodeChanges(changes, filePath) {
    const changeData = {
      timestamp: Date.now(),
      agent: "codex",
      changes: changes,
      file: filePath,
      projectPath: process.cwd(),
    };

    this.updateSyncFile("changes", changeData);
    console.log("[Codex] Mudanças enviadas para o Kimi");
  }

  // Solicita revisão do Kimi
  requestReview(code, context) {
    const reviewRequest = {
      timestamp: Date.now(),
      source: "codex",
      target: "kimi",
      type: "review-request",
      code: code,
      context: context,
    };

    this.updateSyncFile("context", reviewRequest);
    console.log("[Codex] Revisão solicitada do Kimi");
  }

  // Envia resposta para o Kimi
  sendResponse(message, data = {}) {
    const response = {
      timestamp: Date.now(),
      source: "codex",
      target: "kimi",
      message: message,
      data: data,
    };

    this.updateSyncFile("context", response);
  }

  updateSyncFile(type, data) {
    const filePath = path.join(this.syncFolder, `${type}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("[Codex] Erro ao atualizar arquivo de sync:", error);
    }
  }

  showSuggestions(suggestions) {
    console.log("Sugestoes do Kimi:");
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion.message}`);
      console.log(`   Sugestao: ${suggestion.suggestion}`);
      console.log(`   Prioridade: ${suggestion.priority}`);
    });
  }

  showNotification(message) {
    console.log(`Notificacao do Kimi: ${message}`);
  }

  sendHeartbeat() {
    const heartbeat = {
      timestamp: Date.now(),
      source: "codex",
      target: "kimi",
      status: "online",
      capabilities: this.config.bridge?.agents?.codex?.capabilities || [],
    };

    this.updateSyncFile("status", heartbeat);

    // Envia heartbeat a cada 30 segundos
    setTimeout(() => this.sendHeartbeat(), 30000);
  }
}

// Instancia a bridge para que funcione em modo standalone
const codexBridge = new CodexSyncBridge();

// Integração com VS Code API (se disponível)
if (typeof vscode !== "undefined") {
  console.log("[Codex] API do VS Code detectada, integrando eventos.");
  // Exemplo de integração com eventos do VS Code
  vscode.workspace.onDidSaveTextDocument((document) => {
    const changes = [
      {
        type: "save",
        file: document.fileName,
        content: document.getText(),
      },
    ];

    codexBridge.sendCodeChanges(changes, document.fileName);
  });
}

module.exports = CodexSyncBridge;
