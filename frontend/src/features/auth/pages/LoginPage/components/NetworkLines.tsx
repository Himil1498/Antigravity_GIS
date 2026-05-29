import React, { useEffect, useRef, useCallback } from 'react';

/**
 * NetworkLines — Premium Canvas-based fiber-optic network animation.
 * 
 * Architecture: 6-layer composited rendering system
 *   L0: Faint orthogonal grid (city-road pattern from video)
 *   L1: Fiber trunk lines with staggered draw-in animation
 *   L2: Branch lines growing from trunks
 *   L3: Data particles streaming left → right along paths
 *   L4: Junction nodes with breathing pulse + ripple
 *   L5: Left-edge bleed glow (video boundary transition)
 * 
 * Design: Premium / barely-noticeable / automatic animation only.
 * Color: Cyan (#22d3ee / #06b6d4) matching app accent palette.
 */

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number; }

interface FiberPath {
  points: Point[];
  width: number;
  opacity: number;
  drawProgress: number;   // 0→1 for draw-in animation
  drawSpeed: number;      // how fast this line draws in
  drawDelay: number;      // seconds before draw starts
  branches: BranchLine[];
}

interface BranchLine {
  startIdx: number;       // which segment of parent to branch from
  angle: number;          // branch angle in radians
  length: number;
  width: number;
  opacity: number;
  drawProgress: number;
}

interface DataParticle {
  pathIdx: number;        // which fiber path
  progress: number;       // 0→1 position along path
  speed: number;          // units per frame
  size: number;
  brightness: number;     // 0→1
  isBranch: boolean;
  branchIdx: number;
}

interface JunctionNode {
  x: number;
  y: number;
  baseRadius: number;
  pulsePhase: number;     // random start phase
  pulseSpeed: number;
  ripplePhase: number;
}

// ─── Configuration ──────────────────────────────────────────────────────────────

const CONFIG = {
  // Grid
  gridSpacing: 40,
  gridOpacity: 0.035,
  gridColor: '#64748b',

  // Fiber trunks
  trunkCount: 5,
  trunkOpacityRange: [0.08, 0.18] as [number, number],
  trunkWidthRange: [1.2, 2.5] as [number, number],
  trunkDrawDuration: [2.5, 4.0] as [number, number], // seconds

  // Branches
  branchesPerTrunk: [1, 3] as [number, number],
  branchLengthRange: [30, 100] as [number, number],
  branchOpacity: 0.08,
  branchWidth: 0.8,

  // Particles
  particleCount: 12,
  particleSpeedRange: [0.001, 0.004] as [number, number],
  particleSizeRange: [1.0, 2.5] as [number, number],

  // Nodes
  nodeBaseRadius: 1.5,
  nodeGlowRadius: 8,

  // Left edge bleed
  edgeBleedWidth: 60,
  edgeBleedOpacity: 0.12,

  // Colors
  primaryCyan: '#22d3ee',
  deepCyan: '#06b6d4',
  darkCyan: '#0891b2',
  coreWhite: '#ecfeff',

  // Fade zones (as fraction of canvas width)
  fadeStartRight: 0.55,  // lines start fading here
  fadeEndRight: 0.95,    // fully transparent here
};

// ─── Utility ────────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function rgbaStr(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Get interpolated point along a polyline path at progress t (0→1)
function getPointOnPath(points: Point[], t: number): Point {
  if (points.length < 2) return points[0] || { x: 0, y: 0 };
  const totalSegments = points.length - 1;
  const segFloat = t * totalSegments;
  const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
  const segT = segFloat - segIdx;
  return {
    x: lerp(points[segIdx].x, points[segIdx + 1].x, segT),
    y: lerp(points[segIdx].y, points[segIdx + 1].y, segT),
  };
}

// ─── Path Generation ────────────────────────────────────────────────────────────

