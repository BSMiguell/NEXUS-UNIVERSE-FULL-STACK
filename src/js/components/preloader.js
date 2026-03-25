// ===== PRÉ-LOADER OTIMIZADO =====
class QuantumPreloader {
  constructor() {
    this.progress = 0;
    this.cache = new QuantumCache();
    this.init();
  }

  async init() {
    this.setupElements();
    await this.loadCriticalResources();
    this.startLoading();
  }

  setupElements() {
    this.elements = {
      loader: document.getElementById("quantumLoader"),
      progressBar: document.getElementById("progressBar"),
      progressText: document.getElementById("progressText"),
      universe: document.getElementById("quantumUniverse"),
    };
  }

  async loadCriticalResources() {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  }

  startLoading() {
    const steps = [
      { text: "Inicializando sistema quântico 13/10...", progress: 10 },
      { text: "Carregando dados quânticos...", progress: 25 },
      { text: "Estabilizando realidades...", progress: 40 },
      { text: "Ativando filtros...", progress: 55 },
      { text: "Renderizando entidades...", progress: 70 },
      { text: "Otimizando performance...", progress: 85 },
      { text: "Inicializando sistema de batalha...", progress: 92 },
      { text: "Calibrando efeitos 13/10...", progress: 96 },
      { text: "Pronto para explorar!", progress: 100 },
    ];

    let currentStep = 0;

    const loadStep = () => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        this.progress = step.progress;
        this.updateProgress(step.text);

        setTimeout(() => {
          currentStep++;
          loadStep();
        }, 300);
      } else {
        this.completeLoading();
      }
    };

    loadStep();
  }

  updateProgress(message) {
    if (this.elements.progressBar) {
      this.elements.progressBar.style.width = `${this.progress}%`;
    }
    if (this.elements.progressText) {
      this.elements.progressText.textContent = `${message} ${this.progress}%`;
    }
  }

  completeLoading() {
    requestAnimationFrame(() => {
      if (this.elements.loader) {
        this.elements.loader.style.opacity = "0";
        setTimeout(() => {
          this.elements.loader.style.display = "none";
          this.showContent();
        }, 500);
      }
    });
  }

  showContent() {
    if (this.elements.universe) {
      this.elements.universe.style.opacity = "1";
      this.elements.universe.style.visibility = "visible";

      if (typeof gsap !== "undefined" && !CONFIG.REDUCE_MOTION) {
        gsap.fromTo(
          this.elements.universe,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        );
      }

      this.initSystems();
    }
  }

  initSystems() {
    window.gallery = new QuantumGallery(this.cache);
    this.lazyLoadHeavySystems();
  }

  lazyLoadHeavySystems() {
    if (
      CONFIG.USE_THREE_JS &&
      typeof THREE !== "undefined" &&
      CONFIG.SHOW_EFFECTS
    ) {
      scheduleIdleTask(
        () => {
          this.initThreeJS();
        },
        { timeout: 5000 },
      );
    }

    if (CONFIG.USE_PARTICLES && !CONFIG.IS_MOBILE && CONFIG.SHOW_EFFECTS) {
      scheduleIdleTask(
        () => {
          this.initParticles();
        },
        { timeout: 3000 },
      );
    }
  }

  initThreeJS() {
    const canvas = document.getElementById("three-canvas");
    if (!canvas) return;

    try {
      const createCircularSprite = () => {
        const size = 64;
        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = size;
        spriteCanvas.height = size;
        const ctx = spriteCanvas.getContext("2d");
        if (!ctx) return null;

        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          0,
          size / 2,
          size / 2,
          size / 2,
        );
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.95)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        const texture = new THREE.CanvasTexture(spriteCanvas);
        texture.needsUpdate = true;
        return texture;
      };

      const createNebulaSprite = (innerColor, outerColor) => {
        const size = 256;
        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = size;
        spriteCanvas.height = size;
        const ctx = spriteCanvas.getContext("2d");
        if (!ctx) return null;

        const gradient = ctx.createRadialGradient(
          size / 2,
          size / 2,
          12,
          size / 2,
          size / 2,
          size / 2,
        );
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.45, outerColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(spriteCanvas);
        texture.needsUpdate = true;
        return texture;
      };

      const circleSprite = createCircularSprite();
      const nebulaSprites = [
        createNebulaSprite("rgba(0, 255, 234, 0.35)", "rgba(0, 255, 234, 0.08)"),
        createNebulaSprite("rgba(255, 0, 255, 0.32)", "rgba(255, 0, 255, 0.06)"),
        createNebulaSprite("rgba(255, 170, 0, 0.28)", "rgba(255, 170, 0, 0.05)"),
      ].filter(Boolean);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x070912, CONFIG.IS_MOBILE ? 0.012 : 0.009);
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      );
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !CONFIG.IS_MOBILE,
        powerPreference: "high-performance",
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      camera.position.z = 20;

      const spaceExplorer = this.setupSpaceExplorer({
        scene,
        camera,
        canvas,
      });
      const hasSpaceExplorer = Boolean(spaceExplorer);

      const animatedLayers = [];

      const createStarLayer = (count, size, opacity, distance, twinkleRange) => {
        const geometry = new THREE.BufferGeometry();
        const posArray = new Float32Array(count * 3);
        const colorArray = new Float32Array(count * 3);
        const colors = [
          new THREE.Color(0x00ffea),
          new THREE.Color(0xff00ff),
          new THREE.Color(0x00ff9d),
          new THREE.Color(0xffaa00),
          new THREE.Color(0xffffff),
        ];

        for (let i = 0; i < count * 3; i += 3) {
          posArray[i] = (Math.random() - 0.5) * distance;
          posArray[i + 1] = (Math.random() - 0.5) * distance;
          posArray[i + 2] = (Math.random() - 0.5) * distance;

          const chosenColor = colors[Math.floor(Math.random() * colors.length)];
          colorArray[i] = chosenColor.r;
          colorArray[i + 1] = chosenColor.g;
          colorArray[i + 2] = chosenColor.b;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

        const material = new THREE.PointsMaterial({
          size,
          vertexColors: true,
          transparent: true,
          map: circleSprite,
          alphaTest: 0.2,
          opacity,
          blending: THREE.AdditiveBlending,
        });

        const layer = new THREE.Points(geometry, material);
        layer.userData = {
          baseOpacity: opacity,
          twinkleSpeed: Math.random() * 0.6 + 0.2,
          twinkleOffset: Math.random() * Math.PI * 2,
          twinkleRange,
          rotationSpeedX:
            (Math.random() * 0.00018 + 0.00005) * (Math.random() > 0.5 ? 1 : -1),
          rotationSpeedY:
            (Math.random() * 0.00024 + 0.00008) * (Math.random() > 0.5 ? 1 : -1),
        };
        animatedLayers.push(layer);
        return layer;
      };

      const starLayers = [
        createStarLayer(CONFIG.IS_MOBILE ? 350 : 1100, 0.08, 0.55, 52, 0.18),
        createStarLayer(CONFIG.IS_MOBILE ? 180 : 560, 0.15, 0.4, 42, 0.25),
        createStarLayer(CONFIG.IS_MOBILE ? 90 : 280, 0.24, 0.22, 30, 0.32),
      ];
      const dustLayer = createStarLayer(
        CONFIG.IS_MOBILE ? 80 : 220,
        CONFIG.IS_MOBILE ? 0.2 : 0.34,
        0.08,
        26,
        0.08,
      );

      starLayers.forEach((layer) => scene.add(layer));
      scene.add(dustLayer);

      const nebulaClouds = nebulaSprites.map((texture, index) => {
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          opacity: CONFIG.IS_MOBILE ? 0.08 : 0.12,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });

        const sprite = new THREE.Sprite(material);
        const scale = CONFIG.IS_MOBILE ? 30 + index * 8 : 42 + index * 14;
        sprite.scale.set(scale, scale, 1);
        sprite.position.set(
          (Math.random() - 0.5) * 26,
          (Math.random() - 0.5) * 20,
          -20 - index * 6,
        );
        sprite.userData = {
          driftX: (Math.random() - 0.5) * 0.0012,
          driftY: (Math.random() - 0.5) * 0.0009,
          pulseSpeed: Math.random() * 0.35 + 0.2,
          pulseOffset: Math.random() * Math.PI * 2,
          baseOpacity: material.opacity,
        };
        scene.add(sprite);
        return sprite;
      });

      const shootingStarHeadMaterial = new THREE.PointsMaterial({
        size: CONFIG.IS_MOBILE ? 0.12 : 0.16,
        color: 0xffffff,
        transparent: true,
        map: circleSprite,
        alphaTest: 0.2,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      });

      let shootingStar = null;

      const createShootingStar = () => {
        const startX = (Math.random() - 0.5) * 56;
        const startY = 18 + Math.random() * 15;
        const startZ = -10 - Math.random() * 8;

        const headGeometry = new THREE.BufferGeometry();
        const headPositions = new Float32Array(3);
        headPositions[0] = 0;
        headPositions[1] = 0;
        headPositions[2] = 0;
        headGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(headPositions, 3),
        );

        const head = new THREE.Points(
          headGeometry,
          shootingStarHeadMaterial.clone(),
        );

        const tailGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(-2.5, 1.2, -0.5),
        ]);
        const tailMaterial = new THREE.LineBasicMaterial({
          color: 0xbff9ff,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
        });
        const tail = new THREE.Line(tailGeometry, tailMaterial);

        const starGroup = new THREE.Group();
        starGroup.add(head);
        starGroup.add(tail);
        starGroup.position.set(startX, startY, startZ);
        starGroup.userData = {
          velocity: new THREE.Vector3(
            -0.22 - Math.random() * 0.18,
            -0.14 - Math.random() * 0.09,
            0.08 + Math.random() * 0.06,
          ),
          life: 0,
          maxLife: 120 + Math.random() * 70,
        };

        const angle = Math.atan2(
          starGroup.userData.velocity.y,
          starGroup.userData.velocity.x,
        );
        tail.rotation.z = angle;

        scene.add(starGroup);
        return starGroup;
      };

      let elapsed = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        elapsed += 0.016;

        animatedLayers.forEach((layer) => {
          const data = layer.userData;
          const twinkle =
            Math.sin(elapsed * data.twinkleSpeed + data.twinkleOffset) * 0.5 + 0.5;
          layer.material.opacity =
            data.baseOpacity * (1 - data.twinkleRange + twinkle * data.twinkleRange);
          layer.rotation.x += data.rotationSpeedX;
          layer.rotation.y += data.rotationSpeedY;
        });

        nebulaClouds.forEach((cloud) => {
          const data = cloud.userData;
          cloud.position.x += data.driftX;
          cloud.position.y += data.driftY;

          if (Math.abs(cloud.position.x) > 18) data.driftX *= -1;
          if (Math.abs(cloud.position.y) > 14) data.driftY *= -1;

          const pulse = Math.sin(elapsed * data.pulseSpeed + data.pulseOffset) * 0.5 + 0.5;
          cloud.material.opacity = data.baseOpacity * (0.7 + pulse * 0.5);
          cloud.material.rotation += 0.0003;
        });

        if (!shootingStar && Math.random() < (CONFIG.IS_MOBILE ? 0.002 : 0.0035)) {
          shootingStar = createShootingStar();
        }

        if (shootingStar) {
          shootingStar.position.add(shootingStar.userData.velocity);
          shootingStar.userData.life += 1;

          const lifeProgress = shootingStar.userData.life / shootingStar.userData.maxLife;
          const head = shootingStar.children[0];
          const tail = shootingStar.children[1];

          if (head && head.material) head.material.opacity = 1 - lifeProgress;
          if (tail && tail.material) tail.material.opacity = 0.65 * (1 - lifeProgress);

          if (lifeProgress >= 1) {
            scene.remove(shootingStar);
            shootingStar.children.forEach((child) => {
              if (child.geometry) child.geometry.dispose();
              if (child.material) child.material.dispose();
            });
            shootingStar = null;
          }
        }

        if (hasSpaceExplorer && spaceExplorer.isActive) {
          this.animateSpaceExplorer(spaceExplorer, elapsed);
        } else {
          camera.position.x = Math.sin(elapsed * 0.06) * 0.22;
          camera.position.y = Math.cos(elapsed * 0.04) * 0.16;
          camera.lookAt(0, 0, 0);
        }

        renderer.render(scene, camera);
      };

      let resizeTimeout;
      window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }, 250);
      });

      animate();
    } catch (error) {
      console.warn("Three.js nao pode ser inicializado:", error);
    }
  }

  encodeAssetPath(assetPath) {
    if (!assetPath) return assetPath;
    return assetPath
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  }

  setupSpaceExplorer({ scene, camera, canvas }) {
    const supportsExplorer =
      typeof THREE !== "undefined" &&
      typeof THREE.OrbitControls === "function" &&
      typeof THREE.GLTFLoader === "function";

    if (!supportsExplorer) {
      console.warn(
        "Space Explorer indisponivel: OrbitControls/GLTFLoader nao carregados.",
      );
      return null;
    }

    const explorerGroup = new THREE.Group();
    explorerGroup.visible = false;
    scene.add(explorerGroup);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    const keyLight = new THREE.DirectionalLight(0xd7f3ff, 1.1);
    keyLight.position.set(8, 10, 7);
    const rimLight = new THREE.PointLight(0x6fd7ff, 1.8, 80);
    rimLight.position.set(-9, -5, -10);
    explorerGroup.add(ambientLight, keyLight, rimLight);

    const controls = new THREE.OrbitControls(camera, canvas);
    controls.enabled = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = CONFIG.IS_MOBILE ? 0.56 : 0.75;
    controls.zoomSpeed = CONFIG.IS_MOBILE ? 0.58 : 0.9;
    controls.panSpeed = CONFIG.IS_MOBILE ? 0.5 : 0.72;
    controls.minDistance = 4;
    controls.maxDistance = 34;
    controls.enablePan = true;
    controls.maxPolarAngle = Math.PI * 0.94;
    controls.target.set(0, 0, 0);

    const hud = this.createSpaceExplorerHud();
    const labelsContainer = this.createSpaceExplorerLabelLayer();
    const explorer = {
      isActive: false,
      scene,
      camera,
      canvas,
      group: explorerGroup,
      controls,
      hudContainer: hud?.container || null,
      hudStatus: hud?.status || null,
      hudSelected: hud?.selected || null,
      infoCard: hud?.infoCard || null,
      infoName: hud?.infoName || null,
      infoMeta: hud?.infoMeta || null,
      infoDescription: hud?.infoDescription || null,
      labelsContainer,
      models: [],
      interactiveRoots: [],
      pointer: new THREE.Vector2(0, 0),
      raycaster: new THREE.Raycaster(),
      selectedModel: null,
      hoveredModel: null,
      isDraggingModel: false,
      activePointerId: null,
      lastPointerX: 0,
      lastPointerY: 0,
      focusState: null,
      idleCamera: new THREE.Vector3(0, 0, 20),
      explorerCamera: new THREE.Vector3(8.2, 0.75, 12.5),
      explorerTarget: new THREE.Vector3(8.2, -0.95, -10.8),
      canvasHandlers: null,
      modeObserver: null,
      onResize: null,
    };

    this.loadSpaceExplorerModels(explorer);
    this.bindSpaceExplorerInteractions(explorer);
    this.bindSpaceExplorerModeObserver(explorer);

    if (hud?.resetButton) {
      hud.resetButton.addEventListener("click", () => {
        this.resetSpaceExplorerCamera(explorer, true);
      });
    }

    this.syncSpaceExplorerMode(explorer);
    explorer.onResize = () => this.positionSpaceExplorerInfoCard(explorer);
    window.addEventListener("resize", explorer.onResize);
    return explorer;
  }

  createSpaceExplorerHud() {
    const existingHud = document.getElementById("spaceExplorerHud");
    const existingInfoCard =
      document.getElementById("spaceExplorerModelInfo") ||
      existingHud?.querySelector("#spaceExplorerModelInfo") ||
      null;
    if (existingHud) {
      return {
        container: existingHud,
        status: existingHud.querySelector("#spaceExplorerStatus"),
        selected: existingHud.querySelector("#spaceExplorerSelected"),
        infoCard: existingInfoCard,
        infoName:
          document.getElementById("spaceExplorerModelName") ||
          existingHud.querySelector("#spaceExplorerModelName"),
        infoMeta:
          document.getElementById("spaceExplorerModelMeta") ||
          existingHud.querySelector("#spaceExplorerModelMeta"),
        infoDescription:
          document.getElementById("spaceExplorerModelDescription") ||
          existingHud.querySelector("#spaceExplorerModelDescription"),
        resetButton: existingHud.querySelector("#spaceExplorerReset"),
      };
    }

    const container = document.createElement("aside");
    container.id = "spaceExplorerHud";
    container.setAttribute("aria-live", "polite");
    container.innerHTML = `
      <h3>Explorador Espacial 3D</h3>
      <p id="spaceExplorerStatus">Ative o modo espaco para explorar planetas e naves.</p>
      <p id="spaceExplorerSelected">Nenhum modelo selecionado.</p>
      <p class="space-explorer-hint">Arraste no vazio: camera. Arraste no modelo: rotaciona. Duplo clique: foco.</p>
      <button id="spaceExplorerReset" type="button">Resetar camera</button>
    `;

    document.body.appendChild(container);

    const infoCard = document.createElement("section");
    infoCard.className = "space-explorer-model-info";
    infoCard.id = "spaceExplorerModelInfo";
    infoCard.setAttribute("hidden", "");
    infoCard.innerHTML = `
      <h4 id="spaceExplorerModelName"></h4>
      <p id="spaceExplorerModelMeta"></p>
      <p id="spaceExplorerModelDescription"></p>
    `;
    document.body.appendChild(infoCard);

    return {
      container,
      status: container.querySelector("#spaceExplorerStatus"),
      selected: container.querySelector("#spaceExplorerSelected"),
      infoCard,
      infoName: infoCard.querySelector("#spaceExplorerModelName"),
      infoMeta: infoCard.querySelector("#spaceExplorerModelMeta"),
      infoDescription: infoCard.querySelector("#spaceExplorerModelDescription"),
      resetButton: container.querySelector("#spaceExplorerReset"),
    };
  }

  createSpaceExplorerLabelLayer() {
    const existingLayer = document.getElementById("spaceExplorerLabels");
    if (existingLayer) return existingLayer;

    const layer = document.createElement("div");
    layer.id = "spaceExplorerLabels";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    return layer;
  }

  loadSpaceExplorerModels(explorer) {
    if (!explorer) return;

    const loader = new THREE.GLTFLoader();
    if (
      typeof loader.setMeshoptDecoder === "function" &&
      typeof MeshoptDecoder !== "undefined"
    ) {
      loader.setMeshoptDecoder(MeshoptDecoder);
    }

    const modelConfigs = [
      {
        label: "Sol",
        path: "assets/Planet-Modelo3D/Sol.glb",
        targetSize: 5.2,
        position: new THREE.Vector3(0.2, -1.0, -10.2),
        spinSpeed: 0.0018,
        floatAmp: 0.03,
        info: {
          type: "Estrela",
          orbit: "Centro do Sistema Solar",
          note: "Fonte de luz e energia que governa as orbitas planetarias.",
        },
      },
      {
        label: "Terra",
        path: "assets/Planet-Modelo3D/Earth.glb",
        targetSize: 2.05,
        position: new THREE.Vector3(8.45, -0.95, -10.8),
        spinSpeed: 0.0029,
        floatAmp: 0.06,
        info: {
          type: "Planeta Rochoso",
          orbit: "3 planeta do Sistema Solar",
          note: "Unico planeta conhecido com agua liquida estavel na superficie.",
        },
      },
      {
        label: "Mercurio",
        path: "assets/Planet-Modelo3D/Mercury.glb",
        targetSize: 1.2,
        position: new THREE.Vector3(4.05, -1.0, -10.35),
        spinSpeed: 0.0042,
        floatAmp: 0.05,
        info: {
          type: "Planeta Rochoso",
          orbit: "1 planeta do Sistema Solar",
          note: "O menor planeta e o mais proximo do Sol.",
        },
      },
      {
        label: "Venus",
        path: "assets/Planet-Modelo3D/Venus.glb",
        targetSize: 1.85,
        position: new THREE.Vector3(6.15, -1.0, -10.55),
        spinSpeed: 0.0033,
        floatAmp: 0.06,
        info: {
          type: "Planeta Rochoso",
          orbit: "2 planeta do Sistema Solar",
          note: "Atmosfera densa com forte efeito estufa e altas temperaturas.",
        },
      },
      {
        label: "Lua",
        path: "assets/Planet-Modelo3D/Moon.glb",
        targetSize: 0.75,
        position: new THREE.Vector3(9.75, -0.35, -10.35),
        spinSpeed: 0.0052,
        floatAmp: 0.04,
        info: {
          type: "Satelite Natural",
          orbit: "Orbita a Terra",
          note: "Principal satelite natural da Terra e controlador das mares.",
        },
      },
      {
        label: "Marte",
        path: "assets/Planet-Modelo3D/Mars.glb",
        targetSize: 1.45,
        position: new THREE.Vector3(11.15, -1.0, -11.05),
        spinSpeed: 0.0036,
        floatAmp: 0.05,
        info: {
          type: "Planeta Rochoso",
          orbit: "4 planeta do Sistema Solar",
          note: "Conhecido como planeta vermelho por causa do oxido de ferro.",
        },
      },
      {
        label: "Jupiter",
        path: "assets/Planet-Modelo3D/jupiter.glb",
        targetSize: 4.2,
        position: new THREE.Vector3(15.2, -1.1, -11.9),
        spinSpeed: 0.0024,
        floatAmp: 0.05,
        info: {
          type: "Gigante Gasoso",
          orbit: "5 planeta do Sistema Solar",
          note: "Maior planeta do Sistema Solar, com tempestades gigantes.",
        },
      },
      {
        label: "Saturno",
        path: "assets/Planet-Modelo3D/Saturno.glb",
        targetSize: 3.95,
        position: new THREE.Vector3(20.45, -1.2, -12.45),
        spinSpeed: 0.0023,
        floatAmp: 0.05,
        info: {
          type: "Gigante Gasoso",
          orbit: "6 planeta do Sistema Solar",
          note: "Famoso por seu sistema de aneis extenso e brilhante.",
        },
      },
      {
        label: "Estacao Espacial",
        path: "assets/Planet-Modelo3D/Esta\u00e7\u00e3o-Espacial-Internacional.glb",
        targetSize: 1.2,
        position: new THREE.Vector3(7.65, 1.15, -10.0),
        spinSpeed: 0.0046,
        floatAmp: 0.08,
        info: {
          type: "Estacao Orbital",
          orbit: "Orbitando a Terra",
          note: "Laboratorio espacial para pesquisa cientifica em microgravidade.",
        },
      },
    ];

    const failedModels = [];

    const loadModel = (modelConfig) =>
      new Promise((resolve) => {
        loader.load(
          this.encodeAssetPath(modelConfig.path),
          (gltf) => {
            const modelRoot = gltf?.scene || null;
            if (!modelRoot) {
              resolve(false);
              return;
            }

            const preScaleBounds = new THREE.Box3().setFromObject(modelRoot);
            const preScaleSize = preScaleBounds.getSize(new THREE.Vector3());
            const maxAxis =
              Math.max(preScaleSize.x, preScaleSize.y, preScaleSize.z) || 1;
            const normalizedScale = modelConfig.targetSize / maxAxis;
            modelRoot.scale.setScalar(normalizedScale);

            const centeredBounds = new THREE.Box3().setFromObject(modelRoot);
            const centeredOffset = centeredBounds.getCenter(new THREE.Vector3());
            modelRoot.position.set(
              modelConfig.position.x - centeredOffset.x,
              modelConfig.position.y - centeredOffset.y,
              modelConfig.position.z - centeredOffset.z,
            );

            modelRoot.userData = {
              ...modelRoot.userData,
              spaceExplorerEntity: true,
              label: modelConfig.label,
              spinSpeed: modelConfig.spinSpeed,
              floatAmp: modelConfig.floatAmp,
              baseY: modelRoot.position.y,
              floatOffset: Math.random() * Math.PI * 2,
              modelInfo: modelConfig.info || null,
            };

            if (explorer.labelsContainer) {
              const tag = document.createElement("div");
              tag.className = "space-explorer-label";
              tag.textContent = modelConfig.label;
              explorer.labelsContainer.appendChild(tag);
              modelRoot.userData.labelElement = tag;
            }

            modelRoot.traverse((child) => {
              if (child?.isMesh) {
                child.frustumCulled = true;
                child.castShadow = false;
                child.receiveShadow = false;
                child.userData = {
                  ...child.userData,
                  spaceExplorerRoot: modelRoot,
                };
              }
            });

            explorer.group.add(modelRoot);
            explorer.models.push(modelRoot);
            explorer.interactiveRoots.push(modelRoot);

            resolve(true);
          },
          undefined,
          (error) => {
            console.warn(`Falha ao carregar modelo: ${modelConfig.path}`, error);
            failedModels.push(modelConfig.label);
            resolve(false);
          },
        );
      });

    Promise.all(modelConfigs.map((cfg) => loadModel(cfg))).then((results) => {
      const loadedCount = results.filter(Boolean).length;

      if (!loadedCount) {
        const fallbackGeometry = new THREE.IcosahedronGeometry(1.3, 2);
        const fallbackMaterial = new THREE.MeshStandardMaterial({
          color: 0x5fc7ff,
          emissive: 0x0d2a44,
          roughness: 0.45,
          metalness: 0.35,
        });
        const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial);
        fallbackMesh.position.set(0, 0, -5);
        fallbackMesh.userData = {
          spaceExplorerEntity: true,
          label: "Planeta Procedural",
          spinSpeed: 0.004,
          floatAmp: 0.06,
          baseY: fallbackMesh.position.y,
          floatOffset: Math.random() * Math.PI * 2,
          modelInfo: {
            type: "Fallback 3D",
            orbit: "Modelo de contingencia",
            note: "Exibido quando os GLBs principais nao carregam.",
          },
        };
        explorer.group.add(fallbackMesh);
        explorer.models.push(fallbackMesh);
        explorer.interactiveRoots.push(fallbackMesh);
      }

      if (explorer.hudStatus) {
        if (failedModels.length) {
          explorer.hudStatus.textContent = `${explorer.models.length} modelos carregados. Falha em: ${failedModels.join(", ")}.`;
        } else {
          explorer.hudStatus.textContent = `${explorer.models.length} modelos prontos para exploracao.`;
        }
      }
    });
  }

  bindSpaceExplorerInteractions(explorer) {
    if (!explorer) return;

    const onPointerDown = (event) => {
      if (!explorer.isActive) return;
      explorer.activePointerId = event.pointerId;
      if (typeof explorer.canvas.setPointerCapture === "function") {
        explorer.canvas.setPointerCapture(event.pointerId);
      }

      const hit = this.getSpaceExplorerHit(explorer, event);

      explorer.lastPointerX = event.clientX;
      explorer.lastPointerY = event.clientY;

      if (!hit) {
        explorer.selectedModel = null;
        explorer.isDraggingModel = false;
        explorer.controls.enabled = true;
        this.updateSpaceExplorerHudSelection(explorer, null);
        this.updateSpaceExplorerCursor(explorer, false);
        return;
      }

      explorer.selectedModel = hit;
      explorer.isDraggingModel = true;
      explorer.focusState = null;
      explorer.controls.enabled = false;

      this.updateSpaceExplorerHudSelection(explorer, hit);
      this.updateSpaceExplorerCursor(explorer, true);
    };

    const onPointerMove = (event) => {
      if (!explorer.isActive) return;
      if (
        explorer.activePointerId !== null &&
        event.pointerId !== explorer.activePointerId
      ) {
        return;
      }

      if (explorer.isDraggingModel && explorer.selectedModel) {
        const deltaX = event.clientX - explorer.lastPointerX;
        const deltaY = event.clientY - explorer.lastPointerY;
        explorer.selectedModel.rotation.y += deltaX * 0.0078;
        explorer.selectedModel.rotation.x += deltaY * 0.0054;
        explorer.lastPointerX = event.clientX;
        explorer.lastPointerY = event.clientY;
        return;
      }

      const hit = this.getSpaceExplorerHit(explorer, event);
      explorer.hoveredModel = hit;
      this.updateSpaceExplorerCursor(explorer, false);
    };

    const endDragging = (event) => {
      if (!explorer.isActive) return;
      if (
        event?.pointerId !== undefined &&
        explorer.activePointerId !== null &&
        event.pointerId !== explorer.activePointerId
      ) {
        return;
      }

      if (
        event?.pointerId !== undefined &&
        typeof explorer.canvas.releasePointerCapture === "function"
      ) {
        try {
          explorer.canvas.releasePointerCapture(event.pointerId);
        } catch {
          // no-op: o pointer pode ja ter sido liberado
        }
      }

      explorer.isDraggingModel = false;
      explorer.activePointerId = null;
      explorer.controls.enabled = true;
      this.updateSpaceExplorerCursor(explorer, false);
    };

    const onDoubleClick = (event) => {
      if (!explorer.isActive) return;
      const hit = this.getSpaceExplorerHit(explorer, event);
      if (!hit) return;
      this.focusSpaceExplorerModel(explorer, hit);
    };

    explorer.canvas.addEventListener("pointerdown", onPointerDown);
    explorer.canvas.addEventListener("pointermove", onPointerMove);
    explorer.canvas.addEventListener("pointerup", endDragging);
    explorer.canvas.addEventListener("pointercancel", endDragging);
    explorer.canvas.addEventListener("pointerleave", endDragging);
    explorer.canvas.addEventListener("dblclick", onDoubleClick);

    explorer.canvasHandlers = {
      onPointerDown,
      onPointerMove,
      endDragging,
      onDoubleClick,
    };
  }

  bindSpaceExplorerModeObserver(explorer) {
    if (!explorer || !document.body) return;

    const observer = new MutationObserver(() => {
      this.syncSpaceExplorerMode(explorer);
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    explorer.modeObserver = observer;
  }

  syncSpaceExplorerMode(explorer) {
    if (!explorer) return;
    const isSpaceMode = document.body.classList.contains("space-only-mode");
    if (isSpaceMode === explorer.isActive) return;

    explorer.isActive = isSpaceMode;
    explorer.group.visible = isSpaceMode;
    explorer.controls.enabled = isSpaceMode && !explorer.isDraggingModel;
    explorer.canvas.classList.toggle("space-explorer-enabled", isSpaceMode);
    explorer.canvas.style.pointerEvents = isSpaceMode ? "auto" : "none";
    explorer.labelsContainer?.classList.toggle("active", isSpaceMode);

    if (isSpaceMode) {
      this.resetSpaceExplorerCamera(explorer, true);
      this.updateSpaceExplorerLabels(explorer);
      this.positionSpaceExplorerInfoCard(explorer);
      if (explorer.hudStatus) {
        explorer.hudStatus.textContent =
          "Modo espectador ativo. Clique e arraste nos modelos para manipular.";
      }
    } else {
      explorer.selectedModel = null;
      explorer.hoveredModel = null;
      explorer.isDraggingModel = false;
      explorer.activePointerId = null;
      explorer.focusState = null;
      explorer.canvas.classList.remove("space-explorer-dragging");
      explorer.canvas.classList.remove("space-explorer-hover");
      explorer.camera.position.copy(explorer.idleCamera);
      explorer.camera.lookAt(0, 0, 0);
      if (explorer.infoCard) {
        explorer.infoCard.setAttribute("hidden", "");
      }
      if (explorer.hudStatus) {
        explorer.hudStatus.textContent =
          "Ative o modo espaco para explorar planetas e naves.";
      }
      this.updateSpaceExplorerHudSelection(explorer, null);
    }
  }

  resetSpaceExplorerCamera(explorer, instant = false) {
    if (!explorer) return;

    explorer.focusState = null;
    const defaultTarget =
      explorer.explorerTarget || new THREE.Vector3(8.2, -0.95, -10.8);
    explorer.controls.target.copy(defaultTarget);

    if (instant) {
      explorer.camera.position.copy(explorer.explorerCamera);
      explorer.controls.update();
      return;
    }

    explorer.focusState = {
      targetPosition: explorer.explorerCamera.clone(),
      targetLookAt: defaultTarget.clone(),
    };
  }

  focusSpaceExplorerModel(explorer, model) {
    if (!explorer || !model) return;

    const centerBounds = new THREE.Box3().setFromObject(model);
    const center = centerBounds.getCenter(new THREE.Vector3());
    const size = centerBounds.getSize(new THREE.Vector3());
    const offsetDistance = Math.max(size.length() * 0.78, 3.8);
    const focusPosition = center.clone().add(
      new THREE.Vector3(0.75, Math.max(size.y * 0.25, 0.5), offsetDistance),
    );

    explorer.focusState = {
      targetPosition: focusPosition,
      targetLookAt: center,
    };

    if (explorer.hudStatus) {
      explorer.hudStatus.textContent = `Foco em ${model.userData?.label || "modelo"}.`;
    }
    this.updateSpaceExplorerHudSelection(explorer, model);
  }

  getSpaceExplorerHit(explorer, event) {
    if (!explorer || !explorer.interactiveRoots.length) return null;

    const bounds = explorer.canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return null;

    explorer.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    explorer.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    explorer.raycaster.setFromCamera(explorer.pointer, explorer.camera);

    const intersections = explorer.raycaster.intersectObjects(
      explorer.interactiveRoots,
      true,
    );
    if (!intersections.length) return null;

    return this.resolveSpaceExplorerRoot(intersections[0].object);
  }

  resolveSpaceExplorerRoot(object) {
    let current = object;
    while (current) {
      if (current.userData?.spaceExplorerEntity) return current;
      if (current.userData?.spaceExplorerRoot) return current.userData.spaceExplorerRoot;
      current = current.parent;
    }
    return null;
  }

  updateSpaceExplorerHudSelection(explorer, selectedModel) {
    if (!explorer) return;

    if (explorer.hudSelected) {
      if (!selectedModel) {
        explorer.hudSelected.textContent = "Nenhum modelo selecionado.";
      } else {
        explorer.hudSelected.textContent = `Selecionado: ${selectedModel.userData?.label || "Modelo"}.`;
      }
    }

    this.updateSpaceExplorerInfoCard(explorer, selectedModel);
  }

  positionSpaceExplorerInfoCard(explorer) {
    if (!explorer?.infoCard || !explorer?.hudContainer) return;

    const hudBounds = explorer.hudContainer.getBoundingClientRect();
    explorer.infoCard.style.left = `${hudBounds.left}px`;
    explorer.infoCard.style.top = `${hudBounds.bottom + 10}px`;
    explorer.infoCard.style.width = `${hudBounds.width}px`;
  }

  updateSpaceExplorerInfoCard(explorer, selectedModel) {
    if (!explorer?.infoCard) return;

    if (!selectedModel) {
      explorer.infoCard.setAttribute("hidden", "");
      if (explorer.infoName) explorer.infoName.textContent = "";
      if (explorer.infoMeta) explorer.infoMeta.textContent = "";
      if (explorer.infoDescription) explorer.infoDescription.textContent = "";
      return;
    }

    const modelInfo = selectedModel.userData?.modelInfo || {};
    const modelName = selectedModel.userData?.label || "Modelo";
    const modelType = modelInfo.type || "Objeto Espacial";
    const modelOrbit = modelInfo.orbit || "Sem dado orbital";
    const modelNote = modelInfo.note || "Sem descricao adicional.";

    explorer.infoCard.removeAttribute("hidden");
    this.positionSpaceExplorerInfoCard(explorer);
    if (explorer.infoName) explorer.infoName.textContent = modelName;
    if (explorer.infoMeta) explorer.infoMeta.textContent = `${modelType} • ${modelOrbit}`;
    if (explorer.infoDescription) explorer.infoDescription.textContent = modelNote;
  }

  updateSpaceExplorerCursor(explorer, isDragging) {
    if (!explorer) return;

    const shouldHover = Boolean(explorer.hoveredModel || explorer.selectedModel);
    explorer.canvas.classList.toggle("space-explorer-hover", shouldHover);
    explorer.canvas.classList.toggle(
      "space-explorer-dragging",
      Boolean(isDragging && explorer.selectedModel),
    );
  }

  updateSpaceExplorerLabels(explorer) {
    if (!explorer?.labelsContainer) return;

    if (!explorer.isActive) {
      explorer.models.forEach((model) => {
        const tag = model?.userData?.labelElement;
        if (tag) tag.classList.remove("visible", "active");
      });
      return;
    }

    const canvasBounds = explorer.canvas.getBoundingClientRect();
    if (!canvasBounds.width || !canvasBounds.height) return;

    explorer.models.forEach((model) => {
      const tag = model?.userData?.labelElement;
      if (!tag) return;

      const bounds = new THREE.Box3().setFromObject(model);
      const center = bounds.getCenter(new THREE.Vector3());
      const worldAnchor = center.setY(bounds.max.y + 0.35);
      const projected = worldAnchor.project(explorer.camera);

      const onScreen =
        projected.z > -1 &&
        projected.z < 1 &&
        projected.x >= -1.05 &&
        projected.x <= 1.05 &&
        projected.y >= -1.05 &&
        projected.y <= 1.05;

      if (!onScreen) {
        tag.classList.remove("visible", "active");
        return;
      }

      const x = canvasBounds.left + ((projected.x + 1) * 0.5) * canvasBounds.width;
      const y = canvasBounds.top + ((1 - projected.y) * 0.5) * canvasBounds.height;

      tag.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      tag.classList.add("visible");
      tag.classList.toggle("active", explorer.selectedModel === model);
    });
  }

  animateSpaceExplorer(explorer, elapsed) {
    if (!explorer) return;

    explorer.models.forEach((model) => {
      const spinSpeed = model.userData?.spinSpeed || 0.003;
      const floatAmp = model.userData?.floatAmp || 0;
      const baseY = model.userData?.baseY || 0;
      const floatOffset = model.userData?.floatOffset || 0;

      if (!(explorer.selectedModel === model && explorer.isDraggingModel)) {
        model.rotation.y += spinSpeed;
      }

      if (floatAmp > 0) {
        model.position.y = baseY + Math.sin(elapsed * 0.7 + floatOffset) * floatAmp;
      }
    });

    if (explorer.focusState) {
      explorer.camera.position.lerp(explorer.focusState.targetPosition, 0.085);
      explorer.controls.target.lerp(explorer.focusState.targetLookAt, 0.085);

      const cameraDistance = explorer.camera.position.distanceTo(
        explorer.focusState.targetPosition,
      );
      const targetDistance = explorer.controls.target.distanceTo(
        explorer.focusState.targetLookAt,
      );

      if (cameraDistance < 0.02 && targetDistance < 0.02) {
        explorer.focusState = null;
      }
    }

    explorer.controls.update();
    this.updateSpaceExplorerLabels(explorer);
  }

  initParticles() {
    const container = document.getElementById("particles-container");
    if (!container) return;

    const particleCount = CONFIG.IS_MOBILE ? 40 : 100;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "title-particle";

      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const size = Math.random() * 6 + 2;
      const duration = Math.random() * 6 + 4;
      const delay = Math.random() * 5;

      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;

      // Adicionar brilho variável
      const blur = Math.random() * 4 + 1;
      particle.style.filter = `blur(${blur}px)`;

      const colors = [
        "var(--quantum-primary)",
        "var(--quantum-secondary)",
        "var(--quantum-accent)",
        "var(--quantum-danger)",
        "var(--quantum-success)",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = color;
      particle.style.opacity = (Math.random() * 0.4 + 0.1).toString();

      // Atribuir uma profundidade para parallax CSS se necessário futuramente
      particle.style.setProperty(
        "--particle-z",
        `${Math.random() * 100 - 50}px`,
      );

      container.appendChild(particle);
    }
  }
}

