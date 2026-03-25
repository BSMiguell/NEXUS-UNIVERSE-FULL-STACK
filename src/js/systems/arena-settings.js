// ============================================
// SISTEMA DE CONFIGURAÇÕES DA ARENA 2D
// ============================================

class ArenaSettingsManager {
  constructor(battleSystem) {
    this.battleSystem = battleSystem;
    this.settings = this.loadSettings();
    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.applySettings();
  }

  cacheElements() {
    this.elements = {
      settingsPanel: document.getElementById("arenaSettingsPanel"),
      settingsToggleBtn: document.getElementById("settingsToggleBtn"),
      settingsContent: document.getElementById("settingsContent"),

      // Sliders e controles de Nomes
      nameSizeSlider: document.getElementById("nameSizeSlider"),
      nameSizeValue: document.getElementById("nameSizeValue"),
      nameColorPicker: document.getElementById("nameColorPicker"),
      nameColorValue: document.getElementById("nameColorValue"),
      nameOffsetSlider: document.getElementById("nameOffsetSlider"),
      nameOffsetValue: document.getElementById("nameOffsetValue"),
      nameShadowCheck: document.getElementById("nameShadowCheck"),

      // Controles de Vida
      healthHeightSlider: document.getElementById("healthHeightSlider"),
      healthHeightValue: document.getElementById("healthHeightValue"),
      healthThemeSelect: document.getElementById("healthThemeSelect"),
      healthAnimateCheck: document.getElementById("healthAnimateCheck"),
      healthGlowCheck: document.getElementById("healthGlowCheck"),

      // Controles de Labels
      playerLabelInput: document.getElementById("playerLabelInput"),
      botLabelInput: document.getElementById("botLabelInput"),
      labelVisiblityCheck: document.getElementById("labelVisiblityCheck"),

      // Tabs
      settingsTabs: document.querySelectorAll(".settings-tab-btn"),
      settingsTabContents: document.querySelectorAll(".settings-tab-content"),

      // Ações
      resetSettingsBtn: document.getElementById("resetSettingsBtn"),

      // Labels da arena
      playerHealthLabel: document.getElementById("playerHealthLabel"),
      botHealthLabel: document.getElementById("botHealthLabel"),

      // Barras de vida
      playerHealthFill: document.getElementById("playerHealthFill"),
      botHealthFill: document.getElementById("botHealthFill"),
      healthBars: document.querySelector(".health-bars"),
    };
  }

  setupEventListeners() {
    // Toggle painel
    this.elements.settingsToggleBtn.addEventListener("click", () =>
      this.togglePanel(),
    );

    // Sliders de Nomes
    this.elements.nameSizeSlider.addEventListener("input", (e) =>
      this.updateNameSize(e),
    );
    this.elements.nameColorPicker.addEventListener("change", (e) =>
      this.updateNameColor(e),
    );
    this.elements.nameOffsetSlider.addEventListener("input", (e) =>
      this.updateNameOffset(e),
    );
    this.elements.nameShadowCheck.addEventListener("change", (e) =>
      this.updateNameShadow(e),
    );

    // Controles de Vida
    this.elements.healthHeightSlider.addEventListener("input", (e) =>
      this.updateHealthHeight(e),
    );
    this.elements.healthThemeSelect.addEventListener("change", (e) =>
      this.updateHealthTheme(e),
    );
    this.elements.healthAnimateCheck.addEventListener("change", (e) =>
      this.updateHealthAnimation(e),
    );
    this.elements.healthGlowCheck.addEventListener("change", (e) =>
      this.updateHealthGlow(e),
    );

    // Controles de Labels
    this.elements.playerLabelInput.addEventListener("change", (e) =>
      this.updatePlayerLabel(e),
    );
    this.elements.botLabelInput.addEventListener("change", (e) =>
      this.updateBotLabel(e),
    );
    this.elements.labelVisiblityCheck.addEventListener("change", (e) =>
      this.updateLabelVisibility(e),
    );

    // Tabs
    this.elements.settingsTabs.forEach((tab) => {
      tab.addEventListener("click", (e) =>
        this.switchTab(e.target.closest(".settings-tab-btn")),
      );
    });

    // Reset
    this.elements.resetSettingsBtn.addEventListener("click", () =>
      this.resetToDefault(),
    );

    // Fechar painel ao clicar fora
    document.addEventListener("click", (e) => {
      if (!this.elements.settingsPanel.contains(e.target)) {
        if (this.elements.settingsContent.offsetParent !== null) {
          // Painel está visível
          // não fechar (deixar aberto até clicar no botão)
        }
      }
    });
  }

