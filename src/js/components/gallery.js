class QuantumGallery {
  constructor(cache) {
    this.cache = cache;
    this.charactersData = charactersData;

    this.config = {
      itemsPerPage: 80,
      initialCardsBatch: 20,
      nextCardsBatch: 10,
      intersectionObserver: null,
      scrollDebounce: null,
    };

    this.state = {
      currentPage: 1,
      currentCategory: "all",
      currentSort: "original",
      filteredCharacters: [...charactersData],
      isModalOpen: false,
      isSearchModalOpen: false,
      showFavoritesPage: false,
      showModelsPage: false,
      showBattlePage: false,
      showBattle2dPage: false,
      isSpaceMode: false,
      modelsSearchTerm: "",
      modelsCategory: "all",
      modelsSort: "versions-desc",
      modelsOnlyAnimated: false,
      modalOpenedFromFavorites: false,
      scrollPositionBeforeModal: 0,
      renderedCardsCount: 0,
      renderQueueCharacters: [],
    };

    this.viewedCharacters = new Set();
    this.history = new QuantumHistory(this);
    this.audio = new QuantumAudio();
    this.themeSystem = new QuantumThemeSystem();
    this.favorites = new QuantumFavoritesSystem(this);
    this.searchSystem = new QuantumSearch(this);
    this.battleSystem = new QuantumBattleSystem(this);
    this.battle2D = new QuantumBattle2DSystem(this);
    this.modalVideoByCharacterId = {
      1: "assets/videos/Luffy-v-1.mp4",
      2: "assets/videos/Goku-v-2.mp4",
      4: "assets/videos/MADARAUCHIHA-v-1.mp4",
      9: "assets/videos/AATROX-v-1.mp4",
      11: "assets/videos/GOLDEN-SPERM-v-1.mp4",
      13: "assets/videos/RADAHN-v-1.mp4",
      15: "assets/videos/RYOMEN-SUKUNA-v-1.mp4",
      26: "assets/videos/Darius-v-1.mp4",
      35: "assets/videos/Loki-v-1.mp4",
      39: "assets/videos/Battl- Beast-v-1.mp4",
      47: "assets/videos/Jirem.mp4",
      58: "assets/videos/raiden-v-1.mp4",
      64: "assets/videos/Barba-branca-v-1.mp4",
      69: "assets/videos/Maki.mp4",
      78: "assets/videos/Kaido-v-1.mp4",
      124: "assets/videos/BALERION-v-1.mp4",
      161: "assets/videos/solaria-v-1.mp4",
      211: "assets/videos/Azula-v-1.mp4",
      218: "assets/videos/gowther-Original-v-1.mp4",
      256: "assets/videos/KHAL-DROGO-v-1.mp4",
      281: "assets/videos/HARALD-v-1.mp4",
      322: "assets/videos/Psykos-v-1.mp4",
      227: "assets/videos/Ned-Stark-v-1.mp4",
    };

    this.elements = {};
    this.pageTransitionInProgress = false;
    this.previousFocusedElementBefore3d = null;
    this.trap3dFocus = null;
    this.on3dOverlayKeydown = (e) => {
      if (e.key === "Escape") {
        this.close3dOverlay();
        return;
      }
      if (e.key === "Tab" && typeof this.trap3dFocus === "function") {
        this.trap3dFocus(e);
      }
    };
    this.init();
  }

  getModelVersionsForCharacter(character, fallbackModelUrl) {
    const defaultVersion = [
      {
        label: "Padrao",
        path: fallbackModelUrl,
        isAnimated: false,
        type: "static",
      },
    ];
    if (!character || !fallbackModelUrl) return defaultVersion;

    const base = character.model3d || fallbackModelUrl;
    const normalizedName = (character.name || "").toUpperCase();

    if (normalizedName.includes("LUFFY")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Classico",
          path: "assets/Modelo3D/Luffy-Versions/Luffy+classic+3d+model.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Gear 4",
          path: "assets/Modelo3D/Luffy-Versions/Luffy+gear+4+3d+model.glb",
          isAnimated: false,
          type: "combat",
        },
        {
          label: "Gear 5",
          path: "assets/Modelo3D/Luffy-Versions/Luffy+gear+5+3d+model.glb",
          isAnimated: false,
          type: "combat",
        },
      ];
    }

    if (normalizedName.includes("LOKI")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Forma Dragao",
          path: "assets/Modelo3D/Loki-Versions/Loki-dragon+3d+model.glb",
          isAnimated: false,
          type: "combat",
        },
        {
          label: "Forma Harald",
          path: "assets/Modelo3D/Loki-Versions/Loki-Harald.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Preso",
          path: "assets/Modelo3D/Loki-Versions/Loki-Preso.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Crianca",
          path: "assets/Modelo3D/Loki-Versions/Loki-Criança.glb",
          isAnimated: false,
          type: "skin",
        },
      ];
    }

    if (normalizedName.includes("AATROX")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Versao 2",
          path: "assets/Modelo3D/Aatrox-Versions/Aatrox-2+3d+model.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Versao 3",
          path: "assets/Modelo3D/Aatrox-Versions/Aatrox-3+3d+model.glb.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Versao 4",
          path: "assets/Modelo3D/Aatrox-Versions/Aatrox-4+3d+model.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Animado",
          path: "assets/Modelo3D/Aatrox-Versions/Aatrox-Animated/Animation_Aatrox_Walking_withSkin.glb",
          isAnimated: true,
          type: "animated",
        },
      ];
    }

    if (normalizedName.includes("KAIDO")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Forma Hibrida",
          path: "assets/Modelo3D/Kaido-Versions/kaido-forma-hibrida.glb",
          isAnimated: false,
          type: "combat",
        },
        {
          label: "Forma Dragao",
          path: "assets/Modelo3D/Kaido-Versions/Kaido-Foma-Dragão.glb",
          isAnimated: false,
          type: "combat",
        },
      ];
    }

    if (normalizedName.includes("GAROU")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Cosmico",
          path: "assets/Modelo3D/Garou-Versions/Gaoru-Cosmico.glb",
          isAnimated: false,
          type: "combat",
        },
      ];
    }

    if (normalizedName.includes("GUTS")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Versao 2",
          path: "assets/Modelo3D/Guts-Versions/Guts-1.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Versao 3",
          path: "assets/Modelo3D/Guts-Versions/Guts-3.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Animado",
          path: "assets/Modelo3D/Guts-Versions/Guts-Animated/Guts-Andando.glb",
          isAnimated: true,
          type: "animated",
        },
      ];
    }

    if (normalizedName.includes("DARIUS")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Mestre da Enterrada",
          path: "assets/Modelo3D/Darius-Versions/Darius-Mestre-da-Enterrada.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Florescer Espiritual",
          path: "assets/Modelo3D/Darius-Versions/Darius-Florescer-Espiritual.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Deus Rei",
          path: "assets/Modelo3D/Darius-Versions/Deus-Rei Darius.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Deus Rei Divino",
          path: "assets/Modelo3D/Darius-Versions/Deus-Rei Darius-Divino.glb",
          isAnimated: false,
          type: "skin",
        },
      ];
    }

    if (normalizedName.includes("OROCHI")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Base",
          path: "assets/Modelo3D/Orochi-Versions/Orochi-Base.glb",
          isAnimated: false,
          type: "skin",
        },
      ];
    }

    if (normalizedName.includes("GOLDEN SPERM")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Platinum",
          path: "assets/Modelo3D/Golden-Sperm/platinum-sperm.glb",
          isAnimated: false,
          type: "skin",
        },
      ];
    }

    if (normalizedName.includes("SOLARIA")) {
      return [
        { label: "Padrao", path: base, isAnimated: false, type: "static" },
        {
          label: "Versao 2",
          path: "assets/Modelo3D/Solaria+Butterfly/Solaria-Butterfly-2.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Versao 3",
          path: "assets/Modelo3D/Solaria+Butterfly/Solaria-Butterfly-3.glb",
          isAnimated: false,
          type: "skin",
        },
        {
          label: "Versao 4",
          path: "assets/Modelo3D/Solaria+Butterfly/Solaria-Butterfly-4.glb",
          isAnimated: false,
          type: "skin",
        },
      ];
    }

    return defaultVersion;
  }
  show3dModelByCharacterId(characterId) {
    const character = this.charactersData.find((c) => c.id === characterId);
    if (!character?.model3d) return;
    this.show3dModel(character.model3d, character);
  }

  close3dOverlay() {
    const overlay = document.getElementById("threeDOverlay");
    if (overlay) overlay.remove();
    this.trap3dFocus = null;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", this.on3dOverlayKeydown);
    if (
      this.previousFocusedElementBefore3d &&
      document.contains(this.previousFocusedElementBefore3d) &&
      typeof this.previousFocusedElementBefore3d.focus === "function"
    ) {
      this.previousFocusedElementBefore3d.focus();
    }
    this.previousFocusedElementBefore3d = null;
  }

  encodeModelAssetPath(assetPath) {
    if (!assetPath) return assetPath;
    return assetPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  setViewerAnimationState(viewer, isAnimated) {
    if (!viewer) return;
    if (isAnimated) {
      viewer.setAttribute("autoplay", "");
      viewer.setAttribute("loop", "");
      viewer.setAttribute("animation-name", "*");
      return;
    }

    viewer.removeAttribute("autoplay");
    viewer.removeAttribute("loop");
    viewer.removeAttribute("animation-name");
  }

  updateThreeDModelStatus(
    overlay,
    activeLabel,
    isAnimated,
    totalVersions,
    totalAvailableVersions = totalVersions,
  ) {
    if (!overlay) return;

    const countEl = overlay.querySelector("#threeDVersionCount");
    const activeEl = overlay.querySelector("#threeDActiveVersion");
    const animEl = overlay.querySelector("#threeDAnimationState");

    if (countEl) {
      if (totalAvailableVersions > totalVersions) {
        countEl.textContent = `${totalVersions}/${totalAvailableVersions} versoes`;
      } else {
        countEl.textContent = `${totalVersions} ${totalVersions === 1 ? "versao" : "versoes"}`;
      }
    }

    if (activeEl) {
      activeEl.textContent = activeLabel || "Padrao";
    }

    if (animEl) {
      animEl.textContent = isAnimated ? "Animacao ativa" : "Modelo estatico";
      animEl.classList.toggle("is-animated", Boolean(isAnimated));
    }
  }

  /* exibidor de modelo 3D sobreposto com selecao de versoes */
  show3dModel(modelUrl, character = null) {
    if (!modelUrl) return;

    const rawVersions = this.getModelVersionsForCharacter(character, modelUrl);
    const versions = (rawVersions || []).map((version, index) => {
      const label = version?.label || `Versao ${index + 1}`;
      const path = version?.path || modelUrl;
      const isAnimated = Boolean(version?.isAnimated);
      const thumbnail =
        version?.thumbnail || version?.thumb || character?.image || "";
      const normalizedType = String(
        version?.type || (isAnimated ? "animated" : "static"),
      )
        .toLowerCase()
        .trim();

      return {
        id: `version-${index}`,
        label,
        path,
        thumbnail,
        isAnimated,
        type: normalizedType || "static",
        searchText: `${label} ${normalizedType}`.toLowerCase(),
      };
    });

    const defaultVersion = versions[0] || {
      id: "version-0",
      label: "Padrao",
      path: modelUrl,
      thumbnail: character?.image || "",
      isAnimated: false,
      type: "static",
      searchText: "padrao static",
    };

    const title = character?.name || "MODELO 3D";
    const safeModelUrl = this.encodeModelAssetPath(
      defaultVersion.path || modelUrl,
    );

    this.previousFocusedElementBefore3d = document.activeElement;

    let overlay = document.getElementById("threeDOverlay");
    if (overlay) overlay.remove();

    const isTouchPrimary = window.matchMedia("(pointer: coarse)").matches;
    const touchHint = "1 dedo gira. 2 dedos para zoom e mover.";
    const desktopHint =
      "Arraste para girar, scroll para zoom e botao direito para mover.";

    overlay = document.createElement("div");
    overlay.id = "threeDOverlay";
    overlay.innerHTML = `
      <div class="three-d-panel" role="dialog" aria-modal="true" aria-labelledby="threeDTitle" aria-describedby="threeDHint" tabindex="-1">
        <div class="three-d-toolbar">
          <div class="three-d-heading">
            <h3 class="three-d-title" id="threeDTitle">${title}</h3>
            <p class="three-d-subtitle">Selecione a versao do modelo 3D</p>
          </div>
          <div class="three-d-toolbar-actions">
            <button class="three-d-action-btn three-d-toggle-rotate" type="button" aria-pressed="true" aria-label="Alternar auto-rotacao">
              <i class="fas fa-sync-alt" aria-hidden="true"></i>
              Auto-rotacao
            </button>
            <button class="three-d-action-btn three-d-reset-view" type="button" aria-label="Resetar camera">
              <i class="fas fa-crosshairs" aria-hidden="true"></i>
              Resetar camera
            </button>
            <button class="close-3d" aria-label="Fechar visualizador 3D">&times;</button>
          </div>
        </div>
        <div class="three-d-layout">
          <aside class="three-d-versions-block">
            <div class="three-d-versions-meta">
              <span class="three-d-meta-chip" id="threeDVersionCount"></span>
              <span class="three-d-meta-chip is-active" id="threeDActiveVersion"></span>
              <span class="three-d-meta-chip" id="threeDAnimationState"></span>
            </div>
            <div class="three-d-discovery">
              <label class="three-d-search-wrap" for="threeDVersionSearch">
                <i class="fas fa-search" aria-hidden="true"></i>
                <input
                  id="threeDVersionSearch"
                  class="three-d-version-search"
                  type="search"
                  placeholder="Buscar versao..."
                  autocomplete="off"
                />
              </label>
              <div class="three-d-filter-group" id="threeDFilterGroup" role="tablist" aria-label="Filtros de versao">
                <button class="three-d-filter-btn active" data-filter="all" type="button">Todos</button>
                <button class="three-d-filter-btn" data-filter="static" type="button">Estatico</button>
                <button class="three-d-filter-btn" data-filter="animated" type="button">Animado</button>
                <button class="three-d-filter-btn" data-filter="skin" type="button">Skin</button>
                <button class="three-d-filter-btn" data-filter="combat" type="button">Combate</button>
              </div>
            </div>
            <div class="three-d-versions-scroll">
              <div class="three-d-versions" id="threeDVersions"></div>
            </div>
            <p class="three-d-empty is-hidden" id="threeDEmptyState">
              Nenhuma versao encontrada para esse filtro.
            </p>
          </aside>
          <section class="three-d-stage">
            <div class="three-d-stage-hint" id="threeDHint">
              <i class="fas fa-hand-paper" aria-hidden="true"></i>
              ${isTouchPrimary ? touchHint : desktopHint}
            </div>
            <div class="three-d-viewer-shell is-loading" aria-busy="true">
              <div class="three-d-status-overlay three-d-loading" id="threeDLoading" role="status" aria-live="polite">
                <div class="three-d-spinner" aria-hidden="true"></div>
                <p>Carregando modelo 3D...</p>
              </div>
              <div class="three-d-status-overlay three-d-error is-hidden" id="threeDErrorState" role="alert">
                <p>Falha ao carregar o modelo.</p>
                <button class="three-d-retry-btn" id="threeDRetryBtn" type="button">Tentar novamente</button>
              </div>
              <model-viewer
                id="threeDViewer"
                src="${safeModelUrl}"
                alt="Modelo 3D"
                auto-rotate
                camera-controls
                interaction-prompt="auto">
              </model-viewer>
            </div>
          </section>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("modal-open");

    const viewer = overlay.querySelector("#threeDViewer");
    const viewerShell = overlay.querySelector(".three-d-viewer-shell");
    const loadingState = overlay.querySelector("#threeDLoading");
    const errorState = overlay.querySelector("#threeDErrorState");
    const retryBtn = overlay.querySelector("#threeDRetryBtn");
    const versionsContainer = overlay.querySelector("#threeDVersions");
    const searchInput = overlay.querySelector("#threeDVersionSearch");
    const filterGroup = overlay.querySelector("#threeDFilterGroup");
    const emptyState = overlay.querySelector("#threeDEmptyState");
    const closeBtn = overlay.querySelector(".close-3d");
    const resetViewBtn = overlay.querySelector(".three-d-reset-view");
    const autoRotateBtn = overlay.querySelector(".three-d-toggle-rotate");
    const panel = overlay.querySelector(".three-d-panel");
    if (
      !viewer ||
      !viewerShell ||
      !loadingState ||
      !errorState ||
      !retryBtn ||
      !versionsContainer ||
      !searchInput ||
      !filterGroup ||
      !emptyState ||
      !closeBtn ||
      !resetViewBtn ||
      !autoRotateBtn ||
      !panel
    ) {
      return;
    }

    const showViewerLoading = () => {
      viewerShell.classList.add("is-loading");
      viewerShell.setAttribute("aria-busy", "true");
      loadingState.classList.remove("is-hidden");
      errorState.classList.add("is-hidden");
    };

    const hideViewerLoading = () => {
      viewerShell.classList.remove("is-loading");
      viewerShell.setAttribute("aria-busy", "false");
      loadingState.classList.add("is-hidden");
    };

    const showViewerError = () => {
      hideViewerLoading();
      errorState.classList.remove("is-hidden");
    };

    closeBtn.addEventListener("click", () => this.close3dOverlay());
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) this.close3dOverlay();
    });
    resetViewBtn.addEventListener("click", () => {
      viewer.setAttribute("camera-orbit", "0deg 75deg auto");
      viewer.setAttribute("camera-target", "auto auto auto");
      viewer.setAttribute("field-of-view", "30deg");
    });
    autoRotateBtn.addEventListener("click", () => {
      const isEnabled = viewer.hasAttribute("auto-rotate");
      if (isEnabled) {
        viewer.removeAttribute("auto-rotate");
      } else {
        viewer.setAttribute("auto-rotate", "");
      }
      autoRotateBtn.setAttribute("aria-pressed", String(!isEnabled));
    });
    retryBtn.addEventListener("click", () => {
      showViewerLoading();
      const currentSrc = viewer.getAttribute("src") || "";
      viewer.setAttribute("src", "");
      requestAnimationFrame(() => {
        viewer.setAttribute("src", currentSrc);
      });
    });

    viewer.addEventListener("load", hideViewerLoading);
    viewer.addEventListener("error", showViewerError);

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    this.trap3dFocus = (event) => {
      const focusables = Array.from(
        overlay.querySelectorAll(focusableSelector),
      );
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!overlay.contains(active)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", this.on3dOverlayKeydown);
    panel.focus();

    let activeModelPath = defaultVersion.path;
    let activeFilter = "all";
    let searchTerm = "";

    const applyVersionToViewer = (version, visibleCount) => {
      if (!version) return;
      activeModelPath = version.path;
      this.setViewerAnimationState(viewer, Boolean(version.isAnimated));
      showViewerLoading();
      viewer.setAttribute("src", this.encodeModelAssetPath(version.path));
      this.updateThreeDModelStatus(
        overlay,
        version.label || "Padrao",
        Boolean(version.isAnimated),
        visibleCount,
        versions.length,
      );
    };

    const getVisibleVersions = () => {
      return versions.filter((version) => {
        const matchesFilter =
          activeFilter === "all" || version.type === activeFilter;
        const normalizedSearch = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !normalizedSearch || version.searchText.includes(normalizedSearch);
        return matchesFilter && matchesSearch;
      });
    };

    const renderVersionButtons = () => {
      const visibleVersions = getVisibleVersions();
      const nextSelected =
        visibleVersions.find((version) => version.path === activeModelPath) ||
        visibleVersions[0] ||
        null;

      versionsContainer.innerHTML = visibleVersions
        .map(
          (version) => `
            <button
              class="three-d-version-btn ${version.path === (nextSelected && nextSelected.path) ? "active" : ""} ${version.isAnimated ? "is-animated" : ""}"
              data-model-id="${version.id}"
              type="button"
            >
              <span class="three-d-version-thumb" aria-hidden="true">
                ${
                  version.thumbnail
                    ? `<img src="${version.thumbnail}" alt="" loading="lazy" decoding="async" />`
                    : '<span class="three-d-version-thumb-fallback"></span>'
                }
              </span>
              <span class="three-d-version-content">
                <span class="three-d-version-label">${version.label}</span>
                <span class="three-d-version-kind">${version.type}</span>
              </span>
              ${version.isAnimated ? '<span class="three-d-version-tag">animado</span>' : ""}
            </button>
          `,
        )
        .join("");

      emptyState.classList.toggle("is-hidden", visibleVersions.length > 0);

      if (!nextSelected) {
        this.updateThreeDModelStatus(
          overlay,
          "Sem resultado",
          false,
          0,
          versions.length,
        );
        return;
      }

      applyVersionToViewer(nextSelected, visibleVersions.length);

      versionsContainer
        .querySelectorAll(".three-d-version-btn")
        .forEach((btn, _idx, all) => {
          btn.addEventListener("click", () => {
            const versionId = btn.dataset.modelId;
            const selectedVersion = versions.find(
              (version) => version.id === versionId,
            );
            if (!selectedVersion) return;
            applyVersionToViewer(selectedVersion, visibleVersions.length);
            all.forEach((otherBtn) => otherBtn.classList.remove("active"));
            btn.classList.add("active");
          });
        });
    };

    filterGroup.querySelectorAll(".three-d-filter-btn").forEach((filterBtn) => {
      filterBtn.addEventListener("click", () => {
        activeFilter = filterBtn.dataset.filter || "all";
        filterGroup
          .querySelectorAll(".three-d-filter-btn")
          .forEach((btn) => btn.classList.remove("active"));
        filterBtn.classList.add("active");
        renderVersionButtons();
      });
    });

    searchInput.addEventListener("input", () => {
      searchTerm = searchInput.value || "";
      renderVersionButtons();
    });

    showViewerLoading();
    renderVersionButtons();
  }
  async init() {
    console.log("🚀 Inicializando Nexus Universe 13/10...");

    await this.preloadFirstFourImages();

    this.cacheElements();
    this.applySpaceModeState();
    this.hideBattle2dPage();
    this.setupEventListeners();
    this.renderFilters();
    this.renderAllCharacters();
    this.updateStats();
    this.setCurrentYear();
    this.setupSortOptions();
    this.initScrollAnimations();
    this.setupIntersectionObserver();
    this.setupMenuToggle();

    this.handlePageRefresh();

    console.log("✅ Nexus Universe 13/10 inicializado!");
  }

  handlePageRefresh() {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    this.forceScrollTopImmediate();

    window.addEventListener("beforeunload", () => {
      this.forceScrollTopImmediate();
    });
  }

  setupMenuToggle() {
    const menuToggle = document.getElementById("menuToggle");
    const controlButtons = document.getElementById("controlButtonsContainer");

    if (menuToggle && controlButtons) {
      menuToggle.addEventListener("click", () => {
        const isVisible = controlButtons.classList.contains("show");

        if (isVisible) {
          controlButtons.classList.remove("show");
          menuToggle.setAttribute("aria-label", "Abrir menu de controles");
          menuToggle.innerHTML =
            '<i class="fas fa-bars" aria-hidden="true"></i>';
        } else {
          controlButtons.classList.add("show");
          menuToggle.setAttribute("aria-label", "Fechar menu de controles");
          menuToggle.innerHTML =
            '<i class="fas fa-times" aria-hidden="true"></i>';
        }

        this.audio.play("click");
      });

      // Fechar menu ao clicar em qualquer botão de controle
      document
        .querySelectorAll(".control-buttons-container .quantum-control-btn")
        .forEach((btn) => {
          btn.addEventListener("click", () => {
            controlButtons.classList.remove("show");
            menuToggle.setAttribute("aria-label", "Abrir menu de controles");
            menuToggle.innerHTML =
              '<i class="fas fa-bars" aria-hidden="true"></i>';
          });
        });
    }
  }

  async preloadFirstFourImages() {
    console.log("🔥 Pré-carregando as primeiras 4 imagens...");
    const firstFour = charactersData.slice(0, 4);
    const promises = firstFour.map(async (character) => {
      try {
        const startTime = performance.now();
        await this.cache.cacheImage(character.image);
        const loadTime = performance.now() - startTime;
        console.log(`✅ ${character.name}: ${loadTime.toFixed(0)}ms`);
        return true;
      } catch (error) {
        console.warn(
          `⚠️ Falha ao pré-carregar ${character.name}: ${character.image}`,
        );
        return false;
      }
    });

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value,
    ).length;
    console.log(`📊 ${successCount}/4 imagens pré-carregadas com sucesso`);
  }

  cacheElements() {
    this.elements = {
      filterMatrix: document.getElementById("filterMatrix"),
      showMoreFilters: document.getElementById("showMoreFilters"),
      sortQuantum: document.getElementById("sortQuantum"),
      sortOptionsQuantum: document.getElementById("sortOptionsQuantum"),
      sortText: document.querySelector(".sort-text"),
      resetQuantum: document.getElementById("resetQuantum"),
      resetEmptyFilters: document.getElementById("resetEmptyFilters"),
      loadingState: document.getElementById("loadingState"),
      emptyState: document.getElementById("emptyState"),
      quantumGrid: document.getElementById("quantumGrid"),
      firstBtn: document.getElementById("firstBtn"),
      prevBtn: document.getElementById("prevBtn"),
      nextBtn: document.getElementById("nextBtn"),
      lastBtn: document.getElementById("lastBtn"),
      quantumInput: document.getElementById("quantumInput"),
      totalPages: document.getElementById("totalPages"),
      totalCharacters: document.getElementById("totalCharacters"),
      visibleCharacters: document.getElementById("visibleCharacters"),
      totalCategories: document.getElementById("totalCategories"),
      currentPageDisplay: document.getElementById("currentPageDisplay"),
      quantumModal: document.getElementById("quantumModal"),
      modalClose: document.getElementById("modalClose"),
      modalContent: document.getElementById("modalContent"),
      quantumToast: document.getElementById("quantumToast"),
      quantumJump: document.getElementById("quantumJump"),
      soundToggle: document.getElementById("soundToggle"),
      soundIcon: document.getElementById("soundIcon"),
      homeToggle: document.getElementById("homeToggle"),
      favoritesToggle: document.getElementById("favoritesToggle"),
      quantumUniverse: document.getElementById("quantumUniverse"),
      quantumFavoritesPage: document.getElementById("quantumFavoritesPage"),
      quantumModelsPage: document.getElementById("quantumModelsPage"),
      quantumBattlePage: document.getElementById("quantumBattlePage"),
      quantumBattle2dPage: document.getElementById("quantumBattle2dPage"),
      viewFavoritesBtn: document.getElementById("viewFavoritesBtn"),
      viewModelsBtn: document.getElementById("viewModelsBtn"),
      viewBattleBtn: document.getElementById("viewBattleBtn"),
      viewSearchBtn: document.getElementById("viewSearchBtn"),
      backToGallery: document.getElementById("backToGallery"),
      backToGalleryFromModels: document.getElementById(
        "backToGalleryFromModels",
      ),
      favoritesCountTerminal: document.getElementById("favoritesCountTerminal"),
      modelsCountTerminal: document.getElementById("modelsCountTerminal"),
      modelsGrid: document.getElementById("modelsGrid"),
      modelsEmpty: document.getElementById("modelsEmpty"),
      modelsTotalCount: document.getElementById("modelsTotalCount"),
      modelsVersionsCount: document.getElementById("modelsVersionsCount"),
      modelsCategoriesCount: document.getElementById("modelsCategoriesCount"),
      modelsResultCount: document.getElementById("modelsResultCount"),
      modelsSearchInput: document.getElementById("modelsSearchInput"),
      modelsCategoryFilter: document.getElementById("modelsCategoryFilter"),
      modelsSortSelect: document.getElementById("modelsSortSelect"),
      modelsOnlyAnimated: document.getElementById("modelsOnlyAnimated"),
      searchModal: document.getElementById("searchModal"),
      searchToggle: document.getElementById("searchToggle"),
      searchClose: document.getElementById("searchClose"),
      searchInput: document.getElementById("searchInput"),
      searchResults: document.getElementById("searchResults"),
      spaceToggle: document.getElementById("spaceToggle"),
      battleToggle: document.getElementById("battleToggle"),
      menuToggle: document.getElementById("menuToggle"),
      controlButtonsContainer: document.getElementById(
        "controlButtonsContainer",
      ),
    };
  }

  setSectionVisibility(element, visible, options = {}) {
    if (!element) return;

    const { display = "block", activeClass = false } = options;
    element.style.display = visible ? display : "none";
    element.style.opacity = visible ? "1" : "0";
    element.style.visibility = visible ? "visible" : "hidden";
    element.setAttribute("aria-hidden", visible ? "false" : "true");

    if (activeClass) {
      element.classList.toggle("active", visible);
    }

    if (visible) {
      element.removeAttribute("hidden");
      return;
    }

    element.setAttribute("hidden", "");
  }

  forceScrollTopImmediate() {
    const html = document.documentElement;
    const previousInlineScrollBehavior = html.style.scrollBehavior;

    html.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
    document.body.scrollTop = 0;
    html.scrollTop = 0;

    if (previousInlineScrollBehavior) {
      html.style.scrollBehavior = previousInlineScrollBehavior;
    } else {
      html.style.removeProperty("scroll-behavior");
    }
  }

  runPageTransition(switchPageCallback) {
    if (typeof switchPageCallback !== "function") return;

    this.preparePageTransition();
    switchPageCallback();
    this.forceScrollTopImmediate();
  }

  getActivePageContainer() {
    if (this.state.showFavoritesPage) return this.elements.quantumFavoritesPage;
    if (this.state.showModelsPage) return this.elements.quantumModelsPage;
    if (this.state.showBattlePage) return this.elements.quantumBattlePage;
    if (this.state.showBattle2dPage) return this.elements.quantumBattle2dPage;
    return this.elements.quantumUniverse;
  }

  closeControlMenu() {
    const controlButtons = this.elements.controlButtonsContainer;
    const menuToggle = this.elements.menuToggle;
    if (!controlButtons || !menuToggle) return;

    controlButtons.classList.remove("show");
    menuToggle.setAttribute("aria-label", "Abrir menu de controles");
    menuToggle.innerHTML = '<i class="fas fa-bars" aria-hidden="true"></i>';
  }

  applySpaceModeState() {
    const spaceToggle = this.elements.spaceToggle;
    document.body.classList.toggle("space-only-mode", this.state.isSpaceMode);

    if (!spaceToggle) return;

    const iconClass = this.state.isSpaceMode ? "fa-eye-slash" : "fa-star";
    spaceToggle.classList.toggle("active", this.state.isSpaceMode);
    spaceToggle.setAttribute("aria-pressed", String(this.state.isSpaceMode));
    spaceToggle.setAttribute(
      "aria-label",
      this.state.isSpaceMode
        ? "Sair do modo visualizacao do espaco"
        : "Visualizar apenas o espaco",
    );
    spaceToggle.innerHTML = `<i class="fas ${iconClass}" aria-hidden="true"></i>`;
  }

  toggleSpaceMode() {
    this.state.isSpaceMode = !this.state.isSpaceMode;

    if (this.state.isSpaceMode) {
      this.preparePageTransition();
      this.closeControlMenu();
    }

    this.applySpaceModeState();
  }

  preparePageTransition() {
    if (this.state.isModalOpen) {
      this.closeModal();
    }

    if (this.state.isSearchModalOpen) {
      this.closeSearchModal();
    }

    const themeModal = document.getElementById("themeModal");
    if (themeModal && themeModal.classList.contains("show")) {
      this.themeSystem.closeThemeModal();
    }

    const characterSelector = document.getElementById("characterSelectorModal");
    if (characterSelector && characterSelector.classList.contains("show")) {
      this.battleSystem.closeCharacterSelector();
    }

    const battleAnimation = document.getElementById("battleAnimationContainer");
    if (battleAnimation && battleAnimation.classList.contains("active")) {
      this.battleSystem.skipAnimation();
    }

    const battleResultModal = document.getElementById("battleResultModal");
    if (battleResultModal && battleResultModal.classList.contains("active")) {
      this.battleSystem.closeResultModal();
    }

    const historyDetailModal = document.getElementById("historyDetailModal");
    if (historyDetailModal && historyDetailModal.classList.contains("active")) {
      this.battleSystem.closeHistoryDetail();
    }

    this.closeControlMenu();
  }

  hideBattle2dPage() {
    const battle2dPage = this.elements.quantumBattle2dPage;
    if (!battle2dPage) return;

    this.setSectionVisibility(battle2dPage, false, { activeClass: true });
    this.state.showBattle2dPage = false;

    const battle2dControls = document.getElementById("battle2dControls");
    if (battle2dControls) {
      battle2dControls.style.display = "block";
    }

    const battle2dArena = document.getElementById("battle2dArena");
    if (battle2dArena) {
      battle2dArena.style.display = "none";
    }

    this.battle2D?.stopGame?.();
  }

  setupEventListeners() {
    const debounce = (func, wait) => {
      return (...args) => {
        clearTimeout(this.config.scrollDebounce);
        this.config.scrollDebounce = setTimeout(
          () => func.apply(this, args),
          wait,
        );
      };
    };

    if (this.elements.filterMatrix) {
      this.elements.filterMatrix.addEventListener("click", (e) => {
        const filter = e.target.closest(".filter-quantum");
        if (filter && filter.dataset.category) {
          const category = filter.dataset.category;
          this.setCategory(category);
          this.audio.play("click");
          this.closeExtraFilters();
          this.scrollToCardsSection();
        }
      });
    }

    if (this.elements.showMoreFilters) {
      this.elements.showMoreFilters.addEventListener("click", () => {
        this.toggleMoreFilters();
        this.audio.play("click");
      });
    }

    if (this.elements.sortQuantum) {
      this.elements.sortQuantum.addEventListener("click", () => {
        const isShowing =
          this.elements.sortOptionsQuantum.style.display === "block";
        this.elements.sortOptionsQuantum.style.display = isShowing
          ? "none"
          : "block";
        this.elements.sortQuantum.setAttribute("aria-expanded", !isShowing);
        this.audio.play("click");
      });
    }

    if (this.elements.resetQuantum) {
      this.elements.resetQuantum.addEventListener("click", () => {
        this.resetFilters();
        this.audio.play("click");
      });
    }

    if (this.elements.resetEmptyFilters) {
      this.elements.resetEmptyFilters.addEventListener("click", () => {
        this.resetFilters();
        this.audio.play("click");
      });
    }

    if (this.elements.firstBtn) {
      this.elements.firstBtn.addEventListener("click", () => {
        this.goToPage(1);
        this.audio.play("click");
      });
    }

    if (this.elements.prevBtn) {
      this.elements.prevBtn.addEventListener("click", () => {
        this.goToPage(this.state.currentPage - 1);
        this.audio.play("click");
      });
    }

    if (this.elements.nextBtn) {
      this.elements.nextBtn.addEventListener("click", () => {
        this.goToPage(this.state.currentPage + 1);
        this.audio.play("click");
      });
    }

    if (this.elements.lastBtn) {
      this.elements.lastBtn.addEventListener("click", () => {
        this.goToPage(this.getTotalPages());
        this.audio.play("click");
      });
    }

    if (this.elements.quantumInput) {
      this.elements.quantumInput.addEventListener("change", (e) => {
        const page = parseInt(e.target.value);
        if (page >= 1 && page <= this.getTotalPages()) {
          this.goToPage(page);
        } else {
          this.elements.quantumInput.value = this.state.currentPage;
          this.showToast("FREQUÊNCIA INVÁLIDA");
        }
      });
    }

    if (this.elements.modalClose) {
      this.elements.modalClose.addEventListener("click", () => {
        this.closeModal();
        this.audio.play("click");
      });
    }

    if (this.elements.soundToggle) {
      this.elements.soundToggle.addEventListener("click", () => {
        const enabled = this.audio.toggle();
        const icon = this.elements.soundIcon;
        icon.className = enabled ? "fas fa-volume-up" : "fas fa-volume-mute";
        this.showToast(
          enabled ? "🔊 SONS ATIVADOS" : "🔇 SONS DESATIVADOS",
        );
        if (enabled) this.audio.play("click");
      });
    }

    // NOVO: Botão Início
    if (this.elements.homeToggle) {
      this.elements.homeToggle.addEventListener("click", () => {
        this.showGalleryPage();
        this.audio.play("click");
      });
    }

    if (this.elements.favoritesToggle) {
      this.elements.favoritesToggle.addEventListener("click", () => {
        this.showFavoritesPage();
        this.audio.play("click");
      });
    }

    if (this.elements.viewFavoritesBtn) {
      this.elements.viewFavoritesBtn.addEventListener("click", () => {
        this.showFavoritesPage();
        this.audio.play("click");
      });
    }

    if (this.elements.viewModelsBtn) {
      this.elements.viewModelsBtn.addEventListener("click", () => {
        this.showModelsPage();
        this.audio.play("click");
      });
    }

    if (this.elements.viewSearchBtn) {
      this.elements.viewSearchBtn.addEventListener("click", () => {
        this.openSearchModal();
      });
    }

    if (this.elements.searchToggle) {
      this.elements.searchToggle.addEventListener("click", () => {
        this.openSearchModal();
      });
    }

    if (this.elements.spaceToggle) {
      this.elements.spaceToggle.addEventListener("click", () => {
        this.toggleSpaceMode();
        this.audio.play("click");
      });
    }

    if (this.elements.searchClose) {
      this.elements.searchClose.addEventListener("click", () => {
        this.closeSearchModal();
        this.audio.play("click");
      });
    }

    if (this.elements.searchInput) {
      this.elements.searchInput.addEventListener(
        "input",
        debounce((e) => {
          this.handleSearchInput(e.target.value);
        }, 300),
      );

      this.elements.searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const results = this.elements.searchResults.querySelectorAll(
            ".search-result-item",
          );
          if (results.length > 0) {
            results[0].click();
          }
        }
      });
    }

    if (this.elements.backToGallery) {
      this.elements.backToGallery.addEventListener("click", () => {
        this.showGalleryPage();
        this.audio.play("click");
      });
    }

    if (this.elements.backToGalleryFromModels) {
      this.elements.backToGalleryFromModels.addEventListener("click", () => {
        this.showGalleryPage();
        this.audio.play("click");
      });
    }

    if (this.elements.modelsSearchInput) {
      this.elements.modelsSearchInput.addEventListener(
        "input",
        debounce((event) => {
          this.state.modelsSearchTerm = event.target.value || "";
          if (this.state.showModelsPage) this.renderModelsPage();
        }, 180),
      );
    }

    if (this.elements.modelsCategoryFilter) {
      this.elements.modelsCategoryFilter.addEventListener("change", (event) => {
        this.state.modelsCategory = event.target.value || "all";
        if (this.state.showModelsPage) this.renderModelsPage();
      });
    }

    if (this.elements.modelsSortSelect) {
      this.elements.modelsSortSelect.addEventListener("change", (event) => {
        this.state.modelsSort = event.target.value || "versions-desc";
        if (this.state.showModelsPage) this.renderModelsPage();
      });
    }

    if (this.elements.modelsOnlyAnimated) {
      this.elements.modelsOnlyAnimated.addEventListener("change", (event) => {
        this.state.modelsOnlyAnimated = Boolean(event.target.checked);
        if (this.state.showModelsPage) this.renderModelsPage();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (this.state.isModalOpen) this.closeModal();
        if (this.state.isSearchModalOpen) this.closeSearchModal();
        if (document.getElementById("themeModal").classList.contains("show")) {
          this.themeSystem.closeThemeModal();
        }
        if (
          document
            .getElementById("characterSelectorModal")
            .classList.contains("show")
        ) {
          this.battleSystem.closeCharacterSelector();
        }
        if (
          document
            .getElementById("battleAnimationContainer")
            .classList.contains("active")
        ) {
          this.battleSystem.skipAnimation();
        }
        if (
          document
            .getElementById("battleResultModal")
            .classList.contains("active")
        ) {
          this.battleSystem.closeResultModal();
        }
      }

      // Atalho Ctrl+F ou Cmd+F para pesquisa
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        this.openSearchModal();
      }

      // Atalho Ctrl+B ou Cmd+B para batalha
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        this.battleSystem.showBattlePage();
      }

      // Atalho Ctrl+M ou Cmd+M para menu
      if ((e.ctrlKey || e.metaKey) && e.key === "m") {
        e.preventDefault();
        document.getElementById("menuToggle").click();
      }
    });

    document.addEventListener("click", (e) => {
      if (this.state.isModalOpen && e.target === this.elements.quantumModal) {
        this.closeModal();
      }
      if (
        this.state.isSearchModalOpen &&
        e.target === this.elements.searchModal
      ) {
        this.closeSearchModal();
      }
    });

    if (this.elements.quantumJump) {
      this.elements.quantumJump.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        this.audio.play("click");
      });
    }

    window.addEventListener(
      "scroll",
      debounce(() => {
        this.toggleQuantumJump();
        this.animateOnScroll();
        this.maybeLoadMoreCardsOnScroll();
      }, 50),
    );

    document.addEventListener("click", (e) => {
      if (this.elements.sortQuantum && this.elements.sortOptionsQuantum) {
        if (
          !e.target.closest(".sort-quantum") &&
          !e.target.closest("#sortOptionsQuantum")
        ) {
          this.elements.sortOptionsQuantum.style.display = "none";
          this.elements.sortQuantum.setAttribute("aria-expanded", "false");
        }
      }
    });
  }

  closeExtraFilters() {
    const hiddenFilters = document.querySelectorAll(
      ".filter-quantum.hidden-filter",
    );
    const showMoreBtn = this.elements.showMoreFilters;

    if (hiddenFilters.length === 0 && showMoreBtn) {
      this.toggleMoreFilters();
    }
  }

  setupIntersectionObserver() {
    if ("IntersectionObserver" in window) {
      this.config.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target.querySelector("img");
              if (img && img.dataset.src) {
                this.loadImage(img);
                this.config.intersectionObserver.unobserve(entry.target);
              }
            }
          });
        },
        {
          rootMargin: "200px",
          threshold: 0.01,
        },
      );
    }
  }

  async loadImage(imgElement) {
    const src = imgElement.dataset.src;
    if (!src) return;

    try {
      const img = await this.cache.cacheImage(src);
      if (img) {
        imgElement.src = img.src;
        imgElement.removeAttribute("data-src");
        imgElement.classList.add("loaded");
      }
    } catch (error) {
      console.warn(`Não foi possível carregar: ${src}`);
      imgElement.classList.add("error");
    }
  }

  renderFilters() {
    if (!this.elements.filterMatrix) return;

    const categories = [
      ...new Set(charactersData.map((char) => char.category)),
    ];
    categories.sort();

    const allButton = this.createFilterButton(
      "all",
      "TODO O MULTIVERSO",
      charactersData.length,
      true,
    );
    this.elements.filterMatrix.appendChild(allButton);

    const maxVisibleFilters = 16;
    const maxCategories = maxVisibleFilters - 1;

    categories.forEach((category, index) => {
      const count = charactersData.filter(
        (char) => char.category === category,
      ).length;
      const button = this.createFilterButton(
        category,
        categoryNames[category] || category,
        count,
        false,
      );

      if (index >= maxCategories) {
        button.classList.add("hidden-filter");
      }

      this.elements.filterMatrix.appendChild(button);
    });

    if (categories.length > maxCategories && this.elements.showMoreFilters) {
      this.elements.showMoreFilters.style.display = "block";
    }

    if (this.elements.totalCategories) {
      this.elements.totalCategories.textContent = categories.length + 1;
    }
  }

  createFilterButton(category, label, count, isActive) {
    const button = document.createElement("button");
    button.className = `filter-quantum ${isActive ? "active" : ""}`;
    button.dataset.category = category;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", isActive);
    button.setAttribute("aria-label", `Filtrar por ${label}`);
    button.innerHTML = `
      <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 15px;">${label}</div>
      <span class="filter-badge">${count}</span>
    `;
    return button;
  }

  toggleMoreFilters() {
    const allFilters = document.querySelectorAll(".filter-quantum");
    const showMoreBtn = this.elements.showMoreFilters;

    const hasHidden = Array.from(allFilters).some((filter) =>
      filter.classList.contains("hidden-filter"),
    );

    if (hasHidden) {
      allFilters.forEach((filter) => {
        filter.classList.remove("hidden-filter");
      });
      showMoreBtn.innerHTML =
        '<i class="fas fa-chevron-up" aria-hidden="true"></i> MOSTRAR MENOS CATEGORIAS';
      showMoreBtn.setAttribute("aria-label", "Mostrar menos categorias");
    } else {
      allFilters.forEach((filter, index) => {
        if (index >= 12) {
          filter.classList.add("hidden-filter");
        }
      });
      showMoreBtn.innerHTML =
        '<i class="fas fa-chevron-down" aria-hidden="true"></i> MOSTRAR MAIS CATEGORIAS';
      showMoreBtn.setAttribute("aria-label", "Mostrar mais categorias");
    }
  }

  async renderAllCharacters() {
    if (this.elements.loadingState) {
      this.elements.loadingState.style.display = "flex";
      this.elements.loadingState.removeAttribute("hidden");
    }

    if (this.elements.emptyState) {
      this.elements.emptyState.classList.remove("show");
      this.elements.emptyState.setAttribute("hidden", "");
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    this.filterAndSort();

    if (this.elements.loadingState) {
      this.elements.loadingState.style.display = "none";
      this.elements.loadingState.setAttribute("hidden", "");
    }
  }

  filterAndSort() {
    if (this.state.currentCategory === "all") {
      this.state.filteredCharacters = [...charactersData];
    } else {
      this.state.filteredCharacters = charactersData.filter(
        (char) => char.category === this.state.currentCategory,
      );
    }

    this.sortCharacters();
    this.renderCharacters();

    if (this.elements.emptyState) {
      if (this.state.filteredCharacters.length === 0) {
        this.elements.emptyState.classList.add("show");
        this.elements.emptyState.removeAttribute("hidden");
      } else {
        this.elements.emptyState.classList.remove("show");
        this.elements.emptyState.setAttribute("hidden", "");
      }
    }
  }

  sortCharacters() {
    switch (this.state.currentSort) {
      case "original":
        this.state.filteredCharacters.sort((a, b) => a.id - b.id);
        break;
      case "name-asc":
        this.state.filteredCharacters.sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        break;
      case "name-desc":
        this.state.filteredCharacters.sort((a, b) =>
          b.name.localeCompare(a.name),
        );
        break;
      case "category-asc":
        this.state.filteredCharacters.sort((a, b) =>
          (categoryNames[a.category] || a.category).localeCompare(
            categoryNames[b.category] || b.category,
          ),
        );
        break;
      case "category-desc":
        this.state.filteredCharacters.sort((a, b) =>
          (categoryNames[b.category] || b.category).localeCompare(
            categoryNames[a.category] || a.category,
          ),
        );
        break;
      case "random":
        this.state.filteredCharacters.sort(() => Math.random() - 0.5);
        break;
    }
  }

  async renderCharacters() {
    if (!this.elements.quantumGrid) return;

    const totalPages = this.getTotalPages();
    const startIndex = (this.state.currentPage - 1) * this.config.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.config.itemsPerPage,
      this.state.filteredCharacters.length,
    );
    const charactersToShow = this.state.filteredCharacters.slice(
      startIndex,
      endIndex,
    );

    this.elements.quantumGrid.innerHTML = "";
    this.state.renderQueueCharacters = charactersToShow;
    this.state.renderedCardsCount = 0;

    this.renderNextCardsBatch(this.config.initialCardsBatch);

    this.maybeLoadMoreCardsOnScroll();

    this.updatePagination(totalPages);
    this.updateStats();

    setTimeout(() => this.initScrollAnimations(), 100);
  }

  renderNextCardsBatch(batchSize = 10) {
    if (!this.elements.quantumGrid) return;

    const source = this.state.renderQueueCharacters || [];
    if (!source.length) return;

    const start = this.state.renderedCardsCount;
    const target = Math.min(start + batchSize, source.length);

    for (let index = start; index < target; index++) {
      const character = source[index];
      const card = this.createCharacterCard(character, index);
      this.elements.quantumGrid.appendChild(card);

      setTimeout(
        () => {
          card.classList.add("entering");

          if (!this.viewedCharacters.has(character.id)) {
            this.viewedCharacters.add(character.id);
          }
        },
        (index - start) * 40,
      );

      if (this.config.intersectionObserver && index >= 4) {
        this.config.intersectionObserver.observe(card);
      }
    }

    this.state.renderedCardsCount = target;
  }

  maybeLoadMoreCardsOnScroll() {
    if (!this.elements.quantumGrid) return;

    const source = this.state.renderQueueCharacters || [];
    if (!source.length) return;
    let guard = 0;

    while (this.state.renderedCardsCount < source.length && guard < 4) {
      const gridRect = this.elements.quantumGrid.getBoundingClientRect();
      const nearBottom = gridRect.bottom - window.innerHeight < 260;
      if (!nearBottom) break;

      this.renderNextCardsBatch(this.config.nextCardsBatch);
      guard++;
    }
  }

  createCharacterCard(character, index) {
    const card = document.createElement("article");
    card.className = "quantum-card";
    card.dataset.id = character.id;
    card.dataset.category = character.category;
    card.tabIndex = 0;
    card.setAttribute("role", "article");
    card.setAttribute("aria-labelledby", `card-title-${character.id}`);
    card.setAttribute("aria-describedby", `card-desc-${character.id}`);

    const normalizedPath = this.cache.normalizePath(character.image);
    const isPreloaded = this.cache.imageCache.has(normalizedPath);
    const hasFailed = this.cache.failedImages.has(normalizedPath);
    const isFavorite = this.favorites.isFavorite(character.id);

    const placeholderSVG = this.generatePlaceholderSVG(character, hasFailed);

    const hasCardVideo = !!this.getModalVideoSource(character.id);

    card.innerHTML = `
      <div class="card-quantum-effect" aria-hidden="true"></div>
      ${hasCardVideo ? '<div class="quantum-video-badge" aria-hidden="true"><i class="fas fa-video"></i></div>' : ""}
      <div class="card-quantum-frame" aria-hidden="true"></div>
      <button class="quantum-favorite ${isFavorite ? "active" : ""}" data-id="${character.id}" aria-label="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
        <i class="${isFavorite ? "fas" : "far"} fa-heart" aria-hidden="true"></i>
      </button>
      <div class="quantum-badge" aria-hidden="true">
        ${categoryNames[character.category] || character.category}
      </div>
      <img src="${isPreloaded && !hasFailed ? this.cache.imageCache.get(normalizedPath).src : placeholderSVG}"
        ${!isPreloaded && !hasFailed ? `data-src="${character.image}"` : ""}
        alt="${character.name}"
        class="quantum-image ${isPreloaded ? "preloaded" : ""}"
        ${index < 4 ? 'loading="eager"' : 'loading="lazy"'}
        decoding="async">
      <div class="card-quantum-overlay">
        <h3 id="card-title-${character.id}" class="card-quantum-title">${character.name}</h3>
        <p id="card-desc-${character.id}" class="card-quantum-description">${character.description}</p>
        <div class="quantum-actions">
          <button class="quantum-button view-quantum" data-id="${character.id}"
            aria-label="Analisar ${character.name}">
            <i class="fas fa-expand" aria-hidden="true"></i> ANALISAR
          </button>
          <button class="quantum-button explore-quantum" data-id="${character.id}"
            aria-label="Explorar ${character.name}">
            <i class="fas fa-compass" aria-hidden="true"></i> EXPLORAR
          </button>
        </div>
      </div>
    `;

    if (!isPreloaded && !hasFailed) {
      const img = card.querySelector("img");
      this.loadImage(img);
    }

    const viewBtn = card.querySelector(".view-quantum");
    const exploreBtn = card.querySelector(".explore-quantum");
    const favoriteBtn = card.querySelector(".quantum-favorite");

    viewBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openModal(character);
      this.audio.play("click");
    });

    exploreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.setCategory(character.category);
      this.audio.play("click");
      // ===== ALTERAÇÃO 1: Rolar até a seção de cards após explorar =====
      this.scrollToCardsSection();
    });

    favoriteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = parseInt(e.currentTarget.dataset.id);
      this.favorites.toggleFavorite(id);
      const icon = favoriteBtn.querySelector("i");
      if (this.favorites.isFavorite(id)) {
        icon.className = "fas fa-heart";
        favoriteBtn.classList.add("active");
        this.audio.play("favorite");
      } else {
        icon.className = "far fa-heart";
        favoriteBtn.classList.remove("active");
        this.audio.play("click");
      }
    });

    if (typeof gsap !== "undefined" && !CONFIG.REDUCE_MOTION) {
      gsap.fromTo(
        card,
        { opacity: 0, y: 100, rotationX: 15, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          delay: index * 0.1,
        },
      );
    }

    return card;
  }

  generatePlaceholderSVG(character, hasFailed = false) {
    const colors = {
      "One-Piece": "var(--quantum-primary)",
      "Dragon-Ball": "var(--quantum-warning)",
      Berserk: "var(--quantum-danger)",
      Naruto: "var(--quantum-secondary)",
      HXH: "var(--quantum-accent)",
      kimetsu: "var(--quantum-success)",
      Boku: "#b8b8ff",
      castlevania: "#8a2be2",
      lol: "#ff4500",
      Fullmetal: "#1e90ff",
    };

    const color = colors[character.category] || "var(--quantum-primary)";
    const initials = character.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2);

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="var(--background-primary)" stop-opacity="1"/>
            <stop offset="100%" stop-color="var(--background-secondary)" stop-opacity="1"/>
          </linearGradient>
          <radialGradient id="glow">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#bg)"/>

        <circle cx="200" cy="250" r="100" fill="url(#glow)"/>

        <g transform="translate(200, 250)">
          <circle r="80" fill="${color}" opacity="0.1"/>
          <text y="10" text-anchor="middle" fill="${color}" font-family="Arial" font-size="36" font-weight="bold">
            ${initials}
          </text>
        </g>

        <text x="200" y="380" text-anchor="middle" fill="var(--text-secondary)" font-family="Arial" font-size="14" opacity="0.7">
          ${hasFailed ? "IMAGEM NÃO ENCONTRADA" : "CARREGANDO..."}
        </text>

        ${
          !hasFailed
            ? `
                <g transform="translate(200, 250)">
                  <circle r="85" fill="none" stroke="${color}" stroke-width="2" opacity="0.5" stroke-dasharray="4,4">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="3s" repeatCount="indefinite"/>
                  </circle>
                </g>
                `
            : ""
        }
      </svg>
    `)}`;
  }

  getModalVideoSource(characterId) {
    return this.modalVideoByCharacterId[characterId] || null;
  }

  setupModalMediaControls() {
    const modalBody = this.elements.modalContent;
    if (!modalBody) return;

    const imageEl = modalBody.querySelector(".modal-media-image");
    const videoEl = modalBody.querySelector(".modal-character-video");
    const videoToggleBtn = modalBody.querySelector(
      '.modal-media-toggle[data-media="video"]',
    );
    const imageToggleBtn = modalBody.querySelector(
      '.modal-media-toggle[data-media="image"]',
    );
    const playPauseBtn = modalBody.querySelector(
      '[data-media-action="play-pause"]',
    );
    const muteBtn = modalBody.querySelector('[data-media-action="mute"]');

    if (!imageEl || !videoEl || !videoToggleBtn || !imageToggleBtn) return;
    const playClick = () => this.audio.play("click");

    const setActiveMedia = (mediaType) => {
      const isVideo = mediaType === "video";

      imageEl.classList.toggle("is-hidden", isVideo);
      videoEl.classList.toggle("is-hidden", !isVideo);

      imageToggleBtn.classList.toggle("active", !isVideo);
      videoToggleBtn.classList.toggle("active", isVideo);
      imageToggleBtn.setAttribute("aria-pressed", String(!isVideo));
      videoToggleBtn.setAttribute("aria-pressed", String(isVideo));

      if (playPauseBtn) playPauseBtn.disabled = !isVideo;
      if (muteBtn) muteBtn.disabled = !isVideo;

      if (isVideo) {
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            if (playPauseBtn) {
              playPauseBtn.innerHTML = '<i class="fas fa-play"></i> REPRODUZIR';
            }
          });
        }
      } else {
        videoEl.pause();
      }
    };

    const updateVideoButtons = () => {
      if (playPauseBtn) {
        playPauseBtn.innerHTML = videoEl.paused
          ? '<i class="fas fa-play"></i> REPRODUZIR'
          : '<i class="fas fa-pause"></i> PAUSAR';
      }
      if (muteBtn) {
        muteBtn.innerHTML = videoEl.muted
          ? '<i class="fas fa-volume-mute"></i> SEM SOM'
          : '<i class="fas fa-volume-up"></i> COM SOM';
      }
    };

    imageToggleBtn.addEventListener("click", () => {
      setActiveMedia("image");
      playClick();
    });
    videoToggleBtn.addEventListener("click", () => {
      videoEl.currentTime = 0;
      setActiveMedia("video");
      updateVideoButtons();
      playClick();
    });

    if (playPauseBtn) {
      playPauseBtn.addEventListener("click", () => {
        if (videoEl.paused) {
          const playPromise = videoEl.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } else {
          videoEl.pause();
        }
        updateVideoButtons();
        playClick();
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        videoEl.muted = !videoEl.muted;
        updateVideoButtons();
        playClick();
      });
    }

    videoEl.addEventListener("play", updateVideoButtons);
    videoEl.addEventListener("pause", updateVideoButtons);
    videoEl.addEventListener("volumechange", updateVideoButtons);

    videoEl.addEventListener("error", () => {
      videoToggleBtn.disabled = true;
      setActiveMedia("image");
    });

    videoEl.muted = true;
    setActiveMedia("image");
    updateVideoButtons();
  }

  openModal(character) {
    this.state.modalOpenedFromFavorites = false;
    this.openModalInternal(character);
  }

  openModalFromFavorites(character) {
    this.state.modalOpenedFromFavorites = true;
    this.openModalInternal(character);
  }

  openModalInternal(character) {
    if (
      this.state.isModalOpen ||
      !this.elements.modalContent ||
      !this.elements.quantumModal
    )
      return;

    this.state.isModalOpen = true;

    this.state.scrollPositionBeforeModal = window.pageYOffset;

    document.documentElement.style.setProperty(
      "--scroll-top",
      `${this.state.scrollPositionBeforeModal}px`,
    );

    const normalizedPath = this.cache.normalizePath(character.image);
    const cachedImg = this.cache.imageCache.get(normalizedPath);
    const imgSrc = cachedImg ? cachedImg.src : character.image;
    const isFavorite = this.favorites.isFavorite(character.id);
    const modalVideoSrc = this.getModalVideoSource(character.id);
    const hasModalVideo = Boolean(modalVideoSrc);

    this.elements.modalContent.innerHTML = `
      <div class="modal-character-details">
        <div class="modal-character-grid">
          <div class="modal-character-image-container">
            <div class="modal-media-shell">
              <img src="${imgSrc}"
                alt="${character.name}"
                class="modal-character-image modal-media-image"
                onerror="this.onerror=null; this.src='${this.generatePlaceholderSVG(character, true)}';">
              ${
                hasModalVideo
                  ? `
              <video class="modal-character-video is-hidden"
                preload="metadata"
                playsinline
                muted
                poster="${imgSrc}">
                <source src="${modalVideoSrc}" type="video/mp4">
              </video>
              `
                  : ""
              }
            </div>
            ${
              hasModalVideo
                ? `
            <div class="modal-media-controls">
              <button class="modal-media-toggle active" data-media="image" aria-pressed="true">
                <i class="fas fa-image"></i>
                IMAGEM
              </button>
              <button class="modal-media-toggle" data-media="video" aria-pressed="false">
                <i class="fas fa-video"></i>
                VÍDEO
              </button>
              <button class="modal-media-action" data-media-action="play-pause" disabled>
                <i class="fas fa-play"></i>
                REPRODUZIR
              </button>
              <button class="modal-media-action" data-media-action="mute" disabled>
                <i class="fas fa-volume-mute"></i>
                SEM SOM
              </button>
            </div>
            `
                : ""
            }
            <div class="modal-image-tags">
              <span class="modal-category-tag">
                ${categoryNames[character.category] || character.category}
              </span>
              <button class="modal-favorite-btn ${isFavorite ? "active" : ""}" 
                data-id="${character.id}"
                aria-label="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
                <i class="${isFavorite ? "fas" : "far"} fa-heart"></i>
              </button>
            </div>
          </div>
          <div class="modal-character-info">
            <h2 class="modal-character-title">${character.name}</h2>
            <p class="modal-character-description">${character.description}</p>

            <div class="modal-character-specs">
              <h3 class="modal-specs-title">
                <i class="fas fa-chart-network"></i>
                ESPECIFICAÇÕES QUÂNTICAS
              </h3>
              <div class="modal-specs-grid">
                ${Object.entries(character.details || {})
                  .map(
                    ([key, value]) => `
                      <div class="modal-spec-item">
                        <div class="modal-spec-label">${key}</div>
                        <div class="modal-spec-value">${value}</div>
                      </div>
                    `,
                  )
                  .join("")}
              </div>
            </div>

            <div class="modal-character-actions">
              <button class="modal-explore-btn" onclick="window.gallery.setCategory('${character.category}'); window.gallery.scrollToCardsSection();">
                <i class="fas fa-filter"></i>
                EXPLORAR ${categoryNames[character.category]}
              </button>
              <button class="modal-battle-btn ${character.model3d ? "has-model3d" : ""}" onclick="${character.model3d ? `window.gallery.show3dModelByCharacterId(${character.id});` : `window.gallery.battleSystem.openCharacterSelector(1); setTimeout(() => { const selectorGrid = document.getElementById('characterSelectorGrid'); const characterElement = selectorGrid.querySelector('[data-id=\\'${character.id}\\']'); if (characterElement) characterElement.click(); }, 100); window.gallery.closeModal();`}">
                <i class="fas ${character.model3d ? "fa-cube" : "fa-fist-raised"}"></i>
                ${character.model3d ? "VER MODELO 3D" : "SELECIONAR PARA BATALHA"}
              </button>
              <button class="modal-close-btn" onclick="window.gallery.closeModal()">
                <i class="fas fa-times"></i>
                FECHAR ANÁLISE
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const favoriteBtn = this.elements.modalContent.querySelector(
      ".modal-favorite-btn",
    );
    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", () => {
        const id = parseInt(favoriteBtn.dataset.id);
        this.favorites.toggleFavorite(id);
        const icon = favoriteBtn.querySelector("i");
        if (this.favorites.isFavorite(id)) {
          icon.className = "fas fa-heart";
          favoriteBtn.classList.add("active");
          this.audio.play("favorite");
        } else {
          icon.className = "far fa-heart";
          favoriteBtn.classList.remove("active");
          this.audio.play("click");
        }
      });
    }

    if (hasModalVideo) {
      this.setupModalMediaControls();
    }

    this.elements.quantumModal.classList.add("show");
    this.elements.quantumModal.removeAttribute("hidden");
    this.elements.quantumModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    this.elements.modalContent.scrollTop = 0;

    setTimeout(() => {
      this.elements.modalClose.focus();
    }, 100);
  }

  closeModal() {
    if (!this.state.isModalOpen || !this.elements.quantumModal) return;

    const activeVideo = this.elements.modalContent?.querySelector(
      ".modal-character-video",
    );
    if (activeVideo) {
      activeVideo.pause();
      activeVideo.currentTime = 0;
    }

    this.elements.quantumModal.classList.remove("show");
    this.elements.quantumModal.setAttribute("hidden", "");
    this.elements.quantumModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    document.documentElement.style.removeProperty("--scroll-top");

    this.state.isModalOpen = false;

    window.scrollTo(0, this.state.scrollPositionBeforeModal);

    if (this.state.modalOpenedFromFavorites && this.state.showFavoritesPage) {
      this.state.modalOpenedFromFavorites = false;
    }
  }

  openSearchModal() {
    if (
      this.state.isModalOpen ||
      this.state.isSearchModalOpen ||
      !this.elements.searchModal
    )
      return;

    this.state.isSearchModalOpen = true;
    this.elements.searchModal.classList.add("show");
    this.elements.searchModal.removeAttribute("hidden");
    this.elements.searchModal.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      this.elements.searchInput.focus();
    }, 100);

    this.audio.play("search");
  }

  closeSearchModal() {
    if (!this.state.isSearchModalOpen) return;

    this.state.isSearchModalOpen = false;
    this.elements.searchModal.classList.remove("show");
    this.elements.searchModal.setAttribute("hidden", "");
    this.elements.searchModal.setAttribute("aria-hidden", "true");

    this.elements.searchInput.value = "";
    this.elements.searchResults.innerHTML = "";
  }

  async handleSearchInput(query) {
    const resultsContainer = this.elements.searchResults;
    if (!resultsContainer) return;

    if (!query.trim()) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search"></i>
          <h3>DIGITE PARA PESQUISAR</h3>
          <p>Digite o nome de um personagem para iniciar a busca quântica.</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div class="search-no-results">
        <div class="loading-ring" style="width: 60px; height: 60px; margin: 0 auto 20px;"></div>
        <h3>ANALISANDO REALIDADE QUÂNTICA...</h3>
        <p>Buscando correspondências na base de dados.</p>
      </div>
    `;

    await new Promise((resolve) => setTimeout(resolve, 200));

    const results = this.searchSystem.fuzzySearch(query, 15);

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <i class="fas fa-search-minus"></i>
          <h3>NENHUM PERSONAGEM ENCONTRADO</h3>
          <p>Tente digitar o nome de forma diferente ou usar termos mais genéricos.</p>
      </div>
      `;
      return;
    }

    resultsContainer.innerHTML = results
      .map((character) => {
        const normalizedPath = this.cache.normalizePath(character.image);
        const cachedImg = this.cache.imageCache.get(normalizedPath);
        const imgSrc = cachedImg ? cachedImg.src : character.image;
        const isFavorite = this.favorites.isFavorite(character.id);

        return `
          <div class="search-result-item" data-id="${character.id}">
            <img src="${imgSrc}" 
                 alt="${character.originalName}" 
                 class="search-result-image"
                 onerror="this.onerror=null; this.src='${this.generatePlaceholderSVG(
                   character,
                   true,
                 )}';">
            <div class="search-result-info">
              <h3 class="search-result-name">${character.originalName}</h3>
              <div class="search-result-category">${
                categoryNames[character.category] || character.category
              }</div>
              <div class="search-result-match">
                <i class="fas fa-${
                  character.matchType === "exact" ? "check-circle" : "bullseye"
                }"></i>
                ${
                  character.matchType === "exact"
                    ? "Correspondência exata"
                    : "Correspondência aproximada"
                }
              </div>
            </div>
            <button class="search-result-favorite  ${
              isFavorite ? "active" : ""
            }" data-id="${character.id}" aria-label="${
              isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }">
              <i class="${isFavorite ? "fas" : "far"} fa-heart"></i>
            </button>
            <i class="fas fa-chevron-right search-result-arrow" aria-hidden="true"></i>
          </div>
        `;
      })
      .join("");

    resultsContainer.querySelectorAll(".search-result-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.closest(".search-result-favorite")) {
          return;
        }

        const id = parseInt(item.dataset.id);
        const character = charactersData.find((c) => c.id === id);
        if (character) {
          this.closeSearchModal();
          this.openModal(character);
        }
      });
    });

    resultsContainer
      .querySelectorAll(".search-result-favorite")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          this.favorites.toggleFavorite(id);
          const icon = btn.querySelector("i");
          if (this.favorites.isFavorite(id)) {
            icon.className = "fas fa-heart";
            btn.classList.add("active");
            this.audio.play("favorite");
          } else {
            icon.className = "far fa-heart";
            btn.classList.remove("active");
            this.audio.play("click");
          }
        });
      });
  }

  setCategory(category, silent = false) {
    this.state.currentCategory = category;
    this.state.currentPage = 1;

    document
      .querySelectorAll(".filter-quantum[data-category]")
      .forEach((btn) => {
        const isActive = btn.dataset.category === category;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
      });

    this.filterAndSort();
    this.showToast(
      category === "all"
        ? "🌌 EXPLORANDO TODO O MULTIVERSO NEXUS 13/10!"
        : `🔍 FILTRO QUÂNTICO: ${categoryNames[category] || category}`,
    );

    this.closeModal();

    if (!silent) {
      localStorage.setItem("nexus_last_category_13", category);
      localStorage.setItem("nexus_last_page_13", "1");
    }
  }

  setSort(sortType, silent = false) {
    this.state.currentSort = sortType;
    const labels = {
      original: "ORDEM QUÂNTICA",
      "name-asc": "NOME (A-Z)",
      "name-desc": "NOME (Z-A)",
      "category-asc": "CATEGORIA (A-Z)",
      "category-desc": "CATEGORIA (Z-A)",
      random: "ALEATÓRIO QUÂNTICO",
    };

    if (this.elements.sortText) {
      this.elements.sortText.textContent = labels[sortType];
    }

    if (this.elements.sortOptionsQuantum) {
      this.elements.sortOptionsQuantum.style.display = "none";
    }

    if (this.elements.sortQuantum) {
      this.elements.sortQuantum.setAttribute("aria-expanded", "false");
    }

    document.querySelectorAll(".sort-option-quantum").forEach((option) => {
      option.setAttribute("aria-selected", option.dataset.sort === sortType);
    });

    this.filterAndSort();
    this.showToast(`📊 ORDENAÇÃO: ${labels[sortType]}`);

    if (!silent) {
      localStorage.setItem("nexus_last_sort_13", sortType);
    }
  }

  resetFilters() {
    this.state.currentCategory = "all";
    this.state.currentSort = "original";
    this.state.currentPage = 1;

    if (this.elements.sortText) {
      this.elements.sortText.textContent = "ORDEM QUÂNTICA";
    }

    if (this.elements.sortOptionsQuantum) {
      this.elements.sortOptionsQuantum.style.display = "none";
    }

    document
      .querySelectorAll(".filter-quantum[data-category]")
      .forEach((btn) => {
        const isActive = btn.dataset.category === "all";
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
      });

    document.querySelectorAll(".sort-option-quantum").forEach((option) => {
      option.setAttribute("aria-selected", option.dataset.sort === "original");
    });

    this.filterAndSort();
    this.showToast(
      "🔄 REALIDADE REINICIADA • FILTROS QUÂNTICOS RESETADOS 13/10",
    );
    this.closeModal();

    localStorage.setItem("nexus_last_category_13", "all");
    localStorage.setItem("nexus_last_page_13", "1");
    localStorage.setItem("nexus_last_sort_13", "original");
  }

  getTotalPages() {
    return (
      Math.ceil(
        this.state.filteredCharacters.length / this.config.itemsPerPage,
      ) || 1
    );
  }

  goToPage(page, silent = false) {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    this.state.currentPage = page;
    this.renderCharacters();
    this.scrollToCardsSection();

    this.showToast(
      `🚀 SALTO QUÂNTICO: FREQUÊNCIA ${page} DE ${totalPages}`,
    );

    if (!silent) {
      localStorage.setItem("nexus_last_page_13", page.toString());
    }
  }

  scrollToCardsSection() {
    const cardsSection = document.querySelector(".quantum-grid-section");
    if (cardsSection) {
      const cardsSectionTop =
        cardsSection.getBoundingClientRect().top + window.pageYOffset;

      window.scrollTo({
        top: cardsSectionTop - 100,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  updatePagination(totalPages) {
    if (this.elements.totalPages) {
      this.elements.totalPages.textContent = totalPages;
    }

    if (this.elements.quantumInput) {
      this.elements.quantumInput.value = this.state.currentPage;
      this.elements.quantumInput.max = totalPages;
    }

    if (this.elements.firstBtn) {
      this.elements.firstBtn.disabled = this.state.currentPage === 1;
    }

    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = this.state.currentPage === 1;
    }

    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = this.state.currentPage === totalPages;
    }

    if (this.elements.lastBtn) {
      this.elements.lastBtn.disabled = this.state.currentPage === totalPages;
    }
  }

  updateStats() {
    if (this.elements.totalCharacters) {
      this.elements.totalCharacters.textContent = charactersData.length;
    }

    if (this.elements.visibleCharacters) {
      const rendered = this.state.renderedCardsCount || 0;
      const total =
        this.state.renderQueueCharacters?.length ||
        Math.min(
          this.config.itemsPerPage,
          this.state.filteredCharacters.length,
        );
      this.elements.visibleCharacters.textContent =
        total > rendered ? `${rendered}/${total}` : `${total}`;
    }
    if (this.elements.currentPageDisplay) {
      this.elements.currentPageDisplay.textContent = this.state.currentPage;
    }

    document.querySelectorAll(".filter-badge").forEach((span) => {
      const filterBtn = span.closest(".filter-quantum");
      if (filterBtn) {
        const category = filterBtn.dataset.category;
        if (category === "all") {
          span.textContent = charactersData.length;
        } else {
          const count = charactersData.filter(
            (char) => char.category === category,
          ).length;
          span.textContent = count;
        }
      }
    });

    this.favorites.updateFavoritesCount();
    this.favorites.updateTerminalCount();
    this.updateModelsCountTerminal();
  }

  getCharactersWith3DModels() {
    return this.charactersData
      .filter(
        (character) =>
          typeof character.model3d === "string" && character.model3d.trim(),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getModelMetricsForCharacter(character) {
    const versions =
      this.getModelVersionsForCharacter(character, character.model3d) || [];
    const versionsCount = versions.length || 1;
    const animatedCount = versions.filter((version) =>
      Boolean(version?.isAnimated),
    ).length;
    const categoryLabel =
      categoryNames[character.category] || character.category;

    return {
      versionsCount,
      animatedCount,
      categoryLabel,
    };
  }

  populateModelsCategoryFilter(charactersWithModel) {
    const categoryFilter = this.elements.modelsCategoryFilter;
    if (!categoryFilter) return;

    const categories = Array.from(
      new Set(
        charactersWithModel
          .map((character) => character.category)
          .filter(Boolean),
      ),
    ).sort((a, b) => {
      const labelA = categoryNames[a] || a;
      const labelB = categoryNames[b] || b;
      return labelA.localeCompare(labelB);
    });

    const currentValue = this.state.modelsCategory || "all";
    const options = ['<option value="all">Todos os universos</option>'].concat(
      categories.map((category) => {
        const label = categoryNames[category] || category;
        return `<option value="${category}">${label}</option>`;
      }),
    );

    categoryFilter.innerHTML = options.join("");

    const hasCurrentValue =
      categories.includes(currentValue) || currentValue === "all";
    this.state.modelsCategory = hasCurrentValue ? currentValue : "all";
    categoryFilter.value = this.state.modelsCategory;
  }

  getFilteredModelsForPage(charactersWithModel) {
    const normalizedSearch = String(this.state.modelsSearchTerm || "")
      .toLowerCase()
      .trim();
    const selectedCategory = this.state.modelsCategory || "all";
    const onlyAnimated = Boolean(this.state.modelsOnlyAnimated);
    const sortMode = this.state.modelsSort || "versions-desc";

    const mapped = charactersWithModel.map((character) => {
      const metrics = this.getModelMetricsForCharacter(character);
      const versionLabels = (
        this.getModelVersionsForCharacter(character, character.model3d) || []
      )
        .map((version) => String(version?.label || ""))
        .join(" ");

      return {
        character,
        ...metrics,
        searchableText:
          `${character.name} ${metrics.categoryLabel} ${versionLabels}`.toLowerCase(),
      };
    });

    const filtered = mapped.filter((entry) => {
      const matchesSearch =
        !normalizedSearch || entry.searchableText.includes(normalizedSearch);
      const matchesCategory =
        selectedCategory === "all" ||
        entry.character.category === selectedCategory;
      const matchesAnimated = !onlyAnimated || entry.animatedCount > 0;

      return matchesSearch && matchesCategory && matchesAnimated;
    });

    filtered.sort((a, b) => {
      switch (sortMode) {
        case "name-asc":
          return a.character.name.localeCompare(b.character.name);
        case "name-desc":
          return b.character.name.localeCompare(a.character.name);
        case "category-asc":
          return a.categoryLabel.localeCompare(b.categoryLabel);
        case "animated-first":
          if (b.animatedCount !== a.animatedCount) {
            return b.animatedCount - a.animatedCount;
          }
          if (b.versionsCount !== a.versionsCount) {
            return b.versionsCount - a.versionsCount;
          }
          return a.character.name.localeCompare(b.character.name);
        case "versions-desc":
        default:
          if (b.versionsCount !== a.versionsCount) {
            return b.versionsCount - a.versionsCount;
          }
          return a.character.name.localeCompare(b.character.name);
      }
    });

    return filtered;
  }

  updateModelsCountTerminal() {
    const countEl = this.elements.modelsCountTerminal;
    if (!countEl) return;
    countEl.textContent = this.getCharactersWith3DModels().length;
  }

  renderModelsPage() {
    const grid = this.elements.modelsGrid;
    const empty = this.elements.modelsEmpty;
    if (!grid || !empty) return;

    const charactersWithModel = this.getCharactersWith3DModels();
    this.populateModelsCategoryFilter(charactersWithModel);

    const filteredModels = this.getFilteredModelsForPage(charactersWithModel);
    const totalModels = charactersWithModel.length;
    const totalVersions = charactersWithModel.reduce((sum, character) => {
      const metrics = this.getModelMetricsForCharacter(character);
      return sum + metrics.versionsCount;
    }, 0);
    const totalCategories = new Set(
      charactersWithModel.map((character) => character.category),
    ).size;

    if (this.elements.modelsTotalCount) {
      this.elements.modelsTotalCount.textContent = String(totalModels);
    }
    if (this.elements.modelsVersionsCount) {
      this.elements.modelsVersionsCount.textContent = String(totalVersions);
    }
    if (this.elements.modelsCategoriesCount) {
      this.elements.modelsCategoriesCount.textContent = String(totalCategories);
    }
    if (this.elements.modelsResultCount) {
      const visible = filteredModels.length;
      this.elements.modelsResultCount.textContent = `${visible} ${visible === 1 ? "item" : "itens"}`;
    }
    if (this.elements.modelsSortSelect) {
      this.elements.modelsSortSelect.value =
        this.state.modelsSort || "versions-desc";
    }
    if (this.elements.modelsOnlyAnimated) {
      this.elements.modelsOnlyAnimated.checked = Boolean(
        this.state.modelsOnlyAnimated,
      );
    }
    if (this.elements.modelsSearchInput) {
      this.elements.modelsSearchInput.value = this.state.modelsSearchTerm || "";
    }

    if (!filteredModels.length) {
      grid.innerHTML = "";
      grid.style.display = "none";
      empty.removeAttribute("hidden");
      return;
    }

    grid.style.display = "grid";
    empty.setAttribute("hidden", "");
    grid.innerHTML = "";

    filteredModels.forEach((modelEntry) => {
      const card = this.createModelCard(modelEntry);
      grid.appendChild(card);
    });
  }

  createModelCard(modelEntry) {
    const character = modelEntry.character;
    const card = document.createElement("article");
    card.className = "model-card";
    card.dataset.id = character.id;

    const normalizedPath = this.cache.normalizePath(character.image);
    const cachedImg = this.cache.imageCache.get(normalizedPath);
    const imgSrc = cachedImg ? cachedImg.src : character.image;
    const versionsCount = modelEntry.versionsCount;
    const animatedCount = modelEntry.animatedCount;
    const categoryLabel = modelEntry.categoryLabel;
    const badgeTypeLabel = animatedCount > 0 ? "ANIMADO" : "ESTATICO";

    card.innerHTML = `
      <div class="model-card-thumb">
        <img src="${imgSrc}" alt="${character.name}" loading="lazy" />
        <span class="model-card-badge">${categoryLabel}</span>
        <span class="model-card-quality">${badgeTypeLabel}</span>
      </div>
      <div class="model-card-body">
        <h3 class="model-card-name">${character.name}</h3>
        <div class="model-card-meta">
          <span>${versionsCount} ${versionsCount === 1 ? "versao" : "versoes"} 3D</span>
          <span>${animatedCount} ${animatedCount === 1 ? "animada" : "animadas"}</span>
        </div>
        <div class="model-card-actions">
          <button class="quantum-button model-open-3d">
            <i class="fas fa-cube" aria-hidden="true"></i>
            ABRIR MODELO 3D
          </button>
          <button class="quantum-button model-open-details">
            <i class="fas fa-expand" aria-hidden="true"></i>
            VER DETALHES
          </button>
        </div>
      </div>
    `;

    const open3dBtn = card.querySelector(".model-open-3d");
    const detailsBtn = card.querySelector(".model-open-details");

    open3dBtn?.addEventListener("click", () => {
      this.show3dModelByCharacterId(character.id);
      this.audio.play("click");
    });

    detailsBtn?.addEventListener("click", () => {
      this.openModal(character);
      this.audio.play("click");
    });

    return card;
  }

  setupSortOptions() {
    if (!this.elements.sortOptionsQuantum) return;

    const sortOptions = [
      {
        value: "original",
        label: "ORDEM QUÂNTICA ORIGINAL",
        icon: "fa-atom",
      },
      {
        value: "name-asc",
        label: "NOME (A → Z)",
        icon: "fa-sort-alpha-down",
      },
      {
        value: "name-desc",
        label: "NOME (Z → A)",
        icon: "fa-sort-alpha-up",
      },
      {
        value: "category-asc",
        label: "CATEGORIA (A → Z)",
        icon: "fa-layer-group",
      },
      {
        value: "category-desc",
        label: "CATEGORIA (Z → A)",
        icon: "fa-layer-group fa-rotate-180",
      },
      { value: "random", label: "ALEATÓRIO QUÂNTICO", icon: "fa-random" },
    ];

    this.elements.sortOptionsQuantum.innerHTML = sortOptions
      .map(
        (option) => `
          <div class="sort-option-quantum" data-sort="${option.value}"
            onclick="window.gallery.setSort('${option.value}')"
            role="option"
            aria-selected="${this.state.currentSort === option.value}">
            <i class="fas ${option.icon}" style="color: var(--quantum-primary); font-size: 1.2rem;"></i>
            <span>${option.label}</span>
          </div>
        `,
      )
      .join("");
  }

  initScrollAnimations() {
    if (
      typeof gsap !== "undefined" &&
      typeof ScrollTrigger !== "undefined" &&
      !CONFIG.REDUCE_MOTION
    ) {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.batch(".quantum-card", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
            },
          );
        },
        once: true,
      });
    }
  }

  animateOnScroll() {
    const cards = document.querySelectorAll(".quantum-card");
    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
      if (isInView) {
        card.classList.add("animated");
      }
    });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  toggleQuantumJump() {
    if (!this.elements.quantumJump) return;
    if (window.scrollY > 1200) {
      this.elements.quantumJump.classList.add("show");
    } else {
      this.elements.quantumJump.classList.remove("show");
    }
  }

  showToast(message) {
    const toast = document.getElementById("quantumToast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");
    toast.removeAttribute("hidden");

    if (typeof gsap !== "undefined" && !CONFIG.REDUCE_MOTION) {
      gsap.fromTo(
        toast,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      );
    }

    setTimeout(() => {
      if (typeof gsap !== "undefined" && !CONFIG.REDUCE_MOTION) {
        gsap.to(toast, {
          y: 100,
          opacity: 0,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => {
            toast.classList.remove("show");
            toast.setAttribute("hidden", "");
          },
        });
      } else {
        toast.classList.remove("show");
        toast.setAttribute("hidden", "");
      }
    }, 3000);
  }

  setCurrentYear() {
    const yearElement = document.getElementById("currentYear");
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }
  }

  showFavoritesPage() {
    const openFavoritesPage = () => {
      this.state.showFavoritesPage = true;
      this.state.showModelsPage = false;
      this.state.showBattlePage = false;
      this.state.showBattle2dPage = false;

      this.setSectionVisibility(this.elements.quantumUniverse, false);
      this.setSectionVisibility(this.elements.quantumModelsPage, false, {
        activeClass: true,
      });
      this.setSectionVisibility(this.elements.quantumBattlePage, false, {
        activeClass: true,
      });

      this.hideBattle2dPage();

      this.setSectionVisibility(this.elements.quantumFavoritesPage, true, {
        activeClass: true,
      });

      const favoritesIcon = document.getElementById("favoritesIcon");
      if (favoritesIcon) {
        favoritesIcon.className = "fas fa-images";
      }

      document.title = "⭐ FAVORITOS 13/10 | NEXUS UNIVERSE";

      this.favorites.renderFavoritesPage();
      this.forceScrollTopImmediate();
      this.audio.play("click");
      this.showToast("⭐ ACESSANDO COLEÇÃO PESSOAL 13/10");
    };

    this.runPageTransition(openFavoritesPage);
  }

  showModelsPage() {
    const openModelsPage = () => {
      this.state.showFavoritesPage = false;
      this.state.showModelsPage = true;
      this.state.showBattlePage = false;
      this.state.showBattle2dPage = false;

      this.setSectionVisibility(this.elements.quantumUniverse, false);
      this.setSectionVisibility(this.elements.quantumFavoritesPage, false, {
        activeClass: true,
      });
      this.setSectionVisibility(this.elements.quantumBattlePage, false, {
        activeClass: true,
      });

      this.hideBattle2dPage();

      this.setSectionVisibility(this.elements.quantumModelsPage, true, {
        activeClass: true,
      });

      const favoritesIcon = document.getElementById("favoritesIcon");
      if (favoritesIcon) {
        favoritesIcon.className = "fas fa-heart";
      }

      document.title = "CUBOS 3D | NEXUS UNIVERSE";
      this.renderModelsPage();
      this.forceScrollTopImmediate();
      this.audio.play("click");
      this.showToast("CUBOS 3D CARREGADOS");
    };

    this.runPageTransition(openModelsPage);
  }

  showGalleryPage() {
    const openGalleryPage = () => {
      this.state.showFavoritesPage = false;
      this.state.showModelsPage = false;
      this.state.showBattlePage = false;
      this.state.showBattle2dPage = false;

      this.setSectionVisibility(this.elements.quantumUniverse, true);
      this.setSectionVisibility(this.elements.quantumFavoritesPage, false, {
        activeClass: true,
      });
      this.setSectionVisibility(this.elements.quantumModelsPage, false, {
        activeClass: true,
      });
      this.setSectionVisibility(this.elements.quantumBattlePage, false, {
        activeClass: true,
      });

      this.hideBattle2dPage();

      const favoritesIcon = document.getElementById("favoritesIcon");
      if (favoritesIcon) {
        favoritesIcon.className = "fas fa-heart";
      }

      document.title =
        "🌌 NEXUS UNIVERSE 13/10 | Experiência Quântica Definitiva";

      this.forceScrollTopImmediate();
      this.audio.play("click");

      // Atualiza as animações do header se existirem
      if (
        window.quantumHeaderEffects &&
        typeof window.quantumHeaderEffects.refresh === "function"
      ) {
        window.quantumHeaderEffects.refresh();
      }

      this.showToast("🌌 RETORNANDO À GALERIA PRINCIPAL");
    };

    this.runPageTransition(openGalleryPage);
  }

  cleanup() {
    if (this.config.intersectionObserver) {
      this.config.intersectionObserver.disconnect();
    }
    clearTimeout(this.config.scrollDebounce);
  }
}
