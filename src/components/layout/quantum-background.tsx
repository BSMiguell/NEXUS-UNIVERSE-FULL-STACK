import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  alpha: number;
};

export function QuantumBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const particleCount = 42;
    let animationFrame = 0;
    let particles: Particle[] = [];

    const createParticles = (width: number, height: number) =>
      Array.from({ length: particleCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speedX: (Math.random() - 0.5) * 0.18,
        speedY: (Math.random() - 0.5) * 0.18,
        alpha: Math.random() * 0.4 + 0.2,
      }));

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(width, height);
    };

    const render = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      context.clearRect(0, 0, width, height);

      const aura = context.createRadialGradient(
        width * 0.22,
        height * 0.16,
        0,
        width * 0.22,
        height * 0.16,
        width * 0.45,
      );
      aura.addColorStop(0, "rgba(34, 211, 238, 0.14)");
      aura.addColorStop(1, "rgba(34, 211, 238, 0)");
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      const accent = context.createRadialGradient(
        width * 0.82,
        height * 0.12,
        0,
        width * 0.82,
        height * 0.12,
        width * 0.32,
      );
      accent.addColorStop(0, "rgba(244, 63, 94, 0.1)");
      accent.addColorStop(1, "rgba(244, 63, 94, 0)");
      context.fillStyle = accent;
      context.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = height + 10;
        if (particle.y > height + 10) particle.y = -10;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(148, 226, 255, ${particle.alpha})`;
        context.fill();

        const next = particles[index + 1];
        if (next) {
          const distance = Math.hypot(next.x - particle.x, next.y - particle.y);
          if (distance < 170) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(next.x, next.y);
            context.strokeStyle = `rgba(64, 204, 255, ${0.08 - distance / 2500})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      });

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <canvas
        aria-hidden="true"
        className="quantum-bg-canvas absolute inset-0"
        ref={canvasRef}
      />
      <div className="quantum-bg-grid absolute inset-0" />
      <div className="quantum-bg-scanline absolute inset-0" />
      <div className="quantum-bg-glow quantum-bg-glow-left absolute" />
      <div className="quantum-bg-glow quantum-bg-glow-right absolute" />
      <div className="quantum-bg-particles absolute inset-0" />
    </div>
  );
}
