import React from 'react';
import { Lottie } from 'lottie-react';

// Bodymovin Lottie JSON animation for Tech Debate clash & podium sound waves
const debateClashLottieData = {
  v: "5.7.8",
  fr: 30,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  nm: "TechDebateSoundWaveAndGlow",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "PulsingCircleOuter",
      sr: 1,
      ks: {
        o: {
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [30] },
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 30, s: [80] },
            { t: 60, s: [30] }
          ]
        },
        r: {
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
            { t: 60, s: [360] }
          ]
        },
        p: { k: [150, 150, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 0, s: [90, 90, 100] },
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 30, s: [110, 110, 100] },
            { t: 60, s: [90, 90, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { k: [220, 220] },
              p: { k: [0, 0] },
              nm: "Ellipse 1"
            },
            {
              ty: "st",
              c: { k: [0, 0.898, 1, 1] },
              o: { k: 100 },
              w: { k: 3 },
              lc: 2,
              lj: 2,
              nm: "Stroke 1"
            },
            {
              ty: "tr",
              p: { k: [0, 0] },
              a: { k: [0, 0] },
              s: { k: [100, 100] },
              r: { k: 0 },
              o: { k: 100 },
              sk: 0,
              sa: 0,
              nm: "Transform"
            }
          ],
          nm: "Group 1"
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "InnerGlowWave",
      sr: 1,
      ks: {
        o: {
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [60] },
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 30, s: [100] },
            { t: 60, s: [60] }
          ]
        },
        r: {
          k: [
            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [360] },
            { t: 60, s: [0] }
          ]
        },
        p: { k: [150, 150, 0] },
        a: { k: [0, 0, 0] },
        s: {
          k: [
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 0, s: [70, 70, 100] },
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 30, s: [85, 85, 100] },
            { t: 60, s: [70, 70, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sr",
              sy: 1,
              d: 1,
              pt: { k: 6 },
              p: { k: [0, 0] },
              r: { k: 0 },
              ir: { k: 60 },
              is: { k: 0 },
              or: { k: 120 },
              os: { k: 0 },
              nm: "Polystar"
            },
            {
              ty: "st",
              c: { k: [0.22, 0.74, 0.97, 1] },
              o: { k: 80 },
              w: { k: 2 },
              lc: 2,
              lj: 2,
              nm: "Stroke 2"
            },
            {
              ty: "fl",
              c: { k: [0, 0.9, 1, 0.08] },
              o: { k: 25 },
              r: 1,
              nm: "Fill 1"
            },
            {
              ty: "tr",
              p: { k: [0, 0] },
              a: { k: [0, 0] },
              s: { k: [100, 100] },
              r: { k: 0 },
              o: { k: 100 },
              sk: 0,
              sa: 0,
              nm: "Transform"
            }
          ],
          nm: "ShapeGroup"
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

interface LottieDebateClashProps {
  className?: string;
  size?: number;
}

export const LottieDebateClash: React.FC<LottieDebateClashProps> = ({ 
  className = '', 
  size = 180 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Background Lottie Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-85">
        <Lottie
          src={debateClashLottieData as any}
          loop
          autoplay
          className="w-full h-full"
        />
      </div>

      {/* Floating Center Tech Debate 4.0 Emblem with Framer Motion glow */}
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-cyan-950/80 dark:bg-cyan-950/90 border border-cyan-400/60 shadow-[0_0_24px_rgba(6,182,212,0.45)] flex flex-col items-center justify-center backdrop-blur-md">
        <span className="font-display font-black text-cyan-300 text-xs tracking-tighter">TD</span>
        <span className="font-mono font-extrabold text-white text-base leading-none text-glow">4.0</span>
        <div className="flex gap-1 mt-1">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
          <span className="w-1 h-1 rounded-full bg-cyan-300" />
        </div>
      </div>
    </div>
  );
};
