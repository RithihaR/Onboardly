// components/layout/AnimatedGlowBackground.tsx
//
// A slow-drifting glow effect + subtle grid, inspired by Linear's hero
// treatment — but in warm charcoal/orange instead of their blue/purple,
// deliberately avoiding the "generic AI startup" pink-purple gradient look.
//
// Pure CSS (via styled-jsx, built into Next.js — no extra install needed).
// Sits absolutely positioned behind whatever content you render as
// children of the parent with position: relative.

"use client";

export function AnimatedGlowBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ pointerEvents: "none", zIndex: 0 }}>
      <div className="glow glow-1" />
      <div className="glow glow-2" />
      <div className="grid-overlay" />

      <style jsx>{`
        .glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(90px);
          opacity: 0.35;
        }
        .glow-1 {
          width: 480px;
          height: 480px;
          top: -120px;
          left: 8%;
          background: radial-gradient(circle, #f97316 0%, transparent 70%);
          animation: drift1 22s ease-in-out infinite;
        }
        .glow-2 {
          width: 420px;
          height: 420px;
          bottom: -140px;
          right: 10%;
          background: radial-gradient(circle, #fbbf24 0%, transparent 70%);
          animation: drift2 26s ease-in-out infinite;
        }
        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.15); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -30px) scale(1.1); }
        }
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
        }
      `}</style>
    </div>
  );
}