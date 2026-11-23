import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'dot' | 'confetti';
  rot: number;
  vrot: number;
}

interface ShockRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

export interface CanvasFxHandle {
  spawnHitBurst: (clientX: number, clientY: number, color: string) => void;
  spawnCelebration: () => void;
}

export const CanvasFxOverlay = forwardRef<CanvasFxHandle>(function CanvasFxOverlay(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ringsRef = useRef<ShockRing[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    spawnHitBurst(clientX: number, clientY: number, color: string) {
      ringsRef.current.push({
        x: clientX,
        y: clientY,
        radius: 16,
        maxRadius: 96,
        life: 0.36,
        maxLife: 0.36,
        color,
      });

      const count = 12;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const speed = 110 + Math.random() * 170;
        particlesRef.current.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 30,
          life: 0.42 + Math.random() * 0.18,
          maxLife: 0.6,
          size: 3 + Math.random() * 3.5,
          color,
          shape: 'dot',
          rot: 0,
          vrot: 0,
        });
      }
    },

    spawnCelebration() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const palette = ['#fbbf24', '#34d399', '#fb7185', '#38bdf8', '#f5f3ee'];

      for (let i = 0; i < 65; i++) {
        const fromLeft = i % 2 === 0;
        const originX = fromLeft ? w * 0.2 : w * 0.8;
        const originY = h * 0.42;
        const angle = fromLeft
          ? -Math.PI * 0.35 + (Math.random() - 0.5) * 0.9
          : -Math.PI * 0.65 + (Math.random() - 0.5) * 0.9;
        const speed = 220 + Math.random() * 340;
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.15 + Math.random() * 0.75,
          maxLife: 1.9,
          size: 5 + Math.random() * 5,
          color: palette[i % palette.length],
          shape: 'confetti',
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 11,
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const rawDt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = now;
      const dt = Math.min(rawDt, 0.05);

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (!prefersReduced) {
        // Update & draw shockwave rings
        const rings = ringsRef.current;
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i];
          r.life -= dt;
          if (r.life <= 0) {
            rings.splice(i, 1);
            continue;
          }
          const progress = 1 - r.life / r.maxLife;
          const eased = 1 - Math.pow(1 - progress, 3);
          const curRadius = r.radius + (r.maxRadius - r.radius) * eased;
          ctx.save();
          ctx.globalAlpha = (1 - progress) * 0.72;
          ctx.strokeStyle = r.color;
          ctx.lineWidth = 3.5 * (1 - progress) + 1;
          ctx.beginPath();
          ctx.arc(r.x, r.y, curRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Update & draw particles
        const parts = particlesRef.current;
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          p.life -= dt;
          if (p.life <= 0) {
            parts.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += (p.shape === 'confetti' ? 420 : 280) * dt;
          p.vx *= 0.985;
          p.rot += p.vrot * dt;

          const alpha = Math.max(0, Math.min(1, p.life / (p.maxLife * 0.6)));
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          if (p.shape === 'confetti') {
            ctx.rotate(p.rot);
            ctx.fillRect(-p.size * 0.6, -p.size * 0.35, p.size * 1.2, p.size * 0.7);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      rafRef.current = window.requestAnimationFrame(render);
    };

    rafRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 pointer-events-none"
    />
  );
});