function generateTrunkPaths(w: number, h: number): FiberPath[] {
  const paths: FiberPath[] = [];
  const verticalSpacing = h / (CONFIG.trunkCount + 1);

  for (let i = 0; i < CONFIG.trunkCount; i++) {
    const baseY = verticalSpacing * (i + 1);
    const points: Point[] = [];
    const segmentCount = 8 + randInt(2, 5);
    const segmentWidth = (w * 0.95) / segmentCount;

    for (let s = 0; s <= segmentCount; s++) {
      const x = s * segmentWidth;
      // Gentle sine-wave with random variation — looks like road curves
      const yOffset = Math.sin(s * 0.6 + i * 1.5) * (20 + i * 8) + rand(-15, 15);
      points.push({ x, y: baseY + yOffset });
    }

    // Generate branches
    const branches: BranchLine[] = [];
    const branchCount = randInt(...CONFIG.branchesPerTrunk);
    for (let b = 0; b < branchCount; b++) {
      const startIdx = randInt(1, Math.floor(segmentCount * 0.6));
      branches.push({
        startIdx,
        angle: (Math.random() > 0.5 ? 1 : -1) * rand(0.3, 1.2),
        length: rand(...CONFIG.branchLengthRange),
        width: CONFIG.branchWidth,
        opacity: CONFIG.branchOpacity,
        drawProgress: 0,
      });
    }

    paths.push({
      points,
      width: rand(...CONFIG.trunkWidthRange),
      opacity: rand(...CONFIG.trunkOpacityRange),
      drawProgress: 0,
      drawSpeed: 1 / (rand(...CONFIG.trunkDrawDuration) * 60), // per frame at 60fps
      drawDelay: i * 0.4 + rand(0, 0.3), // staggered
      branches,
    });
  }

  return paths;
}

function generateNodes(paths: FiberPath[]): JunctionNode[] {
  const nodes: JunctionNode[] = [];
  
  paths.forEach(path => {
    // Place nodes at branch points and at random intervals
    path.branches.forEach(branch => {
      if (branch.startIdx < path.points.length) {
        const pt = path.points[branch.startIdx];
        nodes.push({
          x: pt.x,
          y: pt.y,
          baseRadius: CONFIG.nodeBaseRadius + rand(-0.3, 0.5),
          pulsePhase: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.008, 0.02),
          ripplePhase: rand(0, Math.PI * 2),
        });
      }
    });

    // Add a couple random nodes along the path
    for (let n = 0; n < 2; n++) {
      const idx = randInt(2, path.points.length - 2);
      if (idx < path.points.length) {
        nodes.push({
          x: path.points[idx].x,
          y: path.points[idx].y,
          baseRadius: CONFIG.nodeBaseRadius + rand(-0.5, 0.3),
          pulsePhase: rand(0, Math.PI * 2),
          pulseSpeed: rand(0.01, 0.025),
          ripplePhase: rand(0, Math.PI * 2),
        });
      }
    }
  });

  return nodes;
}

function generateParticles(pathCount: number): DataParticle[] {
  const particles: DataParticle[] = [];
  for (let i = 0; i < CONFIG.particleCount; i++) {
    particles.push({
      pathIdx: randInt(0, pathCount - 1),
      progress: rand(0, 1),
      speed: rand(...CONFIG.particleSpeedRange),
      size: rand(...CONFIG.particleSizeRange),
      brightness: rand(0.5, 1),
      isBranch: false,
      branchIdx: 0,
    });
  }
  return particles;
}

// ─── Render Functions ───────────────────────────────────────────────────────────

