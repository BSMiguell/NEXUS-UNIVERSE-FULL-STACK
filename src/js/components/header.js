// ===== QUANTUM HEADER EFFECTS 13/10 =====
class QuantumHeaderEffects {
  constructor() {
    this.typingElement = document.getElementById("typingSubtitle");
    this.fluxElement = document.getElementById("quantumFlux");
    this.coreCanvas = document.getElementById("coreCanvas");
    this.orbitalContainer = document.querySelector(".orbital-particles");

    this.textLines = [
      "EXPERIÊNCIA VISUAL QUÂNTICA 10/10",
      "IMERSÃO TOTAL • REALIDADE 3D",
      "SISTEMA DE BATALHA INTELIGENTE",
      "COMANDOS DE VOZ E CONQUISTAS",
    ];
    this.lineIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;

    this.init();
  }

  init() {
    this.typeEffect();
    this.startFluxCounter();
    this.initCoreAnimation();
    this.initOrbitalParticles();
  }

  // Método para atualizar animações quando volta para a página
  refresh() {
    if (this.resizeCanvas) {
      this.resizeCanvas();
    }
    // Garante que o efeito de digitação não parou (embora o setTimeout deva continuar)
    if (!this.typingElement.textContent && !this.isDeleting) {
      this.typeEffect();
    }
  }

  // ----- EFEITO MÁQUINA DE ESCREVER -----
  typeEffect() {
    if (!this.typingElement) return;

    const currentLine = this.textLines[this.lineIndex];

    if (this.isDeleting) {
      this.typingElement.textContent = currentLine.substring(
        0,
        this.charIndex - 1,
      );
      this.charIndex--;
    } else {
      this.typingElement.textContent = currentLine.substring(
        0,
        this.charIndex + 1,
      );
      this.charIndex++;
    }

    if (!this.isDeleting && this.charIndex === currentLine.length) {
      this.isDeleting = true;
      setTimeout(() => this.typeEffect(), 2000);
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.lineIndex = (this.lineIndex + 1) % this.textLines.length;
      setTimeout(() => this.typeEffect(), 500);
    } else {
      const speed = this.isDeleting ? 50 : 100;
      setTimeout(() => this.typeEffect(), speed);
    }
  }

  // ----- CONTADOR DE FLUXO QUÂNTICO -----
  startFluxCounter() {
    if (!this.fluxElement) return;

    let flux = 0;
    setInterval(() => {
      // Simula variação quântica
      flux = Math.floor(Math.random() * 100) + 900; // 900-999
      this.fluxElement.textContent = flux;

      // Muda cor conforme intensidade
      const hue = 180 + (flux - 900) * 0.5;
      this.fluxElement.style.background = `linear-gradient(135deg, hsl(${hue}, 100%, 50%), hsl(${hue + 40}, 100%, 50%))`;
      this.fluxElement.style.webkitBackgroundClip = "text";
      this.fluxElement.style.backgroundClip = "text";
      this.fluxElement.style.color = "transparent";
    }, 2000);
  }

  // ----- ANIMAÇÃO 2D DO NÚCLEO QUÂNTICO (Canvas) -----
  initCoreAnimation() {
    if (!this.coreCanvas) return;

    const ctx = this.coreCanvas.getContext("2d");
    let width, height;

    this.resizeCanvas = () => {
      width = this.coreCanvas.clientWidth;
      height = this.coreCanvas.clientHeight;
      this.coreCanvas.width = width;
      this.coreCanvas.height = height;
    };

    window.addEventListener("resize", this.resizeCanvas);
    this.resizeCanvas();

    let angle = 0;

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      // Centro radiante
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        5,
        width / 2,
        height / 2,
        width / 2,
      );
      gradient.addColorStop(0, "rgba(0, 255, 234, 0.8)");
      gradient.addColorStop(0.5, "rgba(255, 0, 255, 0.4)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, width * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Anéis giratórios
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(
          width / 2,
          height / 2,
          width * (0.3 + i * 0.1),
          height * (0.2 + i * 0.07),
          angle + i * 0.5,
          0,
          Math.PI * 2,
        );
        ctx.strokeStyle = i === 0 ? "#00ffea" : i === 1 ? "#ff00ff" : "#ffff00";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Partículas internas
      for (let i = 0; i < 20; i++) {
        const x = width / 2 + Math.sin(angle + i) * (width * 0.25);
        const y = height / 2 + Math.cos(angle * 0.5 + i) * (height * 0.2);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${(Date.now() * 0.01) % 360}, 100%, 60%)`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#00ffea";
        ctx.fill();
      }

      angle += 0.02;
      requestAnimationFrame(draw);
    };

    draw();
  }

  // ----- PARTÍCULAS ORBITAIS INTERATIVAS -----
  initOrbitalParticles() {
    if (!this.orbitalContainer) return;

    // Adiciona partículas apenas se não houver muitas
    if (this.orbitalContainer.children.length === 0) {
      for (let i = 0; i < 30; i++) {
        const particle = document.createElement("div");
        particle.className = "orbital-particle";
        particle.style.cssText = `
          position: absolute;
          width: ${Math.random() * 6 + 2}px;
          height: ${Math.random() * 6 + 2}px;
          background: hsl(${Math.random() * 360}, 100%, 60%);
          border-radius: 50%;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          filter: blur(1px);
          opacity: ${Math.random() * 0.5 + 0.2};
          animation: floatParticle ${Math.random() * 10 + 10}s linear infinite;
          transform: translateZ(0);
        `;
        this.orbitalContainer.appendChild(particle);
      }
    }
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".quantum-hero")) {
    window.quantumHeaderEffects = new QuantumHeaderEffects();
  }
});