  togglePanel() {
    const isHidden = this.elements.settingsContent.hasAttribute("hidden");
    if (isHidden) {
      this.elements.settingsContent.removeAttribute("hidden");
      this.elements.settingsToggleBtn.style.background =
        "linear-gradient(135deg, rgba(var(--quantum-primary-rgb), 0.5), rgba(var(--quantum-secondary-rgb), 0.4))";
    } else {
      this.elements.settingsContent.setAttribute("hidden", "");
      this.elements.settingsToggleBtn.style.background =
        "linear-gradient(135deg, rgba(var(--quantum-primary-rgb), 0.2), rgba(var(--quantum-secondary-rgb), 0.2))";
    }
  }

  switchTab(tabBtn) {
    const tabName = tabBtn.dataset.tab;

    // Remove active de todos
    this.elements.settingsTabs.forEach((t) => t.classList.remove("active"));
    this.elements.settingsTabContents.forEach((c) =>
      c.classList.remove("active"),
    );

    // Adiciona active ao clicado
    tabBtn.classList.add("active");
    document
      .querySelector(`.settings-tab-content[data-tab="${tabName}"]`)
      .classList.add("active");
  }

  // ============ NOMES ============
  updateNameSize(e) {
    const size = e.target.value;
    this.settings.name.size = size;
    this.elements.nameSizeValue.textContent = size + "px";
    this.applyNameStyles();
    this.saveSettings();
  }

  updateNameColor(e) {
    const color = e.target.value;
    this.settings.name.color = color;
    this.elements.nameColorValue.textContent = color;
    this.applyNameStyles();
    this.saveSettings();
  }

  updateNameOffset(e) {
    const offset = e.target.value;
    this.settings.name.offset = offset;
    this.elements.nameOffsetValue.textContent = offset + "px";
    this.applyNameStyles();
    this.saveSettings();
  }

  updateNameShadow(e) {
    this.settings.name.shadow = e.target.checked;
    this.applyNameStyles();
    this.saveSettings();
  }

  applyNameStyles() {
    if (this.battleSystem && this.battleSystem.ctx) {
      // Aplicar ao canvas dinamicamente
      this.battleSystem.customNameSettings = {
        size: parseInt(this.settings.name.size),
        color: this.settings.name.color,
        offset: parseInt(this.settings.name.offset),
        shadow: this.settings.name.shadow,
      };
    }
  }

  // ============ VIDA ============
  updateHealthHeight(e) {
    const height = e.target.value;
    this.settings.health.height = height;
    this.elements.healthHeightValue.textContent = height + "px";
    this.applyHealthStyles();
    this.saveSettings();
  }

  updateHealthTheme(e) {
    const theme = e.target.value;
    this.settings.health.theme = theme;
    this.applyHealthTheme(theme);
    this.saveSettings();
  }

  updateHealthAnimation(e) {
    this.settings.health.animate = e.target.checked;
    this.applyHealthStyles();
    this.saveSettings();
  }

  updateHealthGlow(e) {
    this.settings.health.glow = e.target.checked;
    this.applyHealthStyles();
    this.saveSettings();
  }

  applyHealthStyles() {
    if (!this.elements.healthBars) return;

    const height = this.settings.health.height;
    const healthBgs =
      this.elements.healthBars.querySelectorAll(".health-bar-bg");

    healthBgs.forEach((bg) => {
      bg.style.height = height + "px";
    });

    // Aplicar animação
    if (!this.settings.health.animate) {
      this.elements.healthBars.style.animation = "none";
    } else {
      this.elements.healthBars.style.animation = "";
    }

    // Aplicar glow
    const containers = this.elements.healthBars.querySelectorAll(
      ".health-bar-container",
    );
    containers.forEach((container, index) => {
      if (!this.settings.health.glow) {
        container.style.filter = "none";
      } else {
        container.style.filter = "";
      }
    });
  }