function getHorizontalFade(x: number, w: number): number {
  const rightFadeStart = w * CONFIG.fadeStartRight;
  const rightFadeEnd = w * CONFIG.fadeEndRight;
  if (x > rightFadeStart) {
    return Math.max(0, 1 - (x - rightFadeStart) / (rightFadeEnd - rightFadeStart));
  }
  return 1;
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.save();
  const spacing = CONFIG.gridSpacing;

  for (let x = 0; x < w; x += spacing) {
    const fade = getHorizontalFade(x, w);
    if (fade <= 0) continue;
    ctx.strokeStyle = rgbaStr(CONFIG.gridColor, CONFIG.gridOpacity * fade);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  for (let y = 0; y < h; y += spacing) {
    ctx.strokeStyle = rgbaStr(CONFIG.gridColor, CONFIG.gridOpacity);
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    // Fade the horizontal lines toward right too
    const fadeEndX = w * CONFIG.fadeEndRight;
    ctx.lineTo(fadeEndX, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFiberPath(
  ctx: CanvasRenderingContext2D,
  path: FiberPath,
  w: number,
  _h: number,
  glowCtx?: CanvasRenderingContext2D
) {
  if (path.drawProgress <= 0) return;

  const pts = path.points;
  const drawEnd = Math.floor(pts.length * path.drawProgress);
  if (drawEnd < 2) return;

  // Draw main trunk
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = path.width;

  // Gradient stroke: manual segment-by-segment for per-segment fading
  for (let i = 0; i < drawEnd - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const fade = getHorizontalFade(midX, w);
    if (fade <= 0) continue;

    const alpha = path.opacity * fade;
    ctx.strokeStyle = rgbaStr(CONFIG.primaryCyan, alpha);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Glow pass
    if (glowCtx) {
      glowCtx.lineCap = 'round';
      glowCtx.lineWidth = path.width + 4;
      glowCtx.strokeStyle = rgbaStr(CONFIG.deepCyan, alpha * 0.4);
      glowCtx.beginPath();
      glowCtx.moveTo(p1.x, p1.y);
      glowCtx.lineTo(p2.x, p2.y);
      glowCtx.stroke();
    }
  }

  ctx.restore();

  // Draw branches
  path.branches.forEach(branch => {
    if (branch.drawProgress <= 0) return;
    if (branch.startIdx >= drawEnd) return;

    const startPt = pts[branch.startIdx];
    const endX = startPt.x + Math.cos(branch.angle) * branch.length * branch.drawProgress;
    const endY = startPt.y + Math.sin(branch.angle) * branch.length * branch.drawProgress;
    const fade = getHorizontalFade(startPt.x, w);
    if (fade <= 0) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineWidth = branch.width;
    ctx.strokeStyle = rgbaStr(CONFIG.primaryCyan, branch.opacity * fade);
    ctx.beginPath();
    ctx.moveTo(startPt.x, startPt.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();
  });
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  particle: DataParticle,
  paths: FiberPath[],
  w: number
) {
  const path = paths[particle.pathIdx];
  if (!path || path.drawProgress < 0.3) return;

  const pt = getPointOnPath(path.points, particle.progress);
  const fade = getHorizontalFade(pt.x, w);
  if (fade <= 0) return;

  const alpha = particle.brightness * fade * 0.7;
  const r = particle.size;

  // Outer glow
  const grad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 5);
  grad.addColorStop(0, rgbaStr(CONFIG.coreWhite, alpha * 0.8));
  grad.addColorStop(0.3, rgbaStr(CONFIG.primaryCyan, alpha * 0.4));
  grad.addColorStop(1, rgbaStr(CONFIG.primaryCyan, 0));

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, r * 5, 0, Math.PI * 2);
  ctx.fill();

  // Core dot
  ctx.fillStyle = rgbaStr(CONFIG.coreWhite, alpha);
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, r * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawNode(
  ctx: CanvasRenderingContext2D,
  node: JunctionNode,
  time: number,
  w: number,
  drawProgress: number
) {
  if (drawProgress < 0.5) return;

  const fade = getHorizontalFade(node.x, w);
  if (fade <= 0) return;

  const pulse = Math.sin(time * node.pulseSpeed + node.pulsePhase) * 0.5 + 0.5;
  const baseAlpha = 0.15 * fade * (drawProgress > 0.8 ? 1 : (drawProgress - 0.5) / 0.3);

  // Ripple ring
  const ripple = (Math.sin(time * 0.015 + node.ripplePhase) * 0.5 + 0.5);
  const rippleR = node.baseRadius * 3 + ripple * 8;
  ctx.save();
  ctx.strokeStyle = rgbaStr(CONFIG.primaryCyan, baseAlpha * 0.3 * (1 - ripple));
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(node.x, node.y, rippleR, 0, Math.PI * 2);
  ctx.stroke();

  // Outer glow
  const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, CONFIG.nodeGlowRadius);
  glowGrad.addColorStop(0, rgbaStr(CONFIG.primaryCyan, baseAlpha * pulse * 0.6));
  glowGrad.addColorStop(1, rgbaStr(CONFIG.primaryCyan, 0));
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(node.x, node.y, CONFIG.nodeGlowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Core dot
  ctx.fillStyle = rgbaStr(CONFIG.coreWhite, baseAlpha * (0.5 + pulse * 0.5));
  ctx.beginPath();
  ctx.arc(node.x, node.y, node.baseRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEdgeBleed(ctx: CanvasRenderingContext2D, h: number) {
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, CONFIG.edgeBleedWidth, 0);
  grad.addColorStop(0, rgbaStr(CONFIG.primaryCyan, CONFIG.edgeBleedOpacity));
  grad.addColorStop(0.4, rgbaStr(CONFIG.deepCyan, CONFIG.edgeBleedOpacity * 0.5));
  grad.addColorStop(1, rgbaStr(CONFIG.primaryCyan, 0));

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CONFIG.edgeBleedWidth, h);
  ctx.restore();
}

// ─── Component ──────────────────────────────────────────────────────────────────

const NetworkLines: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pathsRef = useRef<FiberPath[]>([]);
  const nodesRef = useRef<JunctionNode[]>([]);
  const particlesRef = useRef<DataParticle[]>([]);
  const initializedRef = useRef(false);

  const init = useCallback((w: number, h: number) => {
    pathsRef.current = generateTrunkPaths(w, h);
    nodesRef.current = generateNodes(pathsRef.current);
    particlesRef.current = generateParticles(pathsRef.current.length);
    startTimeRef.current = performance.now();
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowCanvas = glowCanvasRef.current;
    if (!canvas || !glowCanvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const glowCtx = glowCanvas.getContext('2d', { alpha: true });
    if (!ctx || !glowCtx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;

      const w = rect.width;
      const h = rect.height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      glowCanvas.width = w * dpr;
      glowCanvas.height = h * dpr;
      glowCanvas.style.width = `${w}px`;
      glowCanvas.style.height = `${h}px`;
      glowCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-generate geometry for new dimensions
      init(w, h);
    };

    resize();
    window.addEventListener('resize', resize);

    let frame = 0;

    const animate = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) { animRef.current = requestAnimationFrame(animate); return; }

      const w = rect.width;
      const h = rect.height;
      const elapsed = (performance.now() - startTimeRef.current) / 1000;

      // Clear
      ctx.clearRect(0, 0, w, h);
      glowCtx.clearRect(0, 0, w, h);

      // L0 — Grid
      drawGrid(ctx, w, h);

      // L5 — Edge bleed (behind lines)
      const edgePulse = 1 + Math.sin(frame * 0.02) * 0.15;
      ctx.save();
      ctx.globalAlpha = edgePulse;
      drawEdgeBleed(ctx, h);
      ctx.restore();

      // Update draw progress for fiber paths
      const paths = pathsRef.current;
      paths.forEach(path => {
        if (elapsed > path.drawDelay && path.drawProgress < 1) {
          path.drawProgress = Math.min(1, path.drawProgress + path.drawSpeed);
        }
        // Branches start drawing after trunk is 40% done
        if (path.drawProgress > 0.4) {
          path.branches.forEach(branch => {
            if (branch.drawProgress < 1) {
              branch.drawProgress = Math.min(1, branch.drawProgress + 0.008);
            }
          });
        }
      });

      // L1+L2 — Fiber trunks + branches
      paths.forEach(path => {
        drawFiberPath(ctx, path, w, h, glowCtx);
      });

      // L3 — Data particles
      const particles = particlesRef.current;
      particles.forEach(particle => {
        particle.progress += particle.speed;
        if (particle.progress > 1) {
          particle.progress = 0;
          particle.pathIdx = randInt(0, paths.length - 1);
          particle.speed = rand(...CONFIG.particleSpeedRange);
          particle.brightness = rand(0.5, 1);
        }
        drawParticle(ctx, particle, paths, w);
      });

      // L4 — Junction nodes
      const nodes = nodesRef.current;
      const avgProgress = paths.reduce((sum, p) => sum + p.drawProgress, 0) / paths.length;
      nodes.forEach(node => {
        drawNode(ctx, node, frame, w, avgProgress);
      });

      frame++;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [init]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Glow layer — blurred behind main canvas */}
      <canvas
        ref={glowCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(6px)', opacity: 0.5 }}
      />
      {/* Main render canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
};

export default NetworkLines;