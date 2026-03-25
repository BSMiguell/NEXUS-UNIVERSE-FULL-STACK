// ===== SISTEMA DE SONS =====
class QuantumAudio {
  constructor() {
    this.sounds = new Map();
    this.enabled = true;
    this.context = null;
    this.init();
  }
  init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      this.loadSound("hover", this.generateTone(523.25, 0.05));
      this.loadSound("click", this.generateTone(659.25, 0.1));
      this.loadSound("favorite", this.generateTone(1046.5, 0.3));
      this.loadSound("search", this.generateTone(880.0, 0.15));
      this.loadSound("battle", this.generateTone(349.23, 0.4));
      this.loadSound("jump", this.generateTone(587.33, 0.08));
      this.loadSound("attack", this.generateTone(196.0, 0.16));
      this.loadSound("hit", this.generateTone(246.94, 0.12));
      this.loadSound("victory", this.generateTone(1174.66, 0.38));
      this.loadSound("defeat", this.generateTone(130.81, 0.32));
      this.setupEventListeners();
    } catch (error) {
      console.warn("Audio nao disponivel:", error);
      this.enabled = false;
    }
  }
  generateTone(frequency, duration) {
    if (!Number.isFinite(frequency) || !Number.isFinite(duration)) {
      return null;
    }
    return { frequency, duration };
  }
  loadSound(name, soundData) {
    if (!soundData) return;
    this.sounds.set(name, soundData);
  }
  resumeContextIfNeeded() {
    if (!this.context) return;
    if (this.context.state !== "suspended") return;
    this.context.resume().catch(() => {});
  }
  playSound(sound, volume) {
    if (!sound || !this.context) return;
    if (this.context.state !== "running") return;
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);
    oscillator.frequency.setValueAtTime(
      sound.frequency,
      this.context.currentTime,
    );
    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.context.currentTime + sound.duration,
    );
    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + sound.duration);
  }
  play(name, volume = 0.3) {
    if (!this.enabled || !this.sounds.has(name) || !this.context) return;
    try {
      const sound = this.sounds.get(name);
      if (this.context.state === "suspended") {
        this.context
          .resume()
          .then(() => this.playSound(sound, volume))
          .catch(() => {});
        return;
      }
      this.playSound(sound, volume);
    } catch (error) {
      console.warn("Erro ao tocar som:", error);
    }
  }
  setupEventListeners() {
    document.addEventListener(
      "mouseover",
      (e) => {
        if (
          e.target.closest(".quantum-button, .filter-quantum, .quantum-card")
        ) {
          this.play("hover", 0.1);
        }
      },
      true,
    );
    document.addEventListener(
      "click",
      (e) => {
        this.resumeContextIfNeeded();
        if (
          e.target.closest(
            ".quantum-button, .filter-quantum, .pagination-quantum",
          )
        ) {
          this.play("click", 0.2);
        }
        if (e.target.closest(".quantum-favorite")) {
          this.play("favorite", 0.3);
        }
      },
      true,
    );
  }
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
