// ============================================
// SISTEMA DE BATALHA 2D -

class QuantumBattle2DSystem {
  constructor(gallery) {
    this.gallery = gallery;
    this.canvas = null;
    this.ctx = null;
    this.player = null;
    this.bot = null;
    this.keys = {};
    this.gameLoopId = null;
    this.lastAttackTime = 0;
    this.attackCooldown = 500;
    this.battleEnded = false;
    this.battleEndTimer = null;
    this.isPaused = false;
    this.hitStopTimer = 0;
    this.fullscreenActive = false;

    // Parâmetros físicos MELHORADOS
    this.gravity = 0.6; // Queda mais natural
    this.groundY = 340;
    this.canvasWidth = 800;
    this.canvasHeight = 400;
    this.airResistance = 0.98;
    this.lastCanvasClientWidth = 0;
    this.lastCanvasClientHeight = 0;
    this.lastCanvasDpr = 1;

    // Efeitos visuais
    this.effects = [];
    this.particles = [];
    this.backgroundParticles = []; // Novo: Partículas de ambiente
    this.combatLog = []; // Rastreia eventos de combate
    this.comboTracker = {}; // Rastreia combos por jogador

    // Estado da seleção
    this.currentPlayer = 1;
    this.selectedCharacters = {
      player: null,
      bot: null,
    };
    this.selectedSkins = {
      player: null,
      bot: null,
    };
    this.skinLibrary = this.buildSkinLibrary();
    this.skinSelectorState = {
      side: null,
      character: null,
      pendingSkin: null,
    };
    this.selectorInitialLoad = 15;
    this.selectorLoadStep = 10;
    this.selectorVisibleCount = 0;
    this.selectorRenderedCount = 0;
    this.selectorFilteredCharacters = [];

    // Imagens carregadas
    this.playerImage = null;
    this.botImage = null;
    this.imagesLoaded = false;
    this.attackAnimations = {
      player: {
        frames: [],
        frameIndex: 0,
        active: false,
        lastFrameTime: 0,
        frameDuration: 22,
        frameStep: 1,
        effectiveFrameCount: 0,
        playbackDuration: 250,
      },
      bot: {
        frames: [],
        frameIndex: 0,
        active: false,
        lastFrameTime: 0,
        frameDuration: 22,
        frameStep: 1,
        effectiveFrameCount: 0,
        playbackDuration: 250,
      },
    };

    // Para controle de shake de tela
    this.shakeIntensity = 0;
    this.shakeDecay = 0.82;
    this.maxShake = 4.5;
    this.performance = {
      maxParticles: 72,
      maxEffects: 44,
      maxBurstParticles: 2,
      backgroundParticles: 5,
      drawEnergyLines: false,
      drawHitboxes: false, // novo: mostra caixas de colisão para depuração
      simpleFx: true,
    };
    this.effectDensity = 0.24;

    this.init();
  }

  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.setupKeyboard();
  }

  cacheElements() {
    this.elements = {
      page: document.getElementById("quantumBattle2dPage"),
      canvas: document.getElementById("battleCanvas"),
      playerHealthFill: document.getElementById("playerHealthFill"),
      botHealthFill: document.getElementById("botHealthFill"),
      playerHealthLabel: document.getElementById("playerHealthLabel"),
      botHealthLabel: document.getElementById("botHealthLabel"),
      resetBtn: document.getElementById("resetBattle2dBtn"),
      backBtn: document.getElementById("backToGalleryFromBattle2d"),
      backToSelectionBtn: document.getElementById("backToSelectionBtn"),
      battle2dToggle: document.getElementById("battle2dToggle"),
      selectPlayerBtn: document.getElementById("selectPlayerBtn"),
      selectBotBtn: document.getElementById("selectBotBtn"),
      playerSelectedDisplay: document.getElementById("playerSelectedDisplay"),
      botSelectedDisplay: document.getElementById("botSelectedDisplay"),
      startBattle2dBtn: document.getElementById("startBattle2dBtn"),
      battle2dArena: document.getElementById("battle2dArena"),
      battle2dControls: document.getElementById("battle2dControls"),
      battle2dSelectionView: document.getElementById("battle2dSelectionView"),
      battle2dArenaView: document.getElementById("battle2dArenaView"),
      battle2dTitle: document.getElementById("battle2dTitle"),
      battle2dSubtitle: document.getElementById("battle2dSubtitle"),
      battle2dModeChip: document.getElementById("battle2dModeChip"),
      battle2dSelectionSummary: document.getElementById(
        "battle2dSelectionSummary",
      ),
      selectorSearchInput: document.getElementById("characterSelectorSearch"),
      selectorResultCount: document.getElementById("selectorResultCount"),
      skinSelectorModal: document.getElementById("skinSelectorModal"),
      skinSelectorTitle: document.getElementById("skinSelectorTitle"),
      skinSelectorCount: document.getElementById("skinSelectorCount"),
      skinSelectorGrid: document.getElementById("skinSelectorGrid"),
      skinPreviewImage: document.getElementById("skinPreviewImage"),
      skinPreviewName: document.getElementById("skinPreviewName"),
      skinPreviewTag: document.getElementById("skinPreviewTag"),
      skinSelectorClose: document.getElementById("skinSelectorClose"),
      skinSelectorApply: document.getElementById("skinSelectorApply"),
      fullscreenBtn: document.getElementById("toggleFullscreenBtn"),
      pauseModal: document.getElementById("battlePauseModal"),
      resumeBtn: document.getElementById("resumeGameBtn"),
      resetGameBtn: document.getElementById("resetGameBtn"),
      exitGameBtn: document.getElementById("exitGameBtn"),
      pauseFullscreenBtn: document.getElementById("pauseToggleFullscreenBtn"),
      playerEnergyFill: document.getElementById("playerEnergyFill"),
      botEnergyFill: document.getElementById("botEnergyFill"),
    };
  }

  setupEventListeners() {
    if (this.elements.backBtn) {
      this.elements.backBtn.addEventListener("click", () => {
        this.stopGame();
        this.gallery.showGalleryPage();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.backToSelectionBtn) {
      this.elements.backToSelectionBtn.addEventListener("click", () => {
        this.showSelectionScreen();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.resetBtn) {
      this.elements.resetBtn.addEventListener("click", () => {
        this.resetBattle();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.battle2dToggle) {
      this.elements.battle2dToggle.addEventListener("click", (e) => {
        e.preventDefault();
        this.showBattlePage();
      });
    }

    if (this.elements.selectPlayerBtn) {
      this.elements.selectPlayerBtn.addEventListener("click", () => {
        this.currentPlayer = 1;
        this.openCharacterSelector("SELECIONE SEU PERSONAGEM");
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.selectBotBtn) {
      this.elements.selectBotBtn.addEventListener("click", () => {
        this.currentPlayer = 2;
        this.openCharacterSelector("SELECIONE PERSONAGEM DO BOT");
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.startBattle2dBtn) {
      this.elements.startBattle2dBtn.addEventListener("click", () => {
        this.startBattle();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.fullscreenBtn) {
      this.elements.fullscreenBtn.addEventListener("click", () => {
        this.toggleFullscreen();
      });
    }

    if (this.elements.resumeBtn) {
      this.elements.resumeBtn.addEventListener("click", () => {
        this.togglePause();
      });
    }

    if (this.elements.pauseFullscreenBtn) {
      this.elements.pauseFullscreenBtn.addEventListener("click", () => {
        this.toggleFullscreen();
      });
    }

    if (this.elements.resetGameBtn) {
      this.elements.resetGameBtn.addEventListener("click", () => {
        this.togglePause();
        this.resetBattle();
      });
    }

    if (this.elements.exitGameBtn) {
      this.elements.exitGameBtn.addEventListener("click", () => {
        this.togglePause();
        this.stopGame();
        // Sai do Fullscreen ao sair manualmente
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          this.toggleFullscreen();
        }
        this.showSelectionScreen();
      });
    }

    if (this.elements.skinSelectorClose) {
      this.elements.skinSelectorClose.addEventListener("click", () => {
        this.closeSkinSelector();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.skinSelectorApply) {
      this.elements.skinSelectorApply.addEventListener("click", () => {
        this.applySkinSelection();
        this.gallery.audio?.play("click");
      });
    }

    if (this.elements.skinSelectorModal) {
      this.elements.skinSelectorModal.addEventListener("click", (e) => {
        if (e.target === this.elements.skinSelectorModal) {
          this.closeSkinSelector();
        }
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isSkinSelectorOpen()) {
        this.closeSkinSelector();
      }
    });

    // Prevenir rolagem com teclas de controle
    window.addEventListener("keydown", (e) => {
      if (this.isArenaActive()) {
        if (
          [
            "Space",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "KeyW",
            "KeyA",
            "KeyS",
            "KeyD",
            "KeyF",
          ].includes(e.code)
        ) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener("blur", () => {
      this.keys = {};
    });
  }

  setupKeyboard() {
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      // E para Pausar
      if (e.code === "KeyE" && this.isArenaActive()) {
        this.togglePause();
      }

      // Dash (Shift)
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
        this.performDash(this.player);
      }

      // Especial (Q)
      if (e.code === "KeyQ") {
        this.performSpecialAttack(this.player);
      }

      // Depuração: alterna desenho de hitboxes com H
      if (e.code === "KeyH") {
        this.performance.drawHitboxes = !this.performance.drawHitboxes;
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
      if (e.code === "KeyF" && this.player) {
        this.player.attacking = false;
      }
    });
  }

  toggleFullscreen() {
    const arena = this.elements.battle2dArena;
    if (!arena) return;

    const updateIcon = (isFullscreen) => {
      this.fullscreenActive = isFullscreen;
      const iconHtml = isFullscreen
        ? '<i class="fas fa-compress"></i>'
        : '<i class="fas fa-expand"></i>';
      const textPrefix = isFullscreen
        ? "SAIR DA TELA CHEIA"
        : "TELA CHEIA (ON/OFF)";

      if (this.elements.fullscreenBtn) {
        this.elements.fullscreenBtn.innerHTML = iconHtml;
      }
      if (this.elements.pauseFullscreenBtn) {
        this.elements.pauseFullscreenBtn.innerHTML = `${iconHtml} ${textPrefix}`;
      }

      if (isFullscreen) {
        arena.classList.add("is-fullscreen");
      } else {
        arena.classList.remove("is-fullscreen");
      }
    };

    if (
      !document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (arena.requestFullscreen) {
        arena
          .requestFullscreen()
          .then(() => updateIcon(true))
          .catch((err) => console.error(err));
      } else if (arena.webkitRequestFullscreen) {
        arena.webkitRequestFullscreen();
        updateIcon(true);
      } else if (arena.msRequestFullscreen) {
        arena.msRequestFullscreen();
        updateIcon(true);
      }
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => updateIcon(false))
          .catch((err) => console.error(err));
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
        updateIcon(false);
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
        updateIcon(false);
      }
    }

    // Escutar mudança de fullscreen (ex: usuário apertar Esc)
    const onFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      updateIcon(isFullscreen);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("mozfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
  }

  togglePause() {
    if (this.battleEnded) return;

    this.isPaused = !this.isPaused;
    const arenaContainer = this.elements?.battle2dArena?.closest(
      ".battle2d-arena-container"
    );

    if (this.isPaused) {
      if (arenaContainer) {
        arenaContainer.classList.add("is-paused");
      }
      document.body.classList.add("battle2d-paused");
      if (this.elements.pauseModal) {
        this.elements.pauseModal.removeAttribute("hidden");
        this.elements.pauseModal.classList.add("show");
      }
      this.gallery.audio?.play("click");
    } else {
      if (arenaContainer) {
        arenaContainer.classList.remove("is-paused");
      }
      document.body.classList.remove("battle2d-paused");
      if (this.elements.pauseModal) {
        this.elements.pauseModal.setAttribute("hidden", "");
        this.elements.pauseModal.classList.remove("show");
      }
      this.gallery.audio?.play("click");
    }
  }
  openCharacterSelector(title) {
    this.closeSkinSelector();
    const modal = document.getElementById("characterSelectorModal");
    const titleElement = document.getElementById("selectorTitle");
    const grid = document.getElementById("characterSelectorGrid");

    if (!modal || !grid) return;

    titleElement.textContent = title;

    if (this.elements.selectorSearchInput) {
      this.elements.selectorSearchInput.value = "";
    }
    this.setupCharacterSelectorInteractions(grid, modal);
    this.applySelectorFilter("");

    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    const closeBtn = document.getElementById("selectorClose");
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove("show");
        document.body.style.overflow = "";
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("show");
        document.body.style.overflow = "";
      }
    };
  }

  setupCharacterSelectorInteractions(grid, modal) {
    if (!grid || !modal) return;

    grid.onscroll = () => {
      const remaining = grid.scrollHeight - grid.scrollTop - grid.clientHeight;
      if (remaining < 180) {
        this.loadMoreSelectorCharacters(grid, modal);
      }
    };

    if (this.elements.selectorSearchInput) {
      this.elements.selectorSearchInput.oninput = (e) => {
        this.applySelectorFilter(e.target.value);
      };
    }
  }

  matchesSelectorSearch(character, normalizedQuery) {
    if (!normalizedQuery) return true;

    const categoryDisplay = window.categoryNames
      ? window.categoryNames[character.category] || character.category
      : character.category;

    const haystack = [
      character.name || "",
      character.category || "",
      categoryDisplay || "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  }

  applySelectorFilter(query = "") {
    const normalizedQuery = String(query || "")
      .trim()
      .toLowerCase();

    const source = Array.isArray(this.gallery?.charactersData)
      ? this.gallery.charactersData
      : [];

    this.selectorFilteredCharacters = source.filter((character) =>
      this.matchesSelectorSearch(character, normalizedQuery),
    );

    this.selectorVisibleCount = Math.min(
      this.selectorInitialLoad,
      this.selectorFilteredCharacters.length,
    );
    this.selectorRenderedCount = 0;

    const modal = document.getElementById("characterSelectorModal");
    const grid = document.getElementById("characterSelectorGrid");
    if (grid) {
      grid.innerHTML = "";
      grid.scrollTop = 0;
      this.renderCharacterSelector(grid, modal);
    }

    this.updateSelectorCount();
  }

  loadMoreSelectorCharacters(grid, modal) {
    if (this.selectorVisibleCount >= this.selectorFilteredCharacters.length)
      return;

    this.selectorVisibleCount = Math.min(
      this.selectorVisibleCount + this.selectorLoadStep,
      this.selectorFilteredCharacters.length,
    );

    this.renderCharacterSelector(grid, modal);
    this.updateSelectorCount();
  }

  updateSelectorCount() {
    if (!this.elements.selectorResultCount) return;

    const total = this.selectorFilteredCharacters.length;
    const shown = Math.min(this.selectorVisibleCount, total);
    this.elements.selectorResultCount.textContent =
      total > 0 ? `Exibindo ${shown} de ${total}` : "Nenhum personagem";
  }

  buildSkinLibrary() {
    return {
      [this.normalizeCharacterKey("DARIUS")]: [
        {
          label: "Mestre da Enterrada",
          image: "assets/Skins/Darius/Darius-Mestre-da-Enterrada.png",
        },
        {
          label: "Florescer Espiritual",
          image: "assets/Skins/Darius/Darius-Florescer-Espiritual.png",
        },
        {
          label: "Deus Rei",
          image: "assets/Skins/Darius/Deus-Rei-Darius.png",
        },
        {
          label: "Deus Rei Divino",
          image: "assets/Skins/Darius/Deus-Rei-Darius-Divino.png",
        },
      ],
      [this.normalizeCharacterKey("AATROX")]: [
        {
          label: "Mecha",
          image: "assets/Skins/Aatrox/Mech-Aatrox.png",
        },
        {
          label: "Lua Sangrenta de Prestígio",
          image: "assets/Skins/Aatrox/Aatrox-Lua-Sangrenta-de-Prestígio.png",
        },
        {
          label: "DRX",
          image: "assets/Skins/Aatrox/Aatrox-DRX.png",
        },
      ],
      [this.normalizeCharacterKey("GOLDEN SPERM")]: [
        {
          label: "Platinum Sperm",
          image: "assets/Skins/Golden-Sperm/Platinum-Sperm.png",
        },
      ],
    };
  }

  normalizeCharacterKey(value) {
    return String(value || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "");
  }

  resolveImageSrc(path) {
    if (!path) return "";
    const normalizedPath = this.gallery.cache?.normalizePath(path) || path;
    const cachedImg = this.gallery.cache?.imageCache?.get(normalizedPath);
    return cachedImg ? cachedImg.src : path;
  }

  getSkinOptionsForCharacter(character) {
    if (!character) return [];

    const key = this.normalizeCharacterKey(character.name);
    const customSkins = this.skinLibrary[key] || [];
    const options = [
      {
        id: "default",
        label: "Padrão",
        image: character.image,
        isDefault: true,
      },
    ];

    customSkins.forEach((skin, index) => {
      options.push({
        id: skin.id || `skin-${index + 1}`,
        label: skin.label || `Skin ${index + 1}`,
        image: skin.image,
        isDefault: false,
      });
    });

    return options;
  }

  getSelectedSkinForSide(side, character) {
    const options = this.getSkinOptionsForCharacter(character);
    if (!options.length) return null;

    const current = this.selectedSkins?.[side];
    if (current) {
      const stillValid = options.some(
        (option) => option.image === current.image,
      );
      if (stillValid) {
        return current;
      }
    }

    const fallback = options[0];
    this.selectedSkins[side] = fallback;
    return fallback;
  }

  setSelectedSkinForSide(side, skinOption) {
    this.selectedSkins[side] = skinOption;
  }

  getSelectedCharacterImagePath(side) {
    const character = this.selectedCharacters?.[side];
    if (!character) return "";

    const selectedSkin = this.getSelectedSkinForSide(side, character);
    return selectedSkin?.image || character.image;
  }

  isSkinSelectorOpen() {
    return !!this.elements?.skinSelectorModal?.classList.contains("show");
  }

  openSkinSelector(side) {
    const character = this.selectedCharacters?.[side];
    if (!character) return;

    const options = this.getSkinOptionsForCharacter(character);
    if (options.length <= 1) {
      this.gallery.showToast("❌ ESTE PERSONAGEM NÃO TEM SKINS");
      return;
    }

    const selectedSkin = this.getSelectedSkinForSide(side, character);
    this.skinSelectorState = {
      side,
      character,
      pendingSkin: selectedSkin,
    };

    this.renderSkinSelector(options, selectedSkin);

    if (this.elements.skinSelectorModal) {
      this.elements.skinSelectorModal.removeAttribute("hidden");
      this.elements.skinSelectorModal.setAttribute("aria-hidden", "false");
      this.elements.skinSelectorModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }
  }

  closeSkinSelector() {
    if (this.elements.skinSelectorModal) {
      this.elements.skinSelectorModal.classList.remove("show");
      this.elements.skinSelectorModal.setAttribute("aria-hidden", "true");
      this.elements.skinSelectorModal.setAttribute("hidden", "");
    }
    document.body.style.overflow = "";
    this.skinSelectorState = {
      side: null,
      character: null,
      pendingSkin: null,
    };
  }

  renderSkinSelector(options, selectedSkin) {
    const { character } = this.skinSelectorState;
    if (!character) return;

    if (this.elements.skinSelectorTitle) {
      this.elements.skinSelectorTitle.textContent = `SKINS • ${character.name}`;
    }
    if (this.elements.skinSelectorCount) {
      this.elements.skinSelectorCount.textContent = `${options.length} skins`;
    }

    const placeholder = this.gallery.generatePlaceholderSVG
      ? this.gallery.generatePlaceholderSVG(character, true)
      : "";
    const fallbackSrc = this.resolveImageSrc(character.image) || placeholder || "";

    const optionsById = new Map();
    const gridHtml = options
      .map((option) => {
        optionsById.set(option.id, option);
        const optionSrc = this.resolveImageSrc(option.image || character.image);
        const isActive = selectedSkin?.id === option.id;
        const tagLabel = option.isDefault ? "Padrão" : option.tag || "Skin";
        return `
          <button
            type="button"
            class="skin-option ${isActive ? "active" : ""}"
            data-skin-id="${option.id}"
            aria-pressed="${isActive ? "true" : "false"}"
          >
            <div class="skin-option-thumb">
              <img
                src="${optionSrc}"
                alt="${option.label}"
                class="skin-option-image"
                onerror="this.onerror=null; this.src='${fallbackSrc}';"
              />
              <span class="skin-option-tag">${tagLabel}</span>
            </div>
            <span class="skin-option-label">${option.label}</span>
          </button>
        `;
      })
      .join("");

    if (this.elements.skinSelectorGrid) {
      this.elements.skinSelectorGrid.innerHTML = gridHtml;
      const buttons = this.elements.skinSelectorGrid.querySelectorAll(
        ".skin-option",
      );
      buttons.forEach((button) => {
        button.addEventListener("click", () => {
          const skinId = button.dataset.skinId;
          const option = optionsById.get(skinId);
          if (!option) return;

          this.skinSelectorState.pendingSkin = option;
          buttons.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          this.updateSkinPreview(option, fallbackSrc);
        });
      });
    }

    this.updateSkinPreview(selectedSkin, fallbackSrc);
  }

  updateSkinPreview(option, fallbackSrc) {
    if (!option) return;

    if (this.elements.skinPreviewImage) {
      this.elements.skinPreviewImage.src = this.resolveImageSrc(option.image);
      this.elements.skinPreviewImage.onerror = () => {
        this.elements.skinPreviewImage.onerror = null;
        this.elements.skinPreviewImage.src = fallbackSrc || "";
      };
    }

    if (this.elements.skinPreviewName) {
      this.elements.skinPreviewName.textContent = option.label;
    }

    if (this.elements.skinPreviewTag) {
      this.elements.skinPreviewTag.textContent = option.isDefault
        ? "Padrão"
        : option.tag || "Skin";
    }
  }

  applySkinSelection() {
    const { side, character, pendingSkin } = this.skinSelectorState;
    if (!side || !character || !pendingSkin) {
      this.closeSkinSelector();
      return;
    }

    this.setSelectedSkinForSide(side, pendingSkin);
    this.updateSelectedDisplay(side === "player" ? 1 : 2, character);
    this.closeSkinSelector();
  }

  createSelectorCharacterElement(character, modal) {
    const normalizedPath =
      this.gallery.cache?.normalizePath(character.image) || character.image;
    const cachedImg = this.gallery.cache?.imageCache?.get(normalizedPath);
    const imgSrc = cachedImg ? cachedImg.src : character.image;

    const isSelected =
      (this.currentPlayer === 1 &&
        this.selectedCharacters.player?.id === character.id) ||
      (this.currentPlayer === 2 &&
        this.selectedCharacters.bot?.id === character.id);

    const characterEl = document.createElement("div");
    characterEl.className = `selector-character ${isSelected ? "selected" : ""}`;
    characterEl.dataset.id = character.id;

    const categoryDisplay = window.categoryNames
      ? window.categoryNames[character.category] || character.category
      : character.category;

    characterEl.innerHTML = `
                <img src="${imgSrc}" 
                     alt="${character.name}" 
                     class="selector-character-image"
                     onerror="this.onerror=null; this.src='${this.gallery.generatePlaceholderSVG ? this.gallery.generatePlaceholderSVG(character, true) : ""}';">
                <h4 class="selector-character-name">${character.name}</h4>
                <div class="selector-character-category">
                    ${categoryDisplay}
                </div>
                <div class="selector-character-stats">
                    <div class="stat-item">
                        <span class="stat-label">FOR:</span>
                        <span class="stat-value">${character.stats.forca}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">VEL:</span>
                        <span class="stat-value">${character.stats.velocidade}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">DEF:</span>
                        <span class="stat-value">${character.stats.defesa}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">HAB:</span>
                        <span class="stat-value">${character.stats.habilidade || 50}</span>
                    </div>
                </div>
            `;

    characterEl.addEventListener("click", () => {
      this.selectCharacter(character);
      if (modal) modal.classList.remove("show");
      document.body.style.overflow = "";
      this.gallery.audio?.play("click");
    });

    return characterEl;
  }

  renderCharacterSelector(grid, modal) {
    if (!grid) return;

    if (!this.selectorFilteredCharacters.length) {
      if (!grid.querySelector(".selector-empty")) {
        grid.innerHTML = `<div class="selector-empty">Nenhum personagem encontrado.</div>`;
      }
      return;
    }

    const targetCount = Math.min(
      this.selectorVisibleCount,
      this.selectorFilteredCharacters.length,
    );

    for (let i = this.selectorRenderedCount; i < targetCount; i++) {
      const character = this.selectorFilteredCharacters[i];
      grid.appendChild(this.createSelectorCharacterElement(character, modal));
    }

    this.selectorRenderedCount = targetCount;
  }

  selectCharacter(character) {
    if (this.currentPlayer === 1) {
      this.selectedCharacters.player = character;
      this.selectedSkins.player = null;
      this.updateSelectedDisplay(1, character);
    } else {
      this.selectedCharacters.bot = character;
      this.selectedSkins.bot = null;
      this.updateSelectedDisplay(2, character);
    }

    this.closeSkinSelector();

    if (this.elements.startBattle2dBtn) {
      this.elements.startBattle2dBtn.disabled = !(
        this.selectedCharacters.player && this.selectedCharacters.bot
      );
    }
  }

  updateSelectedDisplay(player, character) {
    const display =
      player === 1
        ? this.elements.playerSelectedDisplay
        : this.elements.botSelectedDisplay;
    if (!display || !character) return;

    const sideKey = player === 1 ? "player" : "bot";
    const skinOptions = this.getSkinOptionsForCharacter(character);
    const selectedSkin = this.getSelectedSkinForSide(sideKey, character);
    const hasSkins = skinOptions.length > 1;

    const categoryDisplay = window.categoryNames
      ? window.categoryNames[character.category] || character.category
      : character.category;

    const placeholder = this.gallery.generatePlaceholderSVG
      ? this.gallery.generatePlaceholderSVG(character, true)
      : "";

    const defaultSrc = this.resolveImageSrc(character.image);
    const selectedSkinSrc = this.resolveImageSrc(
      selectedSkin?.image || character.image,
    );
    const fallbackSrc = defaultSrc || placeholder || "";
    const skinLabel = selectedSkin?.label || "Padrão";
    const skinCountLabel = hasSkins
      ? `${skinOptions.length} skins`
      : "Padrão";

    const imageWrapper = hasSkins
      ? `
          <button
            type="button"
            class="skin-trigger"
            aria-label="Escolher skin de ${character.name}"
          >
            <img
              src="${selectedSkinSrc}"
              alt="${character.name}"
              class="selected-mini-image"
              onerror="this.onerror=null; this.src='${fallbackSrc}';"
            />
            <span class="skin-badge">${skinLabel}</span>
            <span class="skin-cta">VER SKINS</span>
          </button>
        `
      : `
          <div class="skin-trigger is-static">
            <img
              src="${selectedSkinSrc}"
              alt="${character.name}"
              class="selected-mini-image"
              onerror="this.onerror=null; this.src='${fallbackSrc}';"
            />
          </div>
        `;

    display.innerHTML = `
            <div class="selected-mini-card">
                ${imageWrapper}
                <div class="selected-mini-info">
                    <strong>${character.name}</strong>
                    <small>${categoryDisplay}</small>
                    ${
                      hasSkins
                        ? `<span class="selected-mini-skin">Skin atual: ${skinLabel}</span>`
                        : `<span class="selected-mini-skin">Skin atual: Padrão</span>`
                    }
                    ${
                      hasSkins
                        ? `<span class="selected-mini-skin-count">${skinCountLabel}</span>`
                        : ""
                    }
                    <div class="selected-mini-stats">
                        <span>FOR ${character.stats.forca}</span>
                        <span>VEL ${character.stats.velocidade}</span>
                        <span>DEF ${character.stats.defesa}</span>
                        <span>HAB ${character.stats.habilidade || 50}</span>
                    </div>
                </div>
            </div>
        `;

    if (hasSkins) {
      const trigger = display.querySelector(".skin-trigger");

      if (trigger) {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openSkinSelector(sideKey);
          this.gallery.audio?.play("click");
        });

        trigger.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.openSkinSelector(sideKey);
            this.gallery.audio?.play("click");
          }
        });
      }
    }

    this.updateBattle2dSummary();
  }

  updateBattle2dSummary() {
    if (!this.elements.battle2dSelectionSummary) return;

    const playerName = this.selectedCharacters.player?.name || "";
    const botName = this.selectedCharacters.bot?.name || "";

    if (playerName && botName) {
      this.elements.battle2dSelectionSummary.textContent = `${playerName} vs ${botName}`;
      return;
    }

    if (playerName || botName) {
      const selectedCount = (playerName ? 1 : 0) + (botName ? 1 : 0);
      const label = playerName
        ? `Jogador: ${playerName}`
        : `Bot: ${botName}`;
      this.elements.battle2dSelectionSummary.textContent = `${selectedCount}/2 selecionados • ${label}`;
      return;
    }

    this.elements.battle2dSelectionSummary.textContent = "0/2 selecionados";
  }

  setBattleMode(mode) {
    const arena = this.elements.battle2dArena;
    if (!arena) return;

    const normalizedMode = mode === "arena" ? "arena" : "selection";
    arena.dataset.mode = normalizedMode;

    const selectionView =
      this.elements.battle2dSelectionView || this.elements.battle2dControls;
    const arenaView = this.elements.battle2dArenaView || arena;

    if (selectionView) {
      if (normalizedMode === "selection") {
        selectionView.removeAttribute("hidden");
        selectionView.style.display = "";
      } else {
        selectionView.setAttribute("hidden", "");
        selectionView.style.display = "none";
      }
    }

    if (arenaView) {
      if (normalizedMode === "arena") {
        arenaView.removeAttribute("hidden");
        arenaView.style.display = "";
      } else {
        arenaView.setAttribute("hidden", "");
        arenaView.style.display = "none";
      }
    }

    if (this.elements.battle2dTitle) {
      this.elements.battle2dTitle.textContent =
        normalizedMode === "arena"
          ? "⚔️ BATALHA 2D: ARENA QUÂNTICA"
          : "⚔️ BATALHA 2D: SELEÇÃO DE PERSONAGENS";
    }

    if (this.elements.battle2dSubtitle) {
      this.elements.battle2dSubtitle.textContent =
        normalizedMode === "arena"
          ? "Use as setas ou WASD para mover, ESPAÇO para pular, e F para atacar"
          : "Selecione seu personagem e o personagem do bot para iniciar a batalha";
    }

    if (this.elements.battle2dModeChip) {
      this.elements.battle2dModeChip.textContent =
        normalizedMode === "arena" ? "ARENA" : "SELEÇÃO";
    }

    this.updateBattle2dSummary();
  }

  isArenaActive() {
    const page = this.elements.page;
    const pageVisible =
      !!page &&
      !page.hasAttribute("hidden") &&
      page.getAttribute("aria-hidden") !== "true";

    return pageVisible && this.elements.battle2dArena?.dataset.mode === "arena";
  }

  showSelectionScreen() {
    this.stopGame();
    this.setBattleMode("selection");
    this.gallery.showToast("🔙 VOLTANDO À SELEÇÃO");
  }

  showBattlePage() {
    const openBattle2dPage = () => {
      this.gallery.state.showFavoritesPage = false;
      this.gallery.state.showModelsPage = false;
      this.gallery.state.showBattlePage = false;
      this.gallery.state.showBattle2dPage = true;

      if (this.gallery.setSectionVisibility) {
        this.gallery.setSectionVisibility(
          this.gallery.elements?.quantumUniverse,
          false,
        );
      } else if (this.gallery.elements?.quantumUniverse) {
        this.gallery.elements.quantumUniverse.style.display = "none";
      }
      const favoritesPage = document.getElementById("quantumFavoritesPage");
      if (this.gallery.setSectionVisibility) {
        this.gallery.setSectionVisibility(favoritesPage, false, {
          activeClass: true,
        });
      } else if (favoritesPage) {
        favoritesPage.style.display = "none";
        favoritesPage.classList.remove("active");
        favoritesPage.setAttribute("hidden", "");
        favoritesPage.setAttribute("aria-hidden", "true");
      }
      const modelsPage = document.getElementById("quantumModelsPage");
      if (this.gallery.setSectionVisibility) {
        this.gallery.setSectionVisibility(modelsPage, false, {
          activeClass: true,
        });
      } else if (modelsPage) {
        modelsPage.style.display = "none";
        modelsPage.classList.remove("active");
        modelsPage.setAttribute("hidden", "");
        modelsPage.setAttribute("aria-hidden", "true");
      }
      const battlePage = document.getElementById("quantumBattlePage");
      if (this.gallery.setSectionVisibility) {
        this.gallery.setSectionVisibility(battlePage, false, {
          activeClass: true,
        });
      } else if (battlePage) {
        battlePage.style.display = "none";
        battlePage.classList.remove("active");
        battlePage.setAttribute("hidden", "");
        battlePage.setAttribute("aria-hidden", "true");
      }

      if (this.elements.page) {
        if (this.gallery.setSectionVisibility) {
          this.gallery.setSectionVisibility(this.elements.page, true, {
            activeClass: true,
          });
        } else {
          this.elements.page.style.display = "block";
          this.elements.page.classList.add("active");
          this.elements.page.removeAttribute("hidden");
          this.elements.page.setAttribute("aria-hidden", "false");
        }
        this.selectedCharacters = { player: null, bot: null };
        this.selectedSkins = { player: null, bot: null };
        this.closeSkinSelector();

        if (this.elements.playerSelectedDisplay) {
          this.elements.playerSelectedDisplay.innerHTML = `
                    <div class="selected-mini-card empty">
                        <i class="fas fa-user-circle"></i>
                        <span>Nenhum personagem selecionado</span>
                    </div>
                `;
        }
        if (this.elements.botSelectedDisplay) {
          this.elements.botSelectedDisplay.innerHTML = `
                    <div class="selected-mini-card empty">
                        <i class="fas fa-robot"></i>
                        <span>Nenhum personagem selecionado</span>
                    </div>
                `;
        }

        this.stopGame();
        this.setBattleMode("selection");
        this.updateBattle2dSummary();
        if (this.elements.startBattle2dBtn) {
          this.elements.startBattle2dBtn.disabled = true;
        }
        setTimeout(() => {
          this.elements.page.style.opacity = "1";
          this.elements.page.style.transform = "translateY(0)";
        }, 50);
      }

      document.title = "⚔️ BATALHA 2D | NEXUS UNIVERSE";
      this.gallery.forceScrollTopImmediate?.();
      this.gallery.audio?.play("click");
      this.gallery.showToast("⚔️ ARENA QUÂNTICA CARREGADA");
    };

    if (typeof this.gallery.runPageTransition === "function") {
      this.gallery.runPageTransition(openBattle2dPage);
    } else {
      this.gallery.preparePageTransition?.();
      openBattle2dPage();
    }
  }

  startBattle() {
    if (!this.selectedCharacters.player || !this.selectedCharacters.bot) {
      this.gallery.showToast("❌ SELECIONE AMBOS OS PERSONAGENS!");
      return;
    }

    this.loadCharacterImages().then(() => {
      this.setBattleMode("arena");
      this.startGame();
      this.gallery.showToast("⚔️ BATALHA INICIADA!");

      // Entra em Fullscreen automaticamente (se suportado e não estiver)
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        this.toggleFullscreen();
      }
    });
  }

  loadImageAsset(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  updateCanvasResolution(force = false) {
    if (!this.canvas || !this.ctx) return;

    const cssWidth = Math.max(
      1,
      Math.round(this.canvas.clientWidth || this.canvasWidth),
    );
    const cssHeight = Math.max(
      1,
      Math.round((cssWidth * this.canvasHeight) / this.canvasWidth),
    );
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

    if (
      !force &&
      cssWidth === this.lastCanvasClientWidth &&
      cssHeight === this.lastCanvasClientHeight &&
      dpr === this.lastCanvasDpr
    ) {
      return;
    }

    this.lastCanvasClientWidth = cssWidth;
    this.lastCanvasClientHeight = cssHeight;
    this.lastCanvasDpr = dpr;

    const renderWidth = Math.max(1, Math.round(cssWidth * dpr));
    const renderHeight = Math.max(1, Math.round(cssHeight * dpr));

    if (this.canvas.width !== renderWidth || this.canvas.height !== renderHeight) {
      this.canvas.width = renderWidth;
      this.canvas.height = renderHeight;
    }

    const scaleX = renderWidth / this.canvasWidth;
    const scaleY = renderHeight / this.canvasHeight;
    this.ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = "high";
  }

  isLokiCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 35 ||
      normalizedName.includes("LOKI") ||
      normalizedImage.includes("loki")
    );
  }

  isMadaraCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 4 ||
      normalizedName.includes("MADARA") ||
      normalizedImage.includes("madara")
    );
  }

  isDariusCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 26 ||
      normalizedName.includes("DARIUS") ||
      normalizedImage.includes("darius")
    );
  }

  isAatroxCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 9 ||
      normalizedName.includes("AATROX") ||
      normalizedImage.includes("aatrox")
    );
  }

  isBattleBeastCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const compactName = normalizedName.replace(/[^A-Z0-9]/g, "");
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 39 ||
      compactName.includes("BATTLEBEAST") ||
      normalizedImage.includes("battle beast") ||
      normalizedImage.includes("battle-beast")
    );
  }

  isAzulaCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 211 || normalizedName.includes("AZULA");
  }

  isMakiCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 69 || normalizedName.includes("MAKI");
  }

  isKaidoCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 78 || normalizedName.includes("KAIDO");
  }

  isHaraldCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 281 || normalizedName.includes("HARALD");
  }

  isBarbaBrancaCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return (
      character.id === 64 ||
      normalizedName.includes("BARBA BRANCA") ||
      normalizedName.includes("WHITEBEARD") ||
      normalizedName.includes("NEWGATE")
    );
  }

  isKhalDrogoCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 256 || normalizedName.includes("KHAL DROGO");
  }

  isGokuCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 2 ||
      normalizedName.includes("GOKU") ||
      normalizedName.includes("SON GOKU") ||
      normalizedImage.includes("goku") ||
      normalizedImage.includes("gokou")
    );
  }

  isJirenCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 47 || normalizedName.includes("JIREN");
  }

  isSolariaCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return character.id === 161 || normalizedName.includes("SOLARIA");
  }

  isSukunaCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 15 ||
      normalizedName.includes("SUKUNA") ||
      normalizedImage.includes("sukuna") ||
      normalizedImage.includes("sukana")
    );
  }

  isNedStarkCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    return (
      character.id === 227 ||
      normalizedName.includes("NED STARK") ||
      normalizedName.includes("EDDARD STARK")
    );
  }

  isLuffyCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 1 ||
      normalizedName.includes("LUFFY") ||
      normalizedImage.includes("luffy")
    );
  }

  isGutsCharacter(character) {
    if (!character) return false;
    const normalizedName = (character.name || "").toUpperCase();
    const normalizedImage = (character.image || "").toLowerCase();
    return (
      character.id === 3 ||
      normalizedName.includes("GUTS") ||
      normalizedImage.includes("guts")
    );
  }

  getLokiAttackFrameCandidates() {
    const candidates = [];

    // Novo padrão (mais fluido): loki_attack_01-00002.png ... 00035.png
    // Mantemos também fallback para padrões antigos.
    candidates.push([
      "assets/animations/Loki/loki_attack_01.png.png",
      "assets/animations/Loki/loki_attack_01.png",
    ]);

    for (let i = 2; i <= 120; i++) {
      const frameNumber = String(i).padStart(5, "0");
      const basePath = `assets/animations/Loki/loki_attack_01-${frameNumber}.png`;
      candidates.push([basePath]);
    }

    for (let i = 1; i <= 60; i++) {
      const frameNumber = String(i).padStart(2, "0");
      const basePath = `assets/animations/Loki/loki_attack_${frameNumber}.png`;
      candidates.push([basePath, `${basePath}.png`]);
    }

    return candidates;
  }

  getMadaraAttackFrameCandidates() {
    const candidates = [];

    for (let i = 1; i <= 140; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Madara/Madarai_attack_-${frameNumber}.png`,
        `assets/animations/Madara/madarai_attack_-${frameNumber}.png`,
        `assets/animations/Madara/madara_attack_-${frameNumber}.png`,
      ]);
    }

    return candidates;
  }

  getAatroxAttackFrameCandidates() {
    const candidates = [];

    for (let i = 1; i <= 140; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Aatrox/Aatroxi_attack_-${frameNumber}.png`,
        `assets/animations/Aatrox/aatroxi_attack_-${frameNumber}.png`,
        `assets/animations/Aatrox/aatrox_attack_-${frameNumber}.png`,
      ]);
    }

    return candidates;
  }

  getMechAatroxAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 35; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations-Skins/Mech-Aatrox/Mech-Aatrox-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getPrestigeBloodMoonAatroxAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 34; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations-Skins/Aatrox-Lua-Sangrenta-de-Prestígio/Aatrox-Lua-Sangrenta-de-Prestígio-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getDrxAatroxAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 34; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations-Skins/Aatrox-DRX/Aatrox-DRX-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getDariusAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 35; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Darius/Darius-${frameNumber}.png`]);
    }
    return candidates;
  }

  getBattleBeastAttackFrameCandidates() {
    const candidates = [];

    for (let i = 1; i <= 180; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Battl- Beast/Battl- Beast-${frameNumber}.png`,
        `assets/animations/Battl- Beast/Battl-Beast-${frameNumber}.png`,
        `assets/animations/Battl- Beast/Battle Beast-${frameNumber}.png`,
        `assets/animations/Battl- Beast/battl- beast-${frameNumber}.png`,
      ]);
    }

    return candidates;
  }

  getAzulaAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Azula/Azula-${frameNumber}.png`]);
    }
    return candidates;
  }

  getMakiAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Maki/Maki-${frameNumber}.png`]);
    }
    return candidates;
  }

  getKaidoAttackFrameCandidates() {
    const candidates = [];
    for (let i = 2; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Kaido/Kaido-${frameNumber}.png`]);
    }
    return candidates;
  }

  getGokuAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Goku/Goku-${frameNumber}.png`]);
    }
    return candidates;
  }

  getLuffyAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Luffy/Luffy-${frameNumber}.png`]);
    }
    return candidates;
  }

  getGutsAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Guts/Guts-${frameNumber}.png`]);
    }
    return candidates;
  }

  getHaraldAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/harald/harald-${frameNumber}.png`,
        `assets/animations/HARALD/harald-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getBarbaBrancaAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Barba-Branca/Barba-Branca-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getKhalDrogoAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Khal-Drogo/KHAL DROGO-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  getJirenAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Jirem/Jirem-${frameNumber}.png`]);
    }
    return candidates;
  }

  getSolariaAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Solaria/Solaria-${frameNumber}.png`]);
    }
    return candidates;
  }

  getSukunaAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([`assets/animations/Sukuna/Sukuna-${frameNumber}.png`]);
    }
    return candidates;
  }

  getNedStarkAttackFrameCandidates() {
    const candidates = [];
    for (let i = 1; i <= 40; i++) {
      const frameNumber = String(i).padStart(5, "0");
      candidates.push([
        `assets/animations/Ned-Stark/Ned-Stark-${frameNumber}.png`,
      ]);
    }
    return candidates;
  }

  isMechAatroxSkin(character, selectedSkin) {
    if (!character || !selectedSkin) return false;
    if (!this.isAatroxCharacter(character)) return false;

    const skinImage = (selectedSkin.image || "").toLowerCase();
    const skinLabel = (selectedSkin.label || "").toLowerCase();
    return skinImage.includes("mech-aatrox") || skinLabel.includes("mecha");
  }

  isPrestigeBloodMoonAatroxSkin(character, selectedSkin) {
    if (!character || !selectedSkin) return false;
    if (!this.isAatroxCharacter(character)) return false;

    const skinImage = (selectedSkin.image || "").toLowerCase();
    const skinLabel = (selectedSkin.label || "").toLowerCase();
    return (
      skinImage.includes("lua-sangrenta") ||
      skinImage.includes("prest") ||
      skinLabel.includes("lua sangrenta") ||
      skinLabel.includes("prest")
    );
  }

  isDrxAatroxSkin(character, selectedSkin) {
    if (!character || !selectedSkin) return false;
    if (!this.isAatroxCharacter(character)) return false;

    const skinImage = (selectedSkin.image || "").toLowerCase();
    const skinLabel = (selectedSkin.label || "").toLowerCase();
    return skinImage.includes("drx") || skinLabel.includes("drx");
  }

  getSkinSpecificAttackFrameCandidates(character, sideOverride = null) {
    if (!character) return null;
    const side =
      sideOverride ||
      (character === this.selectedCharacters?.player
        ? "player"
        : character === this.selectedCharacters?.bot
          ? "bot"
          : null);
    if (!side) return null;

    const selectedSkin = this.getSelectedSkinForSide(side, character);
    if (this.isMechAatroxSkin(character, selectedSkin)) {
      return this.getMechAatroxAttackFrameCandidates();
    }
    if (this.isPrestigeBloodMoonAatroxSkin(character, selectedSkin)) {
      return this.getPrestigeBloodMoonAatroxAttackFrameCandidates();
    }
    if (this.isDrxAatroxSkin(character, selectedSkin)) {
      return this.getDrxAatroxAttackFrameCandidates();
    }

    return null;
  }

  async loadAttackFramesForCharacter(character, sideOverride = null) {
    let frameCandidates = [];

    const skinSpecificCandidates =
      this.getSkinSpecificAttackFrameCandidates(character, sideOverride);
    if (skinSpecificCandidates && skinSpecificCandidates.length) {
      frameCandidates = skinSpecificCandidates;
    } else if (this.isLokiCharacter(character)) {
      frameCandidates = this.getLokiAttackFrameCandidates();
    } else if (this.isMadaraCharacter(character)) {
      frameCandidates = this.getMadaraAttackFrameCandidates();
    } else if (this.isDariusCharacter(character)) {
      frameCandidates = this.getDariusAttackFrameCandidates();
    } else if (this.isAatroxCharacter(character)) {
      frameCandidates = this.getAatroxAttackFrameCandidates();
    } else if (this.isBattleBeastCharacter(character)) {
      frameCandidates = this.getBattleBeastAttackFrameCandidates();
    } else if (this.isAzulaCharacter(character)) {
      frameCandidates = this.getAzulaAttackFrameCandidates();
    } else if (this.isMakiCharacter(character)) {
      frameCandidates = this.getMakiAttackFrameCandidates();
    } else if (this.isKaidoCharacter(character)) {
      frameCandidates = this.getKaidoAttackFrameCandidates();
    } else if (this.isGokuCharacter(character)) {
      frameCandidates = this.getGokuAttackFrameCandidates();
    } else if (this.isLuffyCharacter(character)) {
      frameCandidates = this.getLuffyAttackFrameCandidates();
    } else if (this.isGutsCharacter(character)) {
      frameCandidates = this.getGutsAttackFrameCandidates();
    } else if (this.isHaraldCharacter(character)) {
      frameCandidates = this.getHaraldAttackFrameCandidates();
    } else if (this.isBarbaBrancaCharacter(character)) {
      frameCandidates = this.getBarbaBrancaAttackFrameCandidates();
    } else if (this.isKhalDrogoCharacter(character)) {
      frameCandidates = this.getKhalDrogoAttackFrameCandidates();
    } else if (this.isJirenCharacter(character)) {
      frameCandidates = this.getJirenAttackFrameCandidates();
    } else if (this.isSolariaCharacter(character)) {
      frameCandidates = this.getSolariaAttackFrameCandidates();
    } else if (this.isSukunaCharacter(character)) {
      frameCandidates = this.getSukunaAttackFrameCandidates();
    } else if (this.isNedStarkCharacter(character)) {
      frameCandidates = this.getNedStarkAttackFrameCandidates();
    } else {
      return [];
    }

    const frames = [];
    let consecutiveMisses = 0;

    for (const options of frameCandidates) {
      let loaded = false;
      for (const src of options) {
        try {
          const img = await this.loadImageAsset(src);
          frames.push(img);
          loaded = true;
          break;
        } catch {
          // tenta caminho alternativo do mesmo frame
        }
      }

      if (!loaded) {
        consecutiveMisses++;
        if (frames.length > 0 && consecutiveMisses >= 6) {
          break;
        }
      } else {
        consecutiveMisses = 0;
      }
    }

    return frames;
  }

  resetAttackAnimationState() {
    this.attackAnimations.player.active = false;
    this.attackAnimations.player.frameIndex = 0;
    this.attackAnimations.player.lastFrameTime = 0;
    this.attackAnimations.player.frameStep = 1;
    this.attackAnimations.player.effectiveFrameCount = 0;
    this.attackAnimations.player.playbackDuration = 250;
    this.attackAnimations.bot.active = false;
    this.attackAnimations.bot.frameIndex = 0;
    this.attackAnimations.bot.lastFrameTime = 0;
    this.attackAnimations.bot.frameStep = 1;
    this.attackAnimations.bot.effectiveFrameCount = 0;
    this.attackAnimations.bot.playbackDuration = 250;
  }

  getAnimationRole(char) {
    if (!char) return null;
    if (char === this.player) return "player";
    if (char === this.bot) return "bot";
    return null;
  }

  getAttackPlaybackConfig(frameCount) {
    const totalFrames = Math.max(1, frameCount || 1);

    // Mantem o golpe rapido mesmo com muitos frames.
    const targetDuration =
      totalFrames > 90
        ? 380
        : totalFrames > 60
          ? 420
          : totalFrames > 36
            ? 460
            : 500;
    const maxRenderedFrames =
      totalFrames > 90 ? 24 : totalFrames > 60 ? 28 : 32;
    const frameStep = Math.max(1, Math.ceil(totalFrames / maxRenderedFrames));
    const effectiveFrameCount = Math.ceil(totalFrames / frameStep);
    const frameDuration = Math.max(
      12,
      Math.min(20, Math.round(targetDuration / effectiveFrameCount)),
    );

    return {
      frameStep,
      effectiveFrameCount,
      frameDuration,
      playbackDuration: effectiveFrameCount * frameDuration,
    };
  }

  getAttackExecutionDuration(char) {
    const role = this.getAnimationRole(char);
    const baseCooldown =
      char?.baseAttackCooldown || char?.attackCooldown || 250;
    if (!role) return baseCooldown;

    const animation = this.attackAnimations[role];
    if (!animation || !animation.frames.length) return baseCooldown;

    const playback = this.getAttackPlaybackConfig(animation.frames.length);
    animation.frameDuration = playback.frameDuration;
    animation.frameStep = playback.frameStep;
    animation.effectiveFrameCount = playback.effectiveFrameCount;
    animation.playbackDuration = playback.playbackDuration;
    return playback.playbackDuration;
  }

  beginAttack(char) {
    if (!char) return;
    const attackDuration = this.getAttackExecutionDuration(char);
    this.startAttackAnimation(char);

    char.attacking = true;
    char.lastAttack = Date.now();
    char.attackCooldown = attackDuration;
    char.cooldownTimer = attackDuration;
    char.currentAttackDuration = attackDuration;
    char.attackHitRegistered = false;
  }

  startAttackAnimation(char) {
    const role = this.getAnimationRole(char);
    if (!role) return;
    const animation = this.attackAnimations[role];
    if (!animation.frames.length) return;

    if (!animation.playbackDuration || animation.playbackDuration <= 0) {
      this.getAttackExecutionDuration(char);
    }
    animation.active = true;
    animation.frameIndex = 0;
    animation.lastFrameTime = 0;
  }

  getAnimatedAttackFrame(char) {
    const role = this.getAnimationRole(char);
    if (!role) return null;

    const animation = this.attackAnimations[role];
    if (!animation.active || !animation.frames.length) return null;

    const now = performance.now();
    if (!animation.lastFrameTime) {
      animation.lastFrameTime = now;
    } else if (now - animation.lastFrameTime >= animation.frameDuration) {
      animation.frameIndex += animation.frameStep || 1;
      animation.lastFrameTime = now;

      if (animation.frameIndex >= animation.frames.length) {
        animation.active = false;
        animation.frameIndex = 0;
        animation.lastFrameTime = 0;
        return null;
      }
    }

    return animation.frames[animation.frameIndex] || null;
  }

  async loadCharacterImages() {
    this.imagesLoaded = false;
    this.attackAnimations.player.frames = [];
    this.attackAnimations.bot.frames = [];
    this.resetAttackAnimationState();

    try {
      const playerImagePath = this.getSelectedCharacterImagePath("player");
      const botImagePath = this.getSelectedCharacterImagePath("bot");

      const playerSrc = this.gallery.cache?.imageCache?.has(
        this.gallery.cache.normalizePath(playerImagePath),
      )
        ? this.gallery.cache.imageCache.get(
            this.gallery.cache.normalizePath(playerImagePath),
          ).src
        : playerImagePath;

      const botSrc = this.gallery.cache?.imageCache?.has(
        this.gallery.cache.normalizePath(botImagePath),
      )
        ? this.gallery.cache.imageCache.get(
            this.gallery.cache.normalizePath(botImagePath),
          ).src
        : botImagePath;

      [this.playerImage, this.botImage] = await Promise.all([
        this.loadImageAsset(playerSrc),
        this.loadImageAsset(botSrc),
      ]);

      const [playerAttackFrames, botAttackFrames] = await Promise.all([
        this.loadAttackFramesForCharacter(this.selectedCharacters.player, "player"),
        this.loadAttackFramesForCharacter(this.selectedCharacters.bot, "bot"),
      ]);
      this.attackAnimations.player.frames = playerAttackFrames;
      this.attackAnimations.bot.frames = botAttackFrames;

      this.imagesLoaded = true;
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
      this.gallery.showToast("❌ ERRO AO CARREGAR IMAGENS");
    }
  }

  startGame() {
    this.stopGame();
    this.battleEnded = false;
    this.shakeIntensity = 0;
    this.effectDensity = this.isLowPerformanceDevice() ? 0.2 : 0.24;
    this.performance.backgroundParticles = this.isLowPerformanceDevice()
      ? 3
      : 5;
    this.performance.maxParticles = this.isLowPerformanceDevice() ? 52 : 72;
    this.performance.maxEffects = this.isLowPerformanceDevice() ? 30 : 44;
    this.performance.drawEnergyLines = false;
    this.performance.simpleFx = true;
    const characterWidth = this.isLowPerformanceDevice() ? 120 : 140;
    const playerSpawnX = 90;
    const botSpawnX = this.canvasWidth - playerSpawnX - characterWidth;

    // Cria os personagens com stats
    this.player = new BattleCharacter(
      this.selectedCharacters.player,
      playerSpawnX,
      this.groundY,
      characterWidth,
      100,
      true,
    );
    this.bot = new BattleCharacter(
      this.selectedCharacters.bot,
      botSpawnX,
      this.groundY,
      characterWidth,
      100,
      false,
    );

    this.applyStatsFromCharacter(
      this.player,
      this.selectedCharacters.player.stats,
    );
    this.applyStatsFromCharacter(this.bot, this.selectedCharacters.bot.stats);

    // Ajuste de dificuldade dinâmica do bot
    this.adjustBotDifficulty();

    this.canvas = this.elements.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    this.updateCanvasResolution(true);

    this.keys = {};

    if (this.elements.playerHealthLabel) {
      this.elements.playerHealthLabel.textContent =
        this.selectedCharacters.player.name;
    }
    if (this.elements.botHealthLabel) {
      this.elements.botHealthLabel.textContent =
        this.selectedCharacters.bot.name;
    }

    // Inicializar o gerenciador de configurações da arena
    if (!this.settingsManager) {
      this.settingsManager = new ArenaSettingsManager(this);
    }

    // Novo: Gerar partículas de fundo para ambiente
    this.generateBackgroundParticles();

    this.gameLoop();
  }

  // Novo: Gera partículas de fundo/estrelas
  generateBackgroundParticles() {
    this.backgroundParticles = [];
    for (let i = 0; i < this.performance.backgroundParticles; i++) {
      this.backgroundParticles.push({
        x: Math.random() * this.canvasWidth,
        y: Math.random() * this.canvasHeight,
        radius: Math.random() * 1.2 + 0.3,
        opacity: Math.random() * 0.35 + 0.2,
        speed: Math.random() * 0.3 + 0.1,
        color: Math.random() > 0.5 ? "#00ffea" : "#ff2a6d",
      });
    }
  }

  isLowPerformanceDevice() {
    if (typeof window === "undefined") return false;
    const lowCpu =
      typeof navigator !== "undefined" &&
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 6;
    const lowMemory =
      typeof navigator !== "undefined" &&
      navigator.deviceMemory &&
      navigator.deviceMemory <= 4;
    return window.innerWidth <= 768 || lowCpu || lowMemory;
  }

  getCharCenterX(char) {
    return char.x + char.width / 2;
  }

  getCharTopY(char) {
    return char.y - char.height;
  }

  getCharCenterY(char) {
    return this.getCharTopY(char) + char.height / 2;
  }

  adjustBotDifficulty() {
    // Comparar stats e ajustar IA do bot se necessário
    const playerStats = this.selectedCharacters.player.stats;
    const botStats = this.selectedCharacters.bot.stats;

    const playerTotal =
      (playerStats.forca || 50) +
      (playerStats.velocidade || 50) +
      (playerStats.defesa || 50) +
      (playerStats.habilidade || 50);
    const botTotal =
      (botStats.forca || 50) +
      (botStats.velocidade || 50) +
      (botStats.defesa || 50) +
      (botStats.habilidade || 50);

    // Se o bot é muito mais fraco, aumentar stamina e critchance
    if (botTotal < playerTotal * 0.8) {
      this.bot.maxStamina *= 1.2;
      this.bot.stamina = this.bot.maxStamina;
      this.bot.staminaRegen *= 1.15;
      this.bot.critChance *= 1.3;
      this.gallery.showToast("⚠️ IA AUMENTOU DE DIFICULDADE");
    } else if (botTotal > playerTotal * 1.2) {
      // Se o bot é muito mais forte, reduzir um pouco
      this.bot.maxStamina *= 0.85;
      this.bot.stamina = this.bot.maxStamina;
      this.bot.staminaRegen *= 0.9;
    }
  }

  applyStatsFromCharacter(char, stats) {
    if (!stats) return;

    // Velocidade melhorada (sistema mais responsivo)
    const velocidade = stats.velocidade || 50;
    char.speed = 4 + (velocidade / 100) * 3; // 4-7 px/frame
    char.accel = 0.8 + (velocidade / 100) * 0.4; // 0.8-1.2

    // Pulo melhorado (maior controle)
    const forca = stats.forca || 50;
    char.jumpForce = -8.5 - (forca / 100) * 1.5; // -8.5 a -10
    char.jumpHeight = Math.abs(char.jumpForce); // Altura máxima do pulo

    // Ataque melhorado
    char.attackDamage = 10 + (forca / 100) * 5; // 10-15 dano base

    // Habilidade afeta velocidade de ataque e crítico
    const hab = stats.habilidade || 50;
    char.attackCooldown = Math.max(250, 600 - hab * 4); // 250-600ms
    char.baseAttackCooldown = char.attackCooldown;
    char.critChance = 0.05 + (hab / 100) * 0.25; // 5%-30% crítico
    char.critMultiplier = 1.8 + (hab / 100) * 0.4; // 1.8-2.2x dano crítico

    // Alcance de ataque com habilidade
    const defesa = stats.defesa || 50;
    char.attackRange = 150 + (hab / 100) * 30; // 150-180 px
    char.defense = (defesa / 100) * 40; // 0-40% redução de dano

    // Stamina system (novo!)
    char.maxStamina = 100 + (velocidade / 100) * 50;
    char.stamina = char.maxStamina;
    char.staminaRegen = 0.8 + (velocidade / 100) * 0.4;
    char.staminaCost = 20 + 10 * (1 - velocidade / 100);

    // Atributos básicos
    char.friction = 0.82;
    char.maxHealth = 100;
    char.health = 100;

    // Novos atributos 13/10
    char.maxEnergy = 100;
    char.energy = 0;
    char.energyRegen = 0.15 + (hab / 100) * 0.1;
    char.dashCost = 30;
    char.specialCost = 60;

    // Combo system
    char.comboCount = 0;
    char.lastComboTime = 0;
    char.comboTimeout = 800; // ms
    char.comboMultiplier = 1;
  }

  stopGame() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
    if (this.battleEndTimer) {
      clearTimeout(this.battleEndTimer);
      this.battleEndTimer = null;
    }
    this.effects = [];
    this.particles = [];
    this.backgroundParticles = [];
    this.resetAttackAnimationState();
  }

  resetBattle() {
    this.stopGame();
    this.startGame();
    this.gallery.showToast("🔄 BATALHA REINICIADA");
  }

  gameLoop() {
    if (!this.battleEnded && !this.isPaused) {
      if (this.hitStopTimer > 0) {
        this.hitStopTimer -= 16;
      } else {
        this.update();
      }
    }
    this.draw();
    this.gameLoopId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.applyPhysics(this.player);
    this.applyPhysics(this.bot);

    // nova verificação de colisão física entre personagens
    this.resolveCharacterCollision();

    this.handlePlayerControls();
    this.botAI();
    this.checkAttacks();
    this.updateEffects();

    // Atualiza cooldown timers e regeneração
    if (this.player.cooldownTimer > 0) this.player.cooldownTimer -= 16;
    if (this.bot.cooldownTimer > 0) this.bot.cooldownTimer -= 16;

    if (this.player.dashCooldown > 0) this.player.dashCooldown -= 16;
    if (this.bot.dashCooldown > 0) this.bot.dashCooldown -= 16;

    // Regeneração de Stamina e Energy
    if (this.player.stamina < this.player.maxStamina) {
      this.player.stamina += this.player.staminaRegen;
    }
    if (this.player.energy < this.player.maxEnergy) {
      this.player.energy += this.player.energyRegen;
    }

    if (this.bot.stamina < this.bot.maxStamina) {
      this.bot.stamina += this.bot.staminaRegen;
    }
    if (this.bot.energy < this.bot.maxEnergy) {
      this.bot.energy += this.bot.energyRegen;
    }

    // Handle Dash duration
    if (this.player.isDashing) {
      this.player.dashTimer -= 16;
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
        this.player.vx *= 0.5;
      }
    }
    if (this.bot.isDashing) {
      this.bot.dashTimer -= 16;
      if (this.bot.dashTimer <= 0) {
        this.bot.isDashing = false;
        this.bot.vx *= 0.5;
      }
    }

    // Mantém estado de ataque ativo apenas durante a execução do golpe/animação.
    if (
      this.player.attacking &&
      Date.now() - this.player.lastAttack >=
        (this.player.currentAttackDuration || this.player.attackCooldown || 250)
    ) {
      this.player.attacking = false;
    }
    if (
      this.bot.attacking &&
      Date.now() - this.bot.lastAttack >=
        (this.bot.currentAttackDuration || this.bot.attackCooldown || 250)
    ) {
      this.bot.attacking = false;
    }

    // Resetar combos se expirados
    if (
      this.player.comboCount > 0 &&
      Date.now() - this.player.lastComboTime > this.player.comboTimeout
    ) {
      this.player.comboCount = 0;
      this.player.comboMultiplier = 1;
    }
    if (
      this.bot.comboCount > 0 &&
      Date.now() - this.bot.lastComboTime > this.bot.comboTimeout
    ) {
      this.bot.comboCount = 0;
      this.bot.comboMultiplier = 1;
    }

    // Verificar fim de batalha
    if (this.player.health <= 0 || this.bot.health <= 0) {
      this.endBattle();
    }

    this.updateHealthBars();

    // Shake decai
    this.shakeIntensity *= this.shakeDecay;
  }

  applyPhysics(char) {
    // Aplicar gravidade
    char.vy += this.gravity;

    // Aplicar resistência do ar quando em ar
    if (char.isJumping) {
      char.vy *= this.airResistance;
    }

    // Atualizar posição vertical
    char.y += char.vy;

    // Colisão com o chão
    if (char.y >= this.groundY) {
      char.y = this.groundY;
      char.vy = 0;
      char.isJumping = false;
    }

    // Movimento horizontal com fricção
    char.x += char.vx;
    char.vx *= char.friction;

    // Limites do mapa (com um pouco mais de espaço)
    char.x = Math.max(15, Math.min(this.canvasWidth - 15 - char.width, char.x));
  }

  // Resolve colisões físicas entre player e bot evitando que um atravesse o outro
  resolveCharacterCollision() {
    const p = this.player;
    const b = this.bot;
    if (!p || !b) return;

    // só faz sentido enquanto ambos estão vivos
    if (p.health <= 0 || b.health <= 0) return;

    // verificação de sobreposição horizontal + vertical para evitar bloqueio indevido ao pular
    const px1 = p.x;
    const px2 = p.x + p.width;
    const bx1 = b.x;
    const bx2 = b.x + b.width;
    const py1 = p.y;
    const py2 = p.y + p.height;
    const by1 = b.y;
    const by2 = b.y + b.height;

    // somente colidir se também houver sobreposição vertical
    if (px2 > bx1 && px1 < bx2 && py2 > by1 && py1 < by2) {
      let overlap = 0;
      if (px1 < bx1) {
        overlap = px2 - bx1;
        const half = overlap / 2;
        p.x -= half;
        b.x += half;
      } else {
        overlap = bx2 - px1;
        const half = overlap / 2;
        b.x -= half;
        p.x += half;
      }

      // anula a velocidade horizontal para evitar que continuem a se empurrar
      p.vx = 0;
      b.vx = 0;

      // garante que não saiam dos limites após correção
      p.x = Math.max(15, Math.min(this.canvasWidth - 15 - p.width, p.x));
      b.x = Math.max(15, Math.min(this.canvasWidth - 15 - b.width, b.x));
    }
  }

  handlePlayerControls() {
    if (this.player.health <= 0) return;

    const accel = this.player.accel || 0.8;
    const maxSpeed = this.player.speed || 4;

    // Movimento com aceleração (mais responsivo)
    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) {
      this.player.vx = Math.max(this.player.vx - accel, -maxSpeed);
      this.player.direction = -1;
    } else if (this.keys["ArrowRight"] || this.keys["KeyD"]) {
      this.player.vx = Math.min(this.player.vx + accel, maxSpeed);
      this.player.direction = 1;
    } else {
      this.player.vx *= this.player.friction || 0.82;
    }

    // Pulo com altura controlada (melhorado)
    if (
      (this.keys["Space"] || this.keys["ArrowUp"] || this.keys["KeyW"]) &&
      !this.player.isJumping
    ) {
      this.player.vy = this.player.jumpForce || -8.5;
      this.player.isJumping = true;
      this.createDustEffect(this.getCharCenterX(this.player), this.groundY);
      this.gallery.audio?.play("jump");
    }

    // Regeneração de stamina
    if (this.player.stamina < this.player.maxStamina) {
      this.player.stamina = Math.min(
        this.player.maxStamina,
        this.player.stamina + this.player.staminaRegen,
      );
    }

    // Ataque com cooldown e stamina (melhorado)
    if (
      this.keys["KeyF"] &&
      !this.player.attackPressed &&
      Date.now() - this.player.lastAttack >
        (this.player.attackCooldown || 250) &&
      this.player.stamina >= this.player.staminaCost
    ) {
      this.player.attackPressed = true;
      this.player.stamina -= this.player.staminaCost;
      this.beginAttack(this.player);

      // Adiciona combo
      const now = Date.now();
      if (now - this.player.lastComboTime < this.player.comboTimeout) {
        this.player.comboCount++;
      } else {
        this.player.comboCount = 1;
      }
      this.player.lastComboTime = now;
      this.player.comboMultiplier = 1 + (this.player.comboCount - 1) * 0.15; // +15% por hit

      this.createAttackEffect(this.player);
      this.gallery.audio?.play("attack");

      if (!this.performance.simpleFx && this.player.comboCount > 1) {
        this.createFloatingText(
          this.getCharCenterX(this.player),
          this.getCharTopY(this.player) - 20,
          `COMBO x${this.player.comboCount}`,
          "#ffdd00",
        );
      }
    } else if (!this.keys["KeyF"]) {
      this.player.attackPressed = false;
    }
  }

  botAI() {
    if (this.bot.health <= 0) return;

    const distance = this.player.x - this.bot.x;
    const absDist = Math.abs(distance);
    const heightDiff = this.player.y - this.bot.y;
    const botHealthPercent = this.bot.health / this.bot.maxHealth;

    // IA inteligente e dinâmica

    // 1. Regeneração de stamina
    if (this.bot.stamina < this.bot.maxStamina) {
      this.bot.stamina = Math.min(
        this.bot.maxStamina,
        this.bot.stamina + this.bot.staminaRegen,
      );
    }

    // 2. Comportamento defensivo quando com pouca vida
    if (botHealthPercent < 0.25) {
      // Foge agressivamente
      if (distance > 0) {
        this.bot.vx = Math.max(
          this.bot.vx - (this.bot.accel || 0.8) * 1.8,
          -(this.bot.speed || 4),
        );
      } else {
        this.bot.vx = Math.min(
          this.bot.vx + (this.bot.accel || 0.8) * 1.8,
          this.bot.speed || 4,
        );
      }
      // Tenta pular para escapar
      if (!this.bot.isJumping && Math.random() < 0.1) {
        this.bot.vy = this.bot.jumpForce || -8.5;
        this.bot.isJumping = true;
      }
    }
    // 3. Nível médio de vida - atitute balanceada
    else if (botHealthPercent > 0.5) {
      if (absDist > 120) {
        // Perseguição agressiva
        if (distance > 0) {
          this.bot.vx = Math.min(
            this.bot.vx + (this.bot.accel || 0.8) * 1.2,
            this.bot.speed || 4,
          );
          this.bot.direction = 1;
        } else {
          this.bot.vx = Math.max(
            this.bot.vx - (this.bot.accel || 0.8) * 1.2,
            -(this.bot.speed || 4),
          );
          this.bot.direction = -1;
        }
      } else if (absDist > 80) {
        // Aproximação estratégica
        if (distance > 0) {
          this.bot.vx = Math.min(
            this.bot.vx + (this.bot.accel || 0.8),
            this.bot.speed || 4,
          );
          this.bot.direction = 1;
        } else {
          this.bot.vx = Math.max(
            this.bot.vx - (this.bot.accel || 0.8),
            -(this.bot.speed || 4),
          );
          this.bot.direction = -1;
        }
      } else {
        // Mantém posição
        this.bot.vx *= 0.9;
      }
    }
    // 4. Vida crítica - movimento mais lento
    else {
      if (absDist > 100) {
        // Perseguição lenta
        if (distance > 0) {
          this.bot.vx = Math.min(
            this.bot.vx + (this.bot.accel || 0.8) * 0.8,
            this.bot.speed || 4,
          );
        } else {
          this.bot.vx = Math.max(
            this.bot.vx - (this.bot.accel || 0.8) * 0.8,
            -(this.bot.speed || 4),
          );
        }
      }
    }

    // 5. Saltos estratégicos (evita ataques/sobe para ataque)
    if (heightDiff < -40 && !this.bot.isJumping && Math.random() < 0.12) {
      this.bot.vy = this.bot.jumpForce || -8.5;
      this.bot.isJumping = true;
    } else if (heightDiff > 30 && !this.bot.isJumping && Math.random() < 0.06) {
      // Pula para atacar de cima
      this.bot.vy = this.bot.jumpForce || -8.5;
      this.bot.isJumping = true;
    }

    // 6. Sistema de ataque melhorado com defesa adaptatória
    const canAttack =
      absDist < (this.bot.attackRange || 90) &&
      Date.now() - this.bot.lastAttack > (this.bot.attackCooldown || 250) &&
      this.bot.stamina >= this.bot.staminaCost &&
      !this.bot.attacking;

    if (canAttack) {
      // Probabilidade de ataque baseada na situação
      let attackChance = 0.4;

      if (botHealthPercent > 0.7) attackChance = 0.6; // Mais agressivo com vida alta
      if (botHealthPercent < 0.3) attackChance = 0.25; // Mais cauteloso com vida baixa

      // Reação ao combo do jogador - defende contra sequências
      if (this.player.comboCount > 2) {
        attackChance *= 0.6; // Reduz chance de atacar se o jogador está em combo

        // Ocasionalmente tenta pular para escapar
        if (Math.random() < 0.3 && !this.bot.isJumping) {
          this.bot.vy = this.bot.jumpForce || -8.5;
          this.bot.isJumping = true;
        }
      }

      if (Math.random() < attackChance) {
        this.bot.stamina -= this.bot.staminaCost;
        this.beginAttack(this.bot);

        // Combo do bot
        const now = Date.now();
        if (now - this.bot.lastComboTime < this.bot.comboTimeout) {
          this.bot.comboCount++;
        } else {
          this.bot.comboCount = 1;
        }
        this.bot.lastComboTime = now;
        this.bot.comboMultiplier = 1 + (this.bot.comboCount - 1) * 0.15;

        this.createAttackEffect(this.bot);

        // Efeito visual especial baseado em situação
        if (!this.performance.simpleFx && this.bot.comboCount > 2) {
          this.createSparkEffect(
            this.getCharCenterX(this.bot),
            this.getCharCenterY(this.bot),
            15,
            "#ff2a6d",
          );
        }

        this.gallery.audio?.play("attack");
      }
    }

    // 7. Efeito de impacto quando toma dano
    if (
      this.bot.invincibilityFrames > 0 &&
      this.bot.invincibilityFrames % 5 === 0
    ) {
      // Reage visualmente ao dano (desligado no modo simples para performance)
      if (!this.performance.simpleFx) {
        this.createBloodEffect(
          this.getCharCenterX(this.bot),
          this.getCharCenterY(this.bot) + this.bot.height * 0.2,
          0.6,
        );
      }
    }
  }

  checkAttacks() {
    // Ataque do jogador
    if (
      this.player.attacking &&
      !this.player.attackHitRegistered &&
      this.bot.health > 0 &&
      this.bot.invincibilityFrames <= 0
    ) {
      const distance = Math.abs(
        this.getCharCenterX(this.player) - this.getCharCenterX(this.bot),
      );
      const heightDiff = Math.abs(this.player.y - this.bot.y);

      if (distance < (this.player.attackRange || 160) && heightDiff < 100) {
        // Novo: Tenta bloquear o ataque
        if (this.attemptBlock(this.bot, this.player)) {
          this.player.attackHitRegistered = true;
          return; // Ataque bloqueado!
        }

        // Calcula dano com sistema de defesa e combo
        let damage = this.player.attackDamage || 10;
        damage *= this.player.comboMultiplier || 1; // Bônus de combo
        damage *= 1 - (this.bot.defense || 0) / 100; // Redução por defesa

        // Sistema de crítico melhorado
        const isCrit = Math.random() < (this.player.critChance || 0.1);
        if (isCrit) {
          damage *= this.player.critMultiplier || 1.8;
          this.createFloatingText(
            this.getCharCenterX(this.bot),
            this.getCharTopY(this.bot) - 10,
            "⚡ CRÍTICO!",
            "#ffff00",
          );
          // Novo: Efeito de eletricidade para crítico
          if (!this.performance.simpleFx) {
            this.createElectricEffect(
              this.getCharCenterX(this.player),
              this.getCharCenterY(this.player),
              this.getCharCenterX(this.bot),
              this.getCharCenterY(this.bot),
            );
          }
          // Novo: Sparks explosivos no crítico
          this.createSparkEffect(
            this.getCharCenterX(this.bot),
            this.getCharCenterY(this.bot),
            this.performance.simpleFx ? 2 : 20,
            "#ffff00",
          );
        }

        damage = Math.max(1, Math.floor(damage));

        this.bot.health -= damage;
        this.createHitEffect(this.bot, true, damage, isCrit);

        // Sparkles normais no impacto
        if (!this.performance.simpleFx) {
          this.createSparkEffect(
            this.getCharCenterX(this.bot),
            this.getCharCenterY(this.bot),
            12,
            isCrit ? "#ffdd00" : "#00ffea",
          );
        }

        // Knockback melhorado baseado no dano
        const knockbackForce = 10 + (damage / this.bot.maxHealth) * 15;
        if (this.player.x < this.bot.x) {
          this.bot.vx += knockbackForce * (this.player.comboMultiplier || 1);
        } else {
          this.bot.vx -= knockbackForce * (this.player.comboMultiplier || 1);
        }

        this.shakeScreen(2 + (damage / this.bot.maxHealth) * 1.5);
        this.triggerHitStop(isCrit ? 100 : 50); // Novo: Hit stop para impacto
        this.bot.invincibilityFrames = 20;
        this.player.attackHitRegistered = true;
        this.gallery.audio?.play("hit");
      }
    }

    // Ataque do bot
    if (
      this.bot.attacking &&
      !this.bot.attackHitRegistered &&
      this.player.health > 0 &&
      this.player.invincibilityFrames <= 0
    ) {
      const distance = Math.abs(
        this.getCharCenterX(this.player) - this.getCharCenterX(this.bot),
      );
      const heightDiff = Math.abs(this.player.y - this.bot.y);

      if (distance < (this.bot.attackRange || 160) && heightDiff < 100) {
        // Novo: Tenta bloquear o ataque do bot
        if (this.attemptBlock(this.player, this.bot)) {
          this.bot.attackHitRegistered = true;
          return; // Ataque bloqueado!
        }

        // Calcula dano com sistema de defesa e combo
        let damage = this.bot.attackDamage || 10;
        damage *= this.bot.comboMultiplier || 1; // Bônus de combo
        damage *= 1 - (this.player.defense || 0) / 100; // Redução por defesa

        // Sistema de crítico melhorado
        const isCrit = Math.random() < (this.bot.critChance || 0.1);
        if (isCrit) {
          damage *= this.bot.critMultiplier || 1.8;
          this.createFloatingText(
            this.getCharCenterX(this.player),
            this.getCharTopY(this.player) - 10,
            "⚡ CRÍTICO!",
            "#ffff00",
          );
          // Novo: Efeito de eletricidade para crítico do bot
          if (!this.performance.simpleFx) {
            this.createElectricEffect(
              this.getCharCenterX(this.bot),
              this.getCharCenterY(this.bot),
              this.getCharCenterX(this.player),
              this.getCharCenterY(this.player),
            );
          }
          // Novo: Sparks explosivos no crítico
          this.createSparkEffect(
            this.getCharCenterX(this.player),
            this.getCharCenterY(this.player),
            this.performance.simpleFx ? 2 : 20,
            "#ff2a6d",
          );
        }

        damage = Math.max(1, Math.floor(damage));

        this.player.health -= damage;
        this.createHitEffect(this.player, false, damage, isCrit);

        // Sparkles normais no impacto (vermelho para bot)
        if (!this.performance.simpleFx) {
          this.createSparkEffect(
            this.getCharCenterX(this.player),
            this.getCharCenterY(this.player),
            12,
            isCrit ? "#ff5588" : "#ff2a6d",
          );
        }

        // Knockback melhorado baseado no dano
        const knockbackForce = 10 + (damage / this.player.maxHealth) * 15;
        if (this.bot.x < this.player.x) {
          this.player.vx += knockbackForce * (this.bot.comboMultiplier || 1);
        } else {
          this.player.vx -= knockbackForce * (this.bot.comboMultiplier || 1);
        }

        this.shakeScreen(2 + (damage / this.player.maxHealth) * 1.5);
        this.triggerHitStop(isCrit ? 100 : 50); // Novo: Hit stop para impacto
        this.player.invincibilityFrames = 20;
        this.bot.attackHitRegistered = true;
        this.gallery.audio?.play("hit");
      }
    }

    this.player.health = Math.max(0, this.player.health);
    this.bot.health = Math.max(0, this.bot.health);
  }

  createDustEffect(x, y) {
    const count = this.performance.simpleFx
      ? 2
      : Math.max(3, Math.floor(8 * this.effectDensity));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 4 - 1.5,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.3,
        size: 3 + Math.random() * 8,
        color: "rgba(100, 200, 255, 0.7)",
        rotation: Math.random() * Math.PI * 2,
      });
    }
  }

  createSparkEffect(x, y, count = 15, color = "#00ffea") {
    const scaledCount = Math.min(
      this.performance.maxBurstParticles,
      Math.max(
        this.performance.simpleFx ? 1 : 2,
        Math.floor(count * this.effectDensity),
      ),
    );
    for (let i = 0; i < scaledCount; i++) {
      const angle = (Math.PI * 2 * i) / scaledCount;
      const speed = this.performance.simpleFx
        ? 1.2 + Math.random() * 1.6
        : 3 + Math.random() * 5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2,
        life: this.performance.simpleFx ? 0.22 : 0.6,
        maxLife: this.performance.simpleFx ? 0.22 : 0.6,
        size: this.performance.simpleFx
          ? 1.4 + Math.random() * 1.8
          : 2 + Math.random() * 4,
        color: color,
        isSparkle: true,
      });
    }
  }

  createElectricEffect(fromX, fromY, toX, toY) {
    if (this.performance.simpleFx) return;
    const steps = Math.max(3, Math.floor(6 * this.effectDensity));
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 20;
      const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 20;
      this.effects.push({
        x: x,
        y: y,
        type: "electric",
        life: 0.3,
        maxLife: 0.3,
        size: 5,
      });
    }
  }

  // Novo: Efeito de explosão com partículas de onda de choque
  createExplosionEffect(x, y, intensity = 1) {
    if (this.performance.simpleFx) return;
    const count = Math.max(8, Math.floor(20 * intensity * this.effectDensity));
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0.8,
        maxLife: 0.8,
        size: 3 + Math.random() * 6,
        color: `rgba(255, ${150 + Math.random() * 100}, 0, ${0.6 + Math.random() * 0.3})`,
        isSparkle: true,
      });
    }

    // Efeito de onda de choque
    this.effects.push({
      x: x,
      y: y,
      type: "shockwave",
      life: 0.4,
      maxLife: 0.4,
      size: 20,
    });
  }

  // Novo: Efeito de cura com partículas luminosas
  createHealEffect(x, y, healAmount = 10) {
    if (this.performance.simpleFx) return;
    const count = Math.max(
      8,
      Math.floor((15 + healAmount / 5) * this.effectDensity),
    );
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1 - Math.random() * 2,
        life: 1.2,
        maxLife: 1.2,
        size: 2 + Math.random() * 3,
        color: `rgba(100, 255, 150, ${0.7 + Math.random() * 0.2})`,
        isSparkle: true,
      });
    }

    // Efeito de brilho de cura
    this.effects.push({
      x: x,
      y: y,
      type: "heal",
      life: 0.6,
      maxLife: 0.6,
      size: 30,
    });
  }

  // Novo: Efeito de sangue com splatters
  createBloodEffect(x, y, intensity = 1) {
    if (this.performance.simpleFx) return;
    const count = Math.max(
      4,
      Math.floor((8 + intensity * 5) * this.effectDensity),
    );
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        life: 1.5,
        maxLife: 1.5,
        size: 2 + Math.random() * 5,
        color: `rgba(${180 + Math.random() * 75}, ${Math.random() * 50}, ${Math.random() * 50}, ${0.6 + Math.random() * 0.3})`,
      });
    }
  }

  createAttackEffect(char) {
    const centerX = this.getCharCenterX(char);
    const centerY = this.getCharCenterY(char);
    const offset = char.direction === 1 ? char.width * 0.7 : -char.width * 0.7;
    // Efeito principal
    this.effects.push({
      x: centerX + offset,
      y: centerY,
      type: "attack",
      life: this.performance.simpleFx ? 0.1 : 0.25,
      maxLife: this.performance.simpleFx ? 0.1 : 0.25,
      size: this.performance.simpleFx
        ? Math.max(24, char.width * 0.42)
        : Math.max(45, char.width * 0.9),
    });

    // Efeito secundário de energia
    const trailCount = this.performance.simpleFx
      ? 0
      : Math.max(2, Math.floor(4 * this.effectDensity));
    for (let i = 0; i < trailCount; i++) {
      this.particles.push({
        x: centerX,
        y: centerY,
        vx: offset > 0 ? 6 + Math.random() * 4 : -6 - Math.random() * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.4,
        maxLife: 0.4,
        size: 2 + Math.random() * 4,
        color: char.isPlayer
          ? "rgba(0, 255, 200, 0.8)"
          : "rgba(255, 100, 150, 0.8)",
      });
    }
  }

  createHitEffect(char, isPlayerHit, damage, isCrit) {
    const particleCount = isCrit
      ? this.performance.simpleFx
        ? 2
        : Math.floor(15 * this.effectDensity)
      : this.performance.simpleFx
        ? 1
        : Math.floor(10 * this.effectDensity);
    const centerX = this.getCharCenterX(char);
    const centerY = this.getCharCenterY(char);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: centerX + (Math.random() - 0.5) * char.width * 0.9,
        y: centerY + (Math.random() - 0.5) * char.height * 0.8,
        vx: (Math.random() - 0.5) * (this.performance.simpleFx ? 5 : 12),
        vy: -Math.random() * (this.performance.simpleFx ? 4 : 10) - 2,
        life: this.performance.simpleFx ? 0.5 : 1,
        maxLife: this.performance.simpleFx ? 0.5 : 1,
        size: this.performance.simpleFx
          ? 2 + Math.random() * 4
          : 4 + Math.random() * 10,
        color: isCrit
          ? `rgba(255, 200, 50, ${0.8 + Math.random() * 0.2})`
          : isPlayerHit
            ? `rgba(100, 255, 200, ${0.7 + Math.random() * 0.2})`
            : `rgba(255, 80, 80, ${0.7 + Math.random() * 0.2})`,
      });
    }

    this.createDamageNumber(
      centerX,
      this.getCharTopY(char) + 12,
      damage,
      isPlayerHit,
      isCrit,
    );

    // Efeito de impacto
    this.effects.push({
      x: centerX,
      y: centerY,
      type: "hit",
      life: this.performance.simpleFx ? 0.18 : 0.25,
      maxLife: this.performance.simpleFx ? 0.18 : 0.25,
      size: this.performance.simpleFx
        ? Math.max(24, char.width * 0.52)
        : Math.max(50, char.width),
      isPlayer: isPlayerHit,
    });
  }

  createDamageNumber(x, y, damage, isPlayerTaking, isCrit) {
    this.effects.push({
      x: x,
      y: y,
      type: "damage",
      value: damage,
      life: this.performance.simpleFx ? 0.8 : 1.2,
      maxLife: this.performance.simpleFx ? 0.8 : 1.2,
      isPlayer: isPlayerTaking,
      isCrit: isCrit,
      vx: (Math.random() - 0.5) * 3,
    });
  }

  createFloatingText(x, y, text, color) {
    this.effects.push({
      x: x,
      y: y,
      type: "floatingText",
      text: text,
      color: color,
      life: this.performance.simpleFx ? 0.8 : 1.2,
      maxLife: this.performance.simpleFx ? 0.8 : 1.2,
      vx: (Math.random() - 0.5) * 2,
    });
  }

  createStaminaWarning(char) {
    this.createFloatingText(
      this.getCharCenterX(char),
      this.getCharTopY(char) - 24,
      "⚠ SEM STAMINA",
      "#ff5555",
    );
  }

  // Novo: Tenta bloquear um ataque
  attemptBlock(char, attacker) {
    // Chance de bloquear baseada em stamina
    if (char.stamina < 15) return false; // Precisa de stamina para bloquear

    // Chance de bloqueio: 20-30% se tiver stamina
    if (Math.random() > 0.25) return false;

    // Bloqueio bem-sucedido
    char.stamina -= 15; // Custa stamina
    this.createFloatingText(
      this.getCharCenterX(char),
      this.getCharTopY(char) - 8,
      "🛡 BLOQUEIO!",
      "#00aaff",
    );
    if (!this.performance.simpleFx) {
      this.createSparkEffect(
        this.getCharCenterX(char),
        this.getCharCenterY(char) + char.height * 0.2,
        10,
        "#00aaff",
      );
    }
    this.shakeScreen(2); // Pequeno shake

    return true;
  }

  shakeScreen(intensity) {
    this.shakeIntensity = Math.min(
      this.maxShake,
      this.shakeIntensity + intensity,
    );
  }

  updateEffects() {
    if (this.particles.length > this.performance.maxParticles) {
      this.particles.splice(
        0,
        this.particles.length - this.performance.maxParticles,
      );
    }
    if (this.effects.length > this.performance.maxEffects) {
      this.effects.splice(0, this.effects.length - this.performance.maxEffects);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravidade nas partículas
      p.vx *= 0.98; // Fricção de ar
      p.life -= this.performance.simpleFx ? 0.038 : 0.012;

      if (p.life <= 0 || p.y > this.canvasHeight + 50) {
        this.particles.splice(i, 1);
      }
    }

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= this.performance.simpleFx ? 0.045 : 0.015;

      if (e.type === "damage" || e.type === "floatingText") {
        e.y -= 1; // Movimento vertical
        if (e.vx !== undefined) e.x += e.vx; // Movimento horizontal opcional
      }

      if (e.life <= 0) {
        this.effects.splice(i, 1);
      }
    }

    if (this.player.invincibilityFrames > 0) this.player.invincibilityFrames--;
    if (this.bot.invincibilityFrames > 0) this.bot.invincibilityFrames--;
  }

  endBattle() {
    if (this.battleEnded) return;
    this.battleEnded = true;

    if (this.player.health <= 0) {
      this.createScreenMessage("DERROTA", "#ff2a6d");
      this.gallery.showToast("💀 VOCÊ PERDEU!");
      this.gallery.audio?.play("defeat");
    } else if (this.bot.health <= 0) {
      this.createScreenMessage("VITÓRIA", "#00ff9d");
      this.gallery.showToast("🏆 VOCÊ VENCEU!");
      this.gallery.audio?.play("victory");
    }

    this.battleEndTimer = setTimeout(() => {
      // Sai do Fullscreen automaticamente ao terminar
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        this.toggleFullscreen();
      }
      this.showSelectionScreen();
    }, 3000);
  }

  createScreenMessage(text, color) {
    this.effects.push({
      type: "message",
      text: text,
      color: color,
      life: 2.5,
      maxLife: 2.5,
    });
  }

  updateHealthBars() {
    if (!this.player || !this.bot) return;
    const playerPercent = (this.player.health / this.player.maxHealth) * 100;
    const botPercent = (this.bot.health / this.bot.maxHealth) * 100;
    if (this.elements.playerHealthFill) {
      this.elements.playerHealthFill.style.width =
        Math.max(0, playerPercent) + "%";
    }
    if (this.elements.botHealthFill) {
      this.elements.botHealthFill.style.width = Math.max(0, botPercent) + "%";
    }

    // Atualiza barras de energia (Novas)
    if (this.elements.playerEnergyFill) {
      const energyPercent = (this.player.energy / this.player.maxEnergy) * 100;
      this.elements.playerEnergyFill.style.width = `${Math.min(100, energyPercent)}%`;
      if (energyPercent >= 100) {
        this.elements.playerEnergyFill.style.background =
          "linear-gradient(90deg, #ffff00, #ff8800)";
        this.elements.playerEnergyFill.style.boxShadow = "0 0 15px #ffff00";
      } else {
        this.elements.playerEnergyFill.style.background =
          "linear-gradient(90deg, #00d2ff, #3a7bd5)";
        this.elements.playerEnergyFill.style.boxShadow =
          "0 0 10px rgba(0, 210, 255, 0.5)";
      }
    }

    if (this.elements.botEnergyFill) {
      const energyPercent = (this.bot.energy / this.bot.maxEnergy) * 100;
      this.elements.botEnergyFill.style.width = `${Math.min(100, energyPercent)}%`;
      if (energyPercent >= 100) {
        this.elements.botEnergyFill.style.background =
          "linear-gradient(90deg, #ffff00, #ff8800)";
      } else {
        this.elements.botEnergyFill.style.background =
          "linear-gradient(90deg, #00d2ff, #3a7bd5)";
      }
    }
  }

  performDash(char) {
    if (
      char.dashCooldown > 0 ||
      char.energy < (char.dashCost || 30) ||
      char.isDashing ||
      char.health <= 0
    )
      return;

    char.energy -= char.dashCost || 30;
    char.isDashing = true;
    char.dashTimer = 200; // 200ms de dash
    char.dashCooldown = 600; // 600ms de cooldown

    char.vx = char.direction * (char.speed * 3.5);

    // Efeito visual de dash
    this.createImpactEffect(
      char.x + char.width / 2,
      char.y - char.height / 2,
      char.direction === 1 ? "right" : "left",
    );
    this.gallery.audio?.play("whoosh");
  }

  performSpecialAttack(char) {
    if (
      char.energy < (char.specialCost || 60) ||
      char.attacking ||
      char.health <= 0
    )
      return;

    char.energy -= char.specialCost || 60;
    this.beginAttack(char);

    // O especial dá mais dano e tem range maior temporariamente
    const originalDamage = char.attackDamage;
    const originalRange = char.attackRange;

    char.attackDamage *= 2.5;
    char.attackRange *= 1.5;

    // Efeito visual especial
    this.shakeIntensity = 8;
    this.triggerHitStop(150);

    this.gallery.showToast(`🔥 ESPECIAL: ${char.name.toUpperCase()}!`);

    // Resetar após o ataque (usando timer compatível com o sistema)
    setTimeout(() => {
      char.attackDamage = originalDamage;
      char.attackRange = originalRange;
    }, 500);
  }

  triggerHitStop(duration) {
    this.hitStopTimer = duration;
  }

  draw() {
    if (!this.ctx) return;
    this.updateCanvasResolution();

    // Efeito de shake de tela
    let shakeX = 0,
      shakeY = 0;
    if (this.shakeIntensity > 0.1) {
      shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
    }

    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    // Fundo com gradiente melhorado
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, "#0a0a1a");
    gradient.addColorStop(0.5, "#1a1a3a");
    gradient.addColorStop(1, "#0f0f2a");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Novo: Renderizar partículas de fundo (estrelas/ambiente)
    this.drawBackgroundParticles();

    // Novo: Grid de fundo dinâmico
    this.drawArenaGrid();

    // Novo: Brilho radial no centro
    this.drawArenaGlow();

    // Chão/Arena melhorado com mais detalhes
    this.ctx.fillStyle = "#2a2a4a";
    this.ctx.fillRect(0, this.groundY + 10, this.canvasWidth, 50);

    // Novo: Padrão no chão
    this.ctx.strokeStyle = "rgba(0, 255, 200, 0.1)";
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.canvasWidth; i += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, this.groundY + 10);
      this.ctx.lineTo(i, this.groundY + 50);
      this.ctx.stroke();
    }

    // Efeito de luz no chão (mais intenso)
    this.ctx.fillStyle = "#00ffea";
    this.ctx.shadowColor = "#00ffea";
    this.ctx.shadowBlur = 20;
    this.ctx.fillRect(0, this.groundY + 10, this.canvasWidth, 3);

    // Linha de sombra inferior
    this.ctx.fillStyle = "rgba(255, 42, 109, 0.3)";
    this.ctx.shadowBlur = 0;
    this.ctx.fillRect(0, this.groundY + 55, this.canvasWidth, 5);
    this.ctx.shadowBlur = 0;

    // Renderiza personagens
    this.drawCharacter(this.player, true);
    this.drawCharacter(this.bot, false);

    // Novo: Linhas de energia entre personagens
    if (
      this.performance.drawEnergyLines &&
      this.player.health > 0 &&
      this.bot.health > 0
    ) {
      this.drawEnergyLines();
    }

    // Renderiza efeitos
    this.drawEffects();

    // Mensagem de fim de batalha
    const messageEffect = this.effects.find((e) => e.type === "message");
    if (messageEffect) {
      this.ctx.font = "bold 60px 'Orbitron', monospace";
      this.ctx.textAlign = "center";
      this.ctx.shadowColor = messageEffect.color;
      this.ctx.shadowBlur = 40;
      this.ctx.fillStyle = messageEffect.color;
      this.ctx.globalAlpha = messageEffect.life / messageEffect.maxLife;
      this.ctx.fillText(messageEffect.text, this.canvasWidth / 2, 150);
      this.ctx.globalAlpha = 1;
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  // Novo: Renderiza partículas de fundo (ambiente/estrelas)
  drawBackgroundParticles() {
    for (const particle of this.backgroundParticles) {
      // Atualizar posição
      particle.y += particle.speed;
      if (particle.y > this.canvasHeight) {
        particle.y = 0;
      }

      // Renderizar
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowColor = particle.color;
      this.ctx.shadowBlur = 5;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Pulso de brilho
      const pulse = Math.sin(Date.now() * 0.005 + particle.x) * 0.5 + 0.5;
      this.ctx.globalAlpha = particle.opacity * pulse * 0.35;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }

  // Novo: Desenha grid de fundo da arena
  drawArenaGrid() {
    const gridSize = 50;
    const time = Date.now() * 0.001; // Animação baseada em tempo

    this.ctx.strokeStyle = `rgba(0, 255, 200, ${0.05 + Math.sin(time) * 0.015})`;
    this.ctx.lineWidth = 1;

    // Grid vertical
    for (let x = 0; x < this.canvasWidth; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    // Grid horizontal
    for (let y = 0; y < this.canvasHeight; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }
  }

  // Novo: Desenha brilho radiante na arena
  drawArenaGlow() {
    const centerX = this.canvasWidth / 2;
    const centerY = this.canvasHeight / 1.5;

    const radialGradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      360,
    );
    radialGradient.addColorStop(0, "rgba(0, 255, 200, 0.11)");
    radialGradient.addColorStop(0.5, "rgba(0, 255, 200, 0.035)");
    radialGradient.addColorStop(1, "rgba(0, 255, 200, 0)");

    this.ctx.fillStyle = radialGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 360, 0, Math.PI * 2);
    this.ctx.fill();
  }

  // Novo: Desenha linhas de energia entre os personagens
  drawEnergyLines() {
    const distance = Math.abs(this.player.x - this.bot.x);

    // Só desenha se estão em combate próximos
    if (distance > 420) return;

    const p1X = this.getCharCenterX(this.player);
    const p1Y = this.getCharCenterY(this.player);
    const p2X = this.getCharCenterX(this.bot);
    const p2Y = this.getCharCenterY(this.bot);

    // Linha de energia principal
    this.ctx.strokeStyle = "rgba(0, 255, 200, 0.2)";
    this.ctx.lineWidth = 1.5;
    this.ctx.setLineDash([4, 6]);
    this.ctx.beginPath();
    this.ctx.moveTo(p1X, p1Y);
    this.ctx.lineTo(p2X, p2Y);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Pulsos de energia
    const time = Date.now() * 0.003;
    for (let i = 0; i < 2; i++) {
      const offset = (time + i * 0.3) % 1;
      const x = p1X + (p2X - p1X) * offset;
      const y = p1Y + (p2Y - p1Y) * offset;

      this.ctx.fillStyle = `rgba(0, 255, 200, ${0.45 - offset * 0.45})`;
      this.ctx.beginPath();
      this.ctx.arc(x, y, 3.2 - offset * 1.6, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawCharacter(char, isPlayer) {
    if (!char || !this.ctx) return;

    const x = char.x;
    const y = this.getCharTopY(char);
    const width = char.width;
    const height = char.height;
    const centerX = this.getCharCenterX(char);

    const baseImage = isPlayer ? this.playerImage : this.botImage;
    const animatedFrame = this.getAnimatedAttackFrame(char);
    const image = animatedFrame || baseImage;
    const role = this.getAnimationRole(char);
    const isAttackAnimationActive =
      !!animatedFrame || (!!role && this.attackAnimations[role].active);

    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    this.ctx.beginPath();
    this.ctx.ellipse(
      centerX,
      this.groundY + 15,
      Math.max(34, width * 0.55),
      13,
      0,
      0,
      Math.PI * 2,
    );
    this.ctx.fill();

    if (image && this.imagesLoaded) {
      this.ctx.save();

      if (char.attacking || isAttackAnimationActive) {
        this.ctx.shadowBlur = 0;
      }

      if (char.direction === -1) {
        this.ctx.translate(x + width, y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(image, 0, 0, width, height);
      } else {
        this.ctx.drawImage(image, x, y, width, height);
      }

      this.ctx.restore();

      if (char.attacking || isAttackAnimationActive) {
        // Overlay removido para PNG
      }

      if (char.invincibilityFrames > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.3 * (char.invincibilityFrames / 20);
        this.ctx.fillStyle = "#ff3366";
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
      }
    } else {
      this.ctx.fillStyle = isPlayer ? "#00ffea" : "#ff5588";
      this.ctx.fillRect(x, y, width, height);
      this.ctx.beginPath();
      this.ctx.arc(centerX, y - 10, 15, 0, Math.PI * 2);
      this.ctx.fillStyle = isPlayer ? "#ffff00" : "#ffaa00";
      this.ctx.fill();
    }

    // desenhar hitbox se estiver no modo de depuração
    if (this.performance.drawHitboxes) {
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(255,0,0,0.6)";
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.restore();
    }

    // Renderizar nome do personagem com configurações customizadas
    this.renderCharacterName(char, centerX, y, isPlayer);
    this.ctx.shadowBlur = 0;

    const healthPercent = char.health / char.maxHealth;
    const healthBarWidth = Math.max(108, width + 22);
    const healthBarX = centerX - healthBarWidth / 2;
    const healthBarY = y - 22;

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, 9);
    this.ctx.fillStyle =
      healthPercent > 0.5
        ? "#00ff9d"
        : healthPercent > 0.25
          ? "#ffaa00"
          : "#ff3366";
    this.ctx.fillRect(
      healthBarX,
      healthBarY,
      healthBarWidth * healthPercent,
      9,
    );

    // Borda removida para visual mais limpo
    // this.ctx.strokeStyle = "#ffffff";
    // this.ctx.lineWidth = 1;
    // this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 9);

    this.ctx.font = "bold 11px 'Rajdhani', sans-serif";
    this.ctx.fillStyle = "#ffffff";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      Math.round(char.health) + "/" + char.maxHealth,
      centerX,
      y - 8,
    );

    if (char.stamina !== undefined) {
      const staminaPercent = char.stamina / char.maxStamina;
      const staminaBarY = y - 4;

      this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      this.ctx.fillRect(healthBarX, staminaBarY, healthBarWidth, 5);
      this.ctx.fillStyle = "#00aaff";
      this.ctx.fillRect(
        healthBarX,
        staminaBarY,
        healthBarWidth * staminaPercent,
        5,
      );
    }

    if (char.cooldownTimer > 0) {
      const cooldownPercent = char.cooldownTimer / (char.attackCooldown || 250);
      this.ctx.fillStyle = "rgba(255, 100, 50, 0.6)";
      this.ctx.fillRect(x, y - 32, width * cooldownPercent, 4);
    }

    if (!this.performance.simpleFx && char.comboCount > 1) {
      this.ctx.font = "bold 16px 'Orbitron', monospace";
      this.ctx.fillStyle = "#ffdd00";
      this.ctx.shadowColor = "#ffdd00";
      this.ctx.shadowBlur = 12;
      this.ctx.textAlign = "center";

      const pulse = Math.sin(Date.now() * 0.01 * char.comboCount) * 0.3 + 0.7;
      this.ctx.globalAlpha = pulse;
      this.ctx.fillText("✦ x" + char.comboCount + " ✦", centerX, y - 56);
      this.ctx.globalAlpha = 1;

      this.ctx.shadowBlur = 0;
    }
  }

  renderCharacterName(char, centerX, y, isPlayer) {
    // Usar configurações do ArenaSettingsManager se disponível
    const settings = this.settingsManager?.settings?.name || {};
    const fontSize = settings.size || "14";
    const nameColor = settings.color || "#FFFFFF";
    const nameOffset = parseInt(settings.offset || "-28");
    const nameShadow = settings.shadow !== false;

    // Configurar fonte
    this.ctx.font = `bold ${fontSize}px 'Orbitron', monospace`;
    this.ctx.fillStyle = nameColor;
    this.ctx.textAlign = "center";

    // Adicionar sombra de texto se habilitada
    if (nameShadow) {
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 2;
      this.ctx.shadowOffsetY = 2;
    }

    // Renderizar nome
    this.ctx.fillText(char.name, centerX, y + nameOffset);

    // Limpar sombra
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  drawEffects() {
    for (const e of this.effects) {
      if (e.type === "attack") {
        this.ctx.globalAlpha = e.life / e.maxLife;
        this.ctx.strokeStyle = "#00ffff";
        this.ctx.lineWidth = this.performance.simpleFx ? 1.5 : 4;
        this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 10;
        const slashSize = this.performance.simpleFx
          ? Math.max(10, e.size * 0.45)
          : 25;
        this.ctx.beginPath();
        this.ctx.moveTo(e.x - slashSize, e.y - slashSize);
        this.ctx.lineTo(e.x + slashSize, e.y + slashSize);
        if (!this.performance.simpleFx) {
          this.ctx.moveTo(e.x + slashSize, e.y - slashSize);
          this.ctx.lineTo(e.x - slashSize, e.y + slashSize);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      } else if (e.type === "hit") {
        this.ctx.globalAlpha = (e.life / e.maxLife) * 0.6;
        const pulse = 1 - e.life / e.maxLife;
        const color = e.isPlayer ? "#00ffff" : "#ff0088";
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = this.performance.simpleFx ? 1.6 : 3;
        this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 12;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, e.size * pulse, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
      } else if (e.type === "damage") {
        this.ctx.globalAlpha = e.life / e.maxLife;
        const scale = 1 + (1 - e.life / e.maxLife) * 0.5;
        this.ctx.font = this.performance.simpleFx
          ? `bold ${Math.floor(17 * scale)}px 'Orbitron', monospace`
          : `bold ${Math.floor(20 * scale + (1 - e.life) * 15)}px 'Orbitron', monospace`;
        this.ctx.textAlign = "center";

        if (e.isCrit) {
          this.ctx.fillStyle = "#ff00ff";
          this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 14;
          this.ctx.fillText("⚡ -" + e.value, e.x, e.y);
        } else {
          this.ctx.fillStyle = e.isPlayer ? "#ff2a6d" : "#ffaa00";
          this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 8;
          this.ctx.fillText("-" + e.value, e.x, e.y);
        }
      } else if (e.type === "floatingText") {
        this.ctx.globalAlpha = e.life / e.maxLife;
        this.ctx.font = this.performance.simpleFx
          ? "bold 16px 'Orbitron', monospace"
          : "bold 20px 'Orbitron', monospace";
        this.ctx.fillStyle = e.color;
        this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 10;
        this.ctx.textAlign = "center";
        this.ctx.fillText(e.text, e.x, e.y);
      } else if (e.type === "electric") {
        if (this.performance.simpleFx) continue;
        // Novo: Renderizar arco elétrico
        this.ctx.globalAlpha = e.life / e.maxLife;
        const radius = e.size + (1 - e.life / e.maxLife) * 3;
        this.ctx.fillStyle = "#00ffff";
        this.ctx.shadowColor = "#00ffff";
        this.ctx.shadowBlur = 11;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Segundo arco brilhante
        this.ctx.globalAlpha = (e.life / e.maxLife) * 0.4;
        this.ctx.fillStyle = "#88ffff";
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (e.type === "shockwave") {
        if (this.performance.simpleFx) continue;
        // Novo: Renderizar onda de choque
        this.ctx.globalAlpha = (e.life / e.maxLife) * 0.7;
        const expandedRadius = e.size + (1 - e.life / e.maxLife) * 50;
        this.ctx.strokeStyle = `rgba(255, 200, 0, ${0.6 * (e.life / e.maxLife)})`;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = "rgba(255, 200, 0, 0.8)";
        this.ctx.shadowBlur = 9;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, expandedRadius, 0, Math.PI * 2);
        this.ctx.stroke();
      } else if (e.type === "heal") {
        if (this.performance.simpleFx) continue;
        // Novo: Renderizar efeito de cura
        this.ctx.globalAlpha = e.life / e.maxLife;
        const radius = e.size * (1 - e.life / e.maxLife);
        this.ctx.fillStyle = `rgba(100, 255, 150, ${0.3 * (e.life / e.maxLife)})`;
        this.ctx.shadowColor = "#64ff96";
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Anel externo de cura
        this.ctx.globalAlpha = (e.life / e.maxLife) * 0.6;
        this.ctx.strokeStyle = "#64ff96";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(e.x, e.y, radius * 1.4, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    // Renderizar particles com suporte a sparkles
    for (const p of this.particles) {
      if (this.performance.simpleFx) {
        this.ctx.globalAlpha = Math.max(0, (p.life / p.maxLife) * 0.7);
        this.ctx.fillStyle = p.color;
        const pixel = Math.max(1, p.size * 0.45);
        this.ctx.fillRect(p.x, p.y, pixel, pixel);
        continue;
      }

      if (p.isSparkle) {
        // Novo: Renderizar sparkles
        this.ctx.globalAlpha = p.life / p.maxLife;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 6;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();

        if (!this.performance.simpleFx) {
          this.ctx.globalAlpha = (p.life / p.maxLife) * 0.5;
          this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else {
        // Renderização padrão de partículas
        this.ctx.globalAlpha = Math.max(0, (p.life / p.maxLife) * 0.8);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = this.performance.simpleFx ? 0 : 5;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.globalAlpha = 1;
    this.ctx.shadowBlur = 0;
  }
}
// ============================================
// CLASSE BATTLE CHARACTER - VERSÃO MELHORADA
// ============================================
class BattleCharacter {
  constructor(charData, x, groundY, width, maxHealth, isPlayer) {
    this.data = charData;
    this.name = charData.name || "Personagem";
    this.x = x;
    this.y = groundY;
    this.width = width;
    this.height = Math.round(width * 1.33);
    this.vy = 0;
    this.vx = 0;
    this.accel = 0.8;
    this.friction = 0.82;
    this.isJumping = false;
    this.jumpTimer = 0;
    this.health = maxHealth;
    this.maxHealth = maxHealth;
    this.attacking = false;
    this.attackPressed = false;
    this.lastAttack = 0;
    this.cooldownTimer = 0;
    this.currentAttackDuration = 250;
    this.attackHitRegistered = false;
    this.isPlayer = isPlayer;
    this.direction = 1;
    this.invincibilityFrames = 0;

    // Atributos base
    this.speed = 4;
    this.jumpForce = -8.5;
    this.jumpHeight = 8.5;
    this.attackDamage = 10;
    this.attackRange = 160;
    this.attackCooldown = 250;
    this.baseAttackCooldown = 250;
    this.defense = 0;
    this.critChance = 0.1;
    this.critMultiplier = 1.8;

    // Sistema de stamina (NOVO!)
    this.maxStamina = 100;
    this.stamina = 100;
    this.staminaRegen = 0.8;
    this.staminaCost = 20;

    // Sistema de combo (NOVO!)
    this.comboCount = 0;
    this.lastComboTime = 0;
    this.comboTimeout = 800;
    this.comboMultiplier = 1;

    // Novos atributos 13/10
    this.maxEnergy = 100;
    this.energy = 0;
    this.energyRegen = 0.2;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
  }
}