  applyHealthTheme(theme) {
    const themes = {
      default: {
        player: "linear-gradient(90deg, #00ff9d 0%, #00ffea 50%, #00aaff 100%)",
        bot: "linear-gradient(90deg, #ff2a6d 0%, #ff4500 50%, #ffaa00 100%)",
      },
      cyan: {
        player: "linear-gradient(90deg, #00d2ff 0%, #00ffff 50%, #00aaff 100%)",
        bot: "linear-gradient(90deg, #ff6b00 0%, #ff8c00 50%, #ffa500 100%)",
      },
      purple: {
        player: "linear-gradient(90deg, #aa00ff 0%, #ff00ff 50%, #ff00aa 100%)",
        bot: "linear-gradient(90deg, #ff1493 0%, #ff69b4 50%, #ffb6c1 100%)",
      },
      yellow: {
        player: "linear-gradient(90deg, #ffff00 0%, #ffaa00 50%, #ffaa00 100%)",
        bot: "linear-gradient(90deg, #ff0000 0%, #ff4500 50%, #ff6347 100%)",
      },
    };

    const themeColors = themes[theme] || themes.default;

    const containers = this.elements.healthBars.querySelectorAll(
      ".health-bar-container",
    );
    containers.forEach((container, index) => {
      const fills = container.querySelectorAll(".health-fill");
      fills.forEach((fill) => {
        fill.style.background =
          index === 0 ? themeColors.player : themeColors.bot;
      });
    });
  }

  // ============ LABELS ============
  updatePlayerLabel(e) {
    const text = e.target.value || "JOGADOR";
    this.settings.labels.player = text;
    this.elements.playerHealthLabel.textContent = text;
    this.saveSettings();
  }

  updateBotLabel(e) {
    const text = e.target.value || "BOT";
    this.settings.labels.bot = text;
    this.elements.botHealthLabel.textContent = text;
    this.saveSettings();
  }

  updateLabelVisibility(e) {
    this.settings.labels.visible = e.target.checked;
    if (this.settings.labels.visible) {
      this.elements.playerHealthLabel.style.display = "";
      this.elements.botHealthLabel.style.display = "";
    } else {
      this.elements.playerHealthLabel.style.display = "none";
      this.elements.botHealthLabel.style.display = "none";
    }
    this.saveSettings();
  }

  // ============ PERSISTÊNCIA ============
  saveSettings() {
    localStorage.setItem("arenaSettings", JSON.stringify(this.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem("arenaSettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Erro ao carregar configurações:", e);
        return this.defaultSettings();
      }
    }
    return this.defaultSettings();
  }

  defaultSettings() {
    return {
      name: {
        size: "14",
        color: "#FFFFFF",
        offset: "-28",
        shadow: true,
      },
      health: {
        height: "32",
        theme: "default",
        animate: true,
        glow: true,
      },
      labels: {
        player: "JOGADOR",
        bot: "BOT",
        visible: true,
      },
    };
  }

  applySettings() {
    // Nomes
    this.elements.nameSizeSlider.value = this.settings.name.size;
    this.elements.nameSizeValue.textContent = this.settings.name.size + "px";
    this.elements.nameColorPicker.value = this.settings.name.color;
    this.elements.nameColorValue.textContent = this.settings.name.color;
    this.elements.nameOffsetSlider.value = this.settings.name.offset;
    this.elements.nameOffsetValue.textContent =
      this.settings.name.offset + "px";
    this.elements.nameShadowCheck.checked = this.settings.name.shadow;

    // Vida
    this.elements.healthHeightSlider.value = this.settings.health.height;
    this.elements.healthHeightValue.textContent =
      this.settings.health.height + "px";
    this.elements.healthThemeSelect.value = this.settings.health.theme;
    this.elements.healthAnimateCheck.checked = this.settings.health.animate;
    this.elements.healthGlowCheck.checked = this.settings.health.glow;

    // Labels
    this.elements.playerLabelInput.value = this.settings.labels.player;
    this.elements.botLabelInput.value = this.settings.labels.bot;
    this.elements.labelVisiblityCheck.checked = this.settings.labels.visible;

    // Aplicar estilos
    this.applyNameStyles();
    this.applyHealthStyles();
    this.applyHealthTheme(this.settings.health.theme);

    this.updatePlayerLabel({ target: { value: this.settings.labels.player } });
    this.updateBotLabel({ target: { value: this.settings.labels.bot } });
    this.updateLabelVisibility({
      target: { checked: this.settings.labels.visible },
    });
  }

  resetToDefault() {
    if (confirm("Deseja restaurar todas as configurações padrão?")) {
      this.settings = this.defaultSettings();
      this.saveSettings();
      this.applySettings();
    }
  }
}
