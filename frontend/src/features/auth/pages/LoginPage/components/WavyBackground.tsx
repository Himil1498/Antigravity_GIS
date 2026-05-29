/**
 * WavyBackground - Animated Canvas Background Effect
 * Renders flowing wave animations with mouse-tracking glow
 * Adapted from Kenrui Networks hero effect for login page
 */

import React, { useRef, useEffect, useCallback } from "react";

interface WaveConfig {
  yFactor: number;
  color: string;
  speed: number;
  amplitude: number;
}

const WAVE_CONFIGS: WaveConfig[] = [
  { yFactor: 0.50, color: "rgba(30, 111, 217, 0.08)", speed: 0.012, amplitude: 50 },
  { yFactor: 0.56, color: "rgba(14, 165, 160, 0.07)", speed: 0.008, amplitude: 65 },
  { yFactor: 0.62, color: "rgba(99, 102, 241, 0.06)", speed: 0.006, amplitude: 80 },
];

const WavyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const offsetsRef = useRef(WAVE_CONFIGS.map(() => 0));
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw waves
    WAVE_CONFIGS.forEach((wave, i) => {
      ctx.beginPath();
      ctx.moveTo(0, h);

      for (let x = 0; x < w; x++) {
        const y =
          h * wave.yFactor +
          Math.sin(x * 0.008 + offsetsRef.current[i]) * wave.amplitude +
          Math.sin(x * 0.003 + offsetsRef.current[i]) * wave.amplitude * 0.6;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();

      offsetsRef.current[i] += wave.speed;
    });

    // Mouse glow
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    if (mx > 0 && my > 0) {
      const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, 250);
      gradient.addColorStop(0, "rgba(30, 111, 217, 0.08)");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      {/* Floating Glow Lights */}
      <div className="sp-wavy-light sp-wavy-light--cyan" />
      <div className="sp-wavy-light sp-wavy-light--violet" />
    </>
  );
};

export default WavyBackground;
