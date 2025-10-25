"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type GoodType = "hat" | "bottle" | "vr";
type ItemKind = "good" | "cloud";

type SpawnedItem = {
  kind: ItemKind;
  goodType?: GoodType;
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  swingPhase?: number;
};

const GAME_SECONDS = 60;
const BASE_WIDTH = 420;
const BASE_HEIGHT = 720;

export default function KiteFlyGamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const kiteImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const bottleImgRef = useRef<HTMLImageElement | null>(null);
  const vrImgRef = useRef<HTMLImageElement | null>(null);

  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [badge, setBadge] = useState<
    "Kite Dreamer" | "Kite High Flyer" | "Kite Legend" | null
  >(null);

  const kiteX = useRef(BASE_WIDTH / 2);
  const kiteY = useRef(BASE_HEIGHT - 110);
  const kiteW = useRef(82);
  const kiteH = useRef(96);
  const kiteVX = useRef(0);
  const movingLeft = useRef(false);
  const movingRight = useRef(false);

  const itemsRef = useRef<SpawnedItem[]>([]);
  const lastSpawnGood = useRef(0);
  const lastSpawnCloud = useRef(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const dprRef = useRef(1);
  const draggingRef = useRef(false);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const loadImages = () =>
    new Promise<void>((resolve) => {
      const kite = new Image();
      kite.src = "/images/kite.png";
      const hat = new Image();
      hat.src = "/images/hat.png";
      const bottle = new Image();
      bottle.src = "/images/bottle.png";
      const vr = new Image();
      vr.src = "/images/vr.png";

      let loaded = 0;
      const onLoad = () => {
        loaded++;
        if (loaded === 4) {
          kiteImgRef.current = kite;
          hatImgRef.current = hat;
          bottleImgRef.current = bottle;
          vrImgRef.current = vr;
          resolve();
        }
      };
      kite.onload = onLoad;
      hat.onload = onLoad;
      bottle.onload = onLoad;
      vr.onload = onLoad;
    });

  const fitCanvasToParent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const parentW = parent.clientWidth;
    const targetW = Math.min(parentW, 520);
    const targetH = (targetW / BASE_WIDTH) * BASE_HEIGHT;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
    canvas.width = Math.floor(targetW * dpr);
    canvas.height = Math.floor(targetH * dpr);
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#FFF9F3");
    g.addColorStop(1, "#FBE6C7");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w * 0.1, h * 0.2, 80, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,230,180,0.4)";
    ctx.fill();
  };

  const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const blob = (bx: number, by: number, r: number) => {
      ctx.beginPath();
      ctx.arc(bx, by, r, 0, Math.PI * 2);
      ctx.fill();
    };
    blob(0, 12, 18);
    blob(18, 8, 22);
    blob(40, 14, 16);
    ctx.beginPath();
    ctx.roundRect(-6, 20, 56, 18, 9);
    ctx.fill();
    ctx.restore();
  };

  const rectsOverlap = (a: any, b: any) =>
    !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);

  const spawnGood = () => {
    const types: GoodType[] = ["hat", "bottle", "vr"];
    const goodType = types[Math.floor(Math.random() * types.length)];
    const w = 48;
    const h = 48;
    itemsRef.current.push({
      kind: "good",
      goodType,
      x: Math.random() * (BASE_WIDTH - w),
      y: -h - 10,
      w,
      h,
      vy: 85 + Math.random() * 60,
      swingPhase: Math.random() * Math.PI * 2,
    });
  };

  const spawnCloud = () => {
    const w = 70;
    const h = 40;
    itemsRef.current.push({
      kind: "cloud",
      x: Math.random() * (BASE_WIDTH - w),
      y: -h - 10,
      w,
      h,
      vy: 55 + Math.random() * 35,
      swingPhase: Math.random() * Math.PI * 2,
    });
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setGameOver(false);
    setBadge(null);
    itemsRef.current = [];
    lastSpawnGood.current = 0;
    lastSpawnCloud.current = 0;
    kiteX.current = BASE_WIDTH / 2;
    kiteY.current = BASE_HEIGHT - 110;
    kiteVX.current = 0;
  };

  const computeBadge = (s: number) => {
    if (s >= 250) return "Kite Legend";
    if (s >= 100) return "Kite High Flyer";
    return "Kite Dreamer";
  };

  const tick = (ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = dprRef.current;
    const w = (canvas.width / dpr) | 0;
    const h = (canvas.height / dpr) | 0;
    const last = lastTsRef.current ?? ts;
    const dt = Math.min(0.034, (ts - last) / 1000);
    lastTsRef.current = ts;

    ctx.save();
    ctx.scale(dpr, dpr);
    drawBackground(ctx, w, h);

    const t = ts / 1000;
    for (let i = 0; i < 3; i++) {
      const cx = ((t * 12 + i * 140) % (w + 160)) - 80;
      const cy = 60 + i * 50;
      drawCloud(ctx, cx, cy, 1 + i * 0.08);
    }

    const speed = 200;
    kiteVX.current =
      (movingRight.current ? speed : 0) - (movingLeft.current ? speed : 0);
    kiteX.current = clamp(
      kiteX.current + kiteVX.current * dt,
      8,
      BASE_WIDTH - kiteW.current - 8
    );

    lastSpawnGood.current += dt;
    lastSpawnCloud.current += dt;
    if (lastSpawnGood.current > 0.7) {
      lastSpawnGood.current = 0;
      spawnGood();
    }
    if (lastSpawnCloud.current > 1.1) {
      lastSpawnCloud.current = 0;
      spawnCloud();
    }

    const items = itemsRef.current;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const sway = Math.sin((it.swingPhase ?? 0) + t * 2) * 10;
      it.y += it.vy * dt;
      it.x = clamp(it.x + sway * dt, 0, BASE_WIDTH - it.w);
      if (it.kind === "good") {
        const img =
          it.goodType === "hat"
            ? hatImgRef.current
            : it.goodType === "bottle"
            ? bottleImgRef.current
            : vrImgRef.current;
        if (img) ctx.drawImage(img, it.x, it.y, it.w, it.h);
      } else {
        drawCloud(ctx, it.x, it.y, 0.9);
      }
      const kiteRect = {
        x: kiteX.current,
        y: kiteY.current,
        w: kiteW.current,
        h: kiteH.current,
      };
      const itemRect = { x: it.x, y: it.y, w: it.w, h: it.h };
      if (rectsOverlap(kiteRect, itemRect)) {
        setScore((s) => s + (it.kind === "good" ? 10 : -10));
        items.splice(i, 1);
        continue;
      }
      if (it.y > BASE_HEIGHT + 60) items.splice(i, 1);
    }

    const kiteImg = kiteImgRef.current;
    if (kiteImg)
      ctx.drawImage(kiteImg, kiteX.current, kiteY.current, kiteW.current, kiteH.current);

    ctx.fillStyle = "#3a2e2a";
    ctx.font = "600 16px Poppins, sans-serif";
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.textAlign = "right";
    ctx.fillText(`Time: ${timeLeft}s`, w - 16, 28);
    ctx.textAlign = "left";

    ctx.restore();
    if (running && !gameOver) rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    fitCanvasToParent();
    const onResize = () => fitCanvasToParent();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current!);
          setRunning(false);
          setGameOver(true);
          setBadge(computeBadge(score));
          return 0;
        }
        return t - 1;
      });
    }, 1000) as unknown as number;
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [running, gameOver]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") movingLeft.current = true;
      if (e.key === "ArrowRight" || e.key === "d") movingRight.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") movingLeft.current = false;
      if (e.key === "ArrowRight" || e.key === "d") movingRight.current = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const cssW = rect.width;
    const factor = BASE_WIDTH / cssW;
    const kiteHalf = kiteW.current / 2;
    kiteX.current = clamp(relX * factor - kiteHalf, 8, BASE_WIDTH - kiteW.current - 8);
  };

  const startGame = () => {
    resetGame();
    setRunning(true);
    spawnCloud();
    spawnCloud();
  };

  const playAgain = () => startGame();

  return (
    <main className="min-h-[calc(100vh-64px)] px-4 pt-24 pb-16 bg-[#FDF9F3]">
      <div className="mx-auto max-w-[560px] text-center">
        <h1 className="font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-2">
          Kite Fly Game
        </h1>
        <p className="text-sm text-[#6b5a52] mb-5">
          Move the kite left–right. Catch hat, bottle, and VR (+10). Avoid clouds (-10).
        </p>

        <div className="relative rounded-xl shadow-md border border-[#eadfce] bg-white/70 p-3">
          <div className="absolute top-3 left-3 z-10 text-[13px] font-semibold text-[#3a2e2a] bg-white/70 rounded px-2 py-1 shadow-sm">
            Score: {score}
          </div>
          <div className="absolute top-3 right-3 z-10 text-[13px] font-semibold text-[#3a2e2a] bg-white/70 rounded px-2 py-1 shadow-sm">
            Time: {timeLeft}s
          </div>

          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg bg-transparent touch-none"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerMove={handlePointerMove}
            />
          </div>

          {!running && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={startGame}
                className="px-5 py-3 rounded-lg bg-[#B17C4A] text-white font-medium shadow hover:bg-[#a06e3f] transition"
              >
                Play Kite Fly Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FDF9F3]/80 rounded-xl text-center px-4">
              <h2 className="font-playfair text-3xl text-[#3a2e2a] mb-1">
                Game Over
              </h2>
              <p className="text-[#53443f] mb-1">
                Your Score: <span className="font-semibold">{score}</span>
              </p>
              <p className="text-[#53443f] text-sm mb-4 italic">
                {badge ? `You earned the "${badge}" badge!` : ""}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={playAgain}
                  className="px-4 py-2 rounded-md bg-[#B17C4A] text-white shadow hover:bg-[#a06e3f]"
                >
                  Play Again
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 rounded-md bg-white border border-[#e5d8c6] text-[#3a2e2a] shadow hover:bg-[#fffaf4]"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-[#6b5a52]">
          Desktop: ← → to move • Mobile: drag on the canvas
        </div>
      </div>
    </main>
  );
}
