// ===== SISTEMA DE CACHE OTIMIZADO =====
class QuantumCache {
  constructor() {
    this.imageCache = new Map();
    this.assetCache = new Map();
    this.maxCacheSize = 100;
    this.failedImages = new Set();
    this.loadingImages = new Set();
  }

  async cacheImage(src) {
    const normalizedSrc = this.normalizePath(src);

    if (this.failedImages.has(normalizedSrc)) {
      console.warn(`Ignorando imagem previamente falhou: ${normalizedSrc}`);
      return null;
    }

    if (this.imageCache.has(normalizedSrc)) {
      return this.imageCache.get(normalizedSrc);
    }

    if (this.loadingImages.has(normalizedSrc)) {
      console.log(`Imagem já está sendo carregada: ${normalizedSrc}`);
      return null;
    }

    if (this.imageCache.size >= this.maxCacheSize) {
      const firstKey = this.imageCache.keys().next().value;
      this.imageCache.delete(firstKey);
    }

    this.loadingImages.add(normalizedSrc);

    return new Promise((resolve, reject) => {
      const img = new Image();
      const cleanSrc = normalizedSrc.split("?")[0].split("#")[0];
      img.src = cleanSrc;

      const timestamp = Math.floor(Date.now() / 60000);
      const cacheBusterSrc = `${cleanSrc}${cleanSrc.includes("?") ? "&" : "?"}_=${timestamp}`;

      let attempts = 0;
      const maxAttempts = 2;

      const tryLoad = (source, isRetry = false) => {
        attempts++;
        const tempImg = new Image();

        if (isRetry) {
          console.log(`🔄 Tentativa ${attempts} para: ${source}`);
        }

        tempImg.src = source;

        tempImg.onload = () => {
          console.log(`✅ Imagem carregada: ${source}`);
          this.imageCache.set(normalizedSrc, tempImg);
          this.loadingImages.delete(normalizedSrc);
          resolve(tempImg);
        };

        tempImg.onerror = () => {
          if (attempts < maxAttempts) {
            setTimeout(() => {
              tryLoad(cacheBusterSrc, true);
            }, 500);
          } else {
            console.error(
              `❌ Falha ao carregar após ${maxAttempts} tentativas: ${normalizedSrc}`,
            );
            this.failedImages.add(normalizedSrc);
            this.loadingImages.delete(normalizedSrc);
            const fallbackImg = this.createFallbackImage(normalizedSrc);
            this.imageCache.set(normalizedSrc, fallbackImg);
            resolve(fallbackImg);
          }
        };
      };

      tryLoad(cleanSrc);
    });
  }

  normalizePath(path) {
    let normalized = path.replace(/\\/g, "/").replace(/\/+/g, "/").trim();
    if (normalized.includes("assets/images/assets/images/")) {
      normalized = normalized.replace(
        "assets/images/assets/images/",
        "assets/images/",
      );
    }
    if (
      !normalized.startsWith("assets/images/") &&
      !normalized.startsWith("http")
    ) {
      normalized = "assets/images/" + normalized;
    }
    return normalized;
  }

  createFallbackImage(src) {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 400, 600);
    gradient.addColorStop(0, "#0a0a0f");
    gradient.addColorStop(0.5, "#1a1a30");
    gradient.addColorStop(1, "#0a0a0f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    ctx.fillStyle = "rgba(0, 255, 234, 0.1)";
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * 400,
        Math.random() * 600,
        Math.random() * 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }

    ctx.fillStyle = "#00ffea";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("QUANTUM", 200, 250);
    ctx.fillText("IMAGE", 200, 280);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "12px Arial";
    ctx.fillText("Nexus Universe", 200, 320);

    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  }

  async preloadCriticalImages(imageUrls) {
    console.log("🚀 Pré-carregando imagens críticas...");
    const criticalUrls = imageUrls.slice(0, 4);
    const promises = criticalUrls.map((url) =>
      this.cacheImage(url).catch((err) => {
        console.warn(`Pré-carregamento falhou para: ${url}`, err);
        return null;
      }),
    );
    await Promise.allSettled(promises);
    console.log("✅ Pré-carregamento completo");
  }
}
