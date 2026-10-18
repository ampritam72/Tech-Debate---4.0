import React, { useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * CyberBackground:
 * - High-performance dynamic canvas rendering neon-cyan particles
 * - Mobile-optimized ambient light orbs (lowers GPU blur overhead)
 * - Hardware-accelerated cyber circuits & luminous digital grid
 */
export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const isMobile = width < 768;
    // Enhanced particle count with generous size and light color palette
    const count = isMobile ? 18 : Math.min(65, Math.max(32, Math.floor(width / 24)));

    const particles = Array.from({ length: count }, () => {
      const rand = Math.random();
      const isExtraLarge = rand < 0.12;
      const isLarge = rand >= 0.12 && rand < 0.38;

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        baseRadius: isExtraLarge
          ? (isMobile ? 4.2 : 6.0)
          : isLarge
          ? (isMobile ? 2.8 : 4.0)
          : (isMobile ? 1.8 : 2.5),
        vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.45),
        vy: -Math.random() * (isMobile ? 0.3 : 0.45) - 0.12,
        alpha: Math.random() * 0.45 + 0.45, // High luminosity (0.45 - 0.90)
        pulseSpeed: Math.random() * 0.025 + 0.012,
        glowPulse: Math.random() * Math.PI,
        colorType: rand > 0.5 ? 'neonCyan' : rand > 0.2 ? 'electricSky' : 'brightWhite',
      };
    });

    let time = 0;
    const maxLinkDist = isMobile ? 65 : 120;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.015;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around seamlessly
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        p.glowPulse += p.pulseSpeed;
        const currentAlpha = Math.max(0.35, Math.min(0.95, p.alpha + Math.sin(p.glowPulse) * 0.25));

        // Light & vibrant cyan-white palette
        let colorRgb = '165, 243, 252'; // Tailind Cyan-200
        if (p.colorType === 'electricSky') colorRgb = '186, 230, 253'; // Sky-200
        if (p.colorType === 'brightWhite') colorRgb = '240, 249, 255'; // Pure light cyan-white

        // Soft Outer Radiant Halo for larger dots
        if (p.baseRadius > 2.5) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.baseRadius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha * 0.3})`;
          ctx.fill();
        }

        // Core Particle Point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colorRgb}, ${currentAlpha})`;
        ctx.fill();

        // Lightweight luminous connection lines
        let connections = 0;
        const maxConnections = isMobile ? 1 : 3;
        for (let j = i + 1; j < particles.length; j++) {
          if (connections >= maxConnections) break;
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxLinkDist) {
            connections++;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineAlpha = (1 - dist / maxLinkDist) * (isMobile ? 0.12 : 0.22) * currentAlpha;
            ctx.strokeStyle = `rgba(165, 243, 252, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Framer-motion light orbs - disabled on mobile, lightweight on desktop
  const floatingOrbs = useMemo(
    () => [
      {
        id: 1,
        className: 'hidden md:block w-[36rem] h-[36rem] -top-20 left-1/2 -translate-x-1/2 bg-gradient-to-b from-cyan-300/18 via-sky-400/12 to-transparent blur-[80px]',
        animate: { y: [0, -20, 0], opacity: [0.7, 0.9, 0.7] },
        transition: { duration: 10, repeat: Infinity, ease: 'easeInOut' as const },
      },
      {
        id: 2,
        className: 'hidden lg:block w-[28rem] h-[28rem] top-[30%] -left-10 bg-cyan-300/12 blur-[80px]',
        animate: { x: [0, 20, 0], opacity: [0.6, 0.8, 0.6] },
        transition: { duration: 12, repeat: Infinity, ease: 'easeInOut' as const },
      },
      {
        id: 3,
        className: 'hidden lg:block w-[30rem] h-[30rem] top-[60%] -right-10 bg-sky-300/12 blur-[80px]',
        animate: { x: [0, -20, 0], opacity: [0.6, 0.8, 0.6] },
        transition: { duration: 14, repeat: Infinity, ease: 'easeInOut' as const },
      },
    ],
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Mobile static ambient background glow (Zero GPU overhead) */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-blue-950/30 md:hidden" />

      {/* Desktop Framer-Motion Light Orbs */}
      {floatingOrbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full pointer-events-none ${orb.className}`}
          animate={orb.animate}
          transition={orb.transition}
        />
      ))}

      {/* Cyber Circuit Traces */}
      <svg className="absolute left-0 top-0 bottom-0 w-32 h-full opacity-20 dark:opacity-35 text-cyan-300 pointer-events-none hidden md:block" fill="none">
        <path d="M 10 0 L 10 300 L 40 340 L 40 600 L 15 640 L 15 1200 L 45 1250 L 45 2000" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="40" cy="340" r="3" fill="currentColor" />
        <circle cx="15" cy="640" r="3" fill="currentColor" />
      </svg>

      <svg className="absolute right-0 top-0 bottom-0 w-32 h-full opacity-20 dark:opacity-35 text-cyan-300 pointer-events-none hidden md:block" fill="none">
        <path d="M 120 0 L 120 250 L 90 290 L 90 700 L 115 740 L 115 1300 L 85 1350 L 85 2000" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
        <circle cx="90" cy="290" r="3" fill="currentColor" />
        <circle cx="115" cy="740" r="3" fill="currentColor" />
      </svg>

      {/* Luminous Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-50 dark:opacity-65" />

      {/* Live Neon Particles Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-85 dark:opacity-95"
      />
    </div>
  );
};
