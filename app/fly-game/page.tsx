"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type GoodType = "hat" | "bottle" | "vr";
type ItemKind = "good" | "cloud";
type BadgeName = "Kite Dreamer" | "Kite High Flyer" | "Kite Legend";

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
const BASE_WIDTH = 640;
const BASE_HEIGHT = 360;

export default function KiteFlyGamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // image refs
  const kiteImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const bottleImgRef = useRef<HTMLImageElement | null>(null);
  const vrImgRef = useRef<HTMLImageElement | null>(null);

  // state
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [badge, setBadge] = useState<BadgeName>("Kite Dreamer");

  // refs
  const scoreRef = useRef(0);
  const timeRef = useRef(GAME_SECONDS);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { timeRef.current = timeLeft; }, [timeLeft]);

  const kiteX = useRef(BASE_WIDTH / 2);
  const kiteY = useRef(BASE_HEIGHT - 110);
  const kiteW = useRef(72);
  const kiteH = useRef(88);
  const movingLeft = useRef(false);
  const movingRight = useRef(false);
  const movingUp = useRef(false);
  const movingDown = useRef(false);

  const itemsRef = useRef<SpawnedItem[]>([]);
  const lastSpawnGood = useRef(0);
  const lastSpawnCloud = useRef(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const draggingRef = useRef(false);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // 🧠 High-res load images
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
      kite.onload = hat.onload = bottle.onload = vr.onload = onLoad;
    });

  // 🧭 Auto-fit canvas
  const fitCanvasToParent = () => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const parent = canvas.parentElement!;
  const parentW = parent.clientWidth;
  const isMobile = window.innerWidth < 768;
  const parentH = window.innerHeight * (isMobile ? 0.7 : 0.6);
  const screenRatio = parentW / parentH;
  const baseRatio = BASE_WIDTH / BASE_HEIGHT;

  let targetW, targetH;

  if (isMobile) {
    targetW = Math.min(parentW * 1.05, BASE_WIDTH);
    targetH = (targetW / BASE_WIDTH) * BASE_HEIGHT;
  } else {
    if (screenRatio < baseRatio) {
      targetW = parentW;
      targetH = (parentW / BASE_WIDTH) * BASE_HEIGHT;
    } else {
      targetH = parentH;
      targetW = (parentH / BASE_HEIGHT) * BASE_WIDTH;
    }
  }

  const dpr = window.devicePixelRatio || 1;
  dprRef.current = dpr;

  canvas.style.width = `${targetW}px`;
  canvas.style.height = `${targetH}px`;
  canvas.width = Math.floor(targetW * dpr);
  canvas.height = Math.floor(targetH * dpr);
};

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#EAF6FF");
    g.addColorStop(1, "#CFEAFF");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(w * 0.12, h * 0.18, 70, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,220,170,0.35)";
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
    blob(0, 10, 14);
    blob(14, 6, 18);
    blob(30, 12, 12);
    ctx.beginPath();
    ctx.roundRect?.(-4, 16, 44, 14, 7);
    ctx.fill();
    ctx.restore();
  };

  const rectsOverlap = (a: any, b: any) =>
    !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);

  const spawnGood = () => {
  const types: GoodType[] = ["hat", "bottle", "vr"];
  const goodType = types[Math.floor(Math.random() * types.length)];

  let w = 54;
  let h = 54;

  if (window.innerWidth < 768) {
    if (goodType === "hat") {
      w = 48;
      h = 48;
    } else if (goodType === "bottle") {
      w = 46;
      h = 46;
    } else {
      w = 50;
      h = 50;
    }
  } else {
    if (goodType === "hat") {
      w = 54;
      h = 54;
    } else if (goodType === "bottle") {
      w = 52;
      h = 52;
    } else {
      w = 56;
      h = 56;
    }
  }

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
    const w = 64;
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

  const computeBadge = (s: number): BadgeName => {
    if (s >= 600) return "Kite Legend";
    if (s >= 400) return "Kite High Flyer";
    return "Kite Dreamer";
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setGameOver(false);
    setBadge("Kite Dreamer");
    itemsRef.current = [];
    lastSpawnGood.current = 0;
    lastSpawnCloud.current = 0;
    kiteX.current = BASE_WIDTH / 2;
    kiteY.current = window.innerWidth < 768 ? BASE_HEIGHT - 210 : BASE_HEIGHT - 110;
  };

  const tick = (ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = dprRef.current;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const last = lastTsRef.current ?? ts;
    const dt = Math.min(0.034, (ts - last) / 1000);
    lastTsRef.current = ts;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    drawBackground(ctx, w, h);

    const t = ts / 1000;
    for (let i = 0; i < 3; i++) {
      const cx = ((t * 12 + i * 160) % (w + 160)) - 80;
      drawCloud(ctx, cx, 40 + i * 40, 1 + i * 0.08);
    }

    const speed = 200;
    kiteX.current += (movingRight.current ? speed * dt : 0) - (movingLeft.current ? speed * dt : 0);
    kiteY.current += (movingDown.current ? speed * dt : 0) - (movingUp.current ? speed * dt : 0);
    kiteX.current = clamp(kiteX.current, 8, BASE_WIDTH - kiteW.current - 8);
    kiteY.current = clamp(kiteY.current, 8, BASE_HEIGHT - kiteH.current - 8);

    const floatOffset = Math.sin(t * 2.3) * 6;
    const renderY = clamp(kiteY.current + floatOffset, 8, BASE_HEIGHT - kiteH.current - 8);

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
      const sway = Math.sin((it.swingPhase ?? 0) + t * 2) * (it.kind === "good" ? 10 : 6);
      it.y += it.vy * dt;
      it.x = clamp(it.x + sway * dt, 0, BASE_WIDTH - it.w);

if (it.kind === "good") {
  const img =
    it.goodType === "hat"
      ? hatImgRef.current
      : it.goodType === "bottle"
      ? bottleImgRef.current
      : vrImgRef.current;
  if (img) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, it.x, it.y, it.w, it.h);
  }
} else drawCloud(ctx, it.x, it.y, 0.9);

      const kiteRect = { x: kiteX.current, y: renderY, w: kiteW.current, h: kiteH.current };
      const itemRect = { x: it.x, y: it.y, w: it.w, h: it.h };
      if (rectsOverlap(kiteRect, itemRect)) {
        setScore((s) => Math.max(0, s + (it.kind === "good" ? 10 : -10)));
        items.splice(i, 1);
      }
      if (it.y > BASE_HEIGHT + 50) items.splice(i, 1);
    }

    const kiteImg = kiteImgRef.current;
    if (kiteImg) ctx.drawImage(kiteImg, kiteX.current, renderY, kiteW.current, kiteH.current);

    ctx.fillStyle = "#3a2e2a";
    ctx.font = "600 16px Poppins, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${scoreRef.current}`, 16, 26);
    ctx.textAlign = "right";
    ctx.fillText(`Time: ${timeRef.current}s`, w - 16, 26);
    ctx.textAlign = "left";

    ctx.restore();
    if (running && !gameOver) rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    fitCanvasToParent();
    window.addEventListener("resize", fitCanvasToParent);
    return () => window.removeEventListener("resize", fitCanvasToParent);
  }, []);

  useEffect(() => {
    loadImages();
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    const newBadge = computeBadge(score);
    setBadge(newBadge);
  }, [score, running, gameOver]);

  useEffect(() => {
    if (!running || gameOver) return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current!);
          setRunning(false);
          setGameOver(true);
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

  const startGame = () => {
    resetGame();
    setRunning(true);
    spawnCloud();
    spawnCloud();
  };

  const playAgain = () => startGame();

  return (
    <main className="relative overflow-hidden min-h-screen py-20 px-4 bg-gradient-to-b from-[#E8F6FB] to-[#FDFCF8] text-center">
      <div className="mx-auto max-w-[740px]">
        <h1 className="text-center font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-1">
          Kite Fly Game
        </h1>
        <p className="text-center text-sm text-[#6b5a52] mb-5">
          Move the kite left, right, and up. Catch hat, bottle, and VR (+10). Avoid clouds (-10). Time limit: 60s.
        </p>

        <div className="relative rounded-xl p-3 bg-transparent shadow-none border-none">
          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg bg-white/0 touch-none"
              onPointerDown={(e) => { draggingRef.current = true; e.currentTarget.setPointerCapture(e.pointerId); }}
              onPointerUp={(e) => { draggingRef.current = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
              onPointerCancel={(e) => { draggingRef.current = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
              onPointerMove={(e) => {
                if (!draggingRef.current) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;
                const factorX = BASE_WIDTH / rect.width;
                const factorY = BASE_HEIGHT / rect.height;
                const halfW = kiteW.current / 2;
                const halfH = kiteH.current / 2;
                kiteX.current = Math.max(8, Math.min(BASE_WIDTH - kiteW.current - 8, relX * factorX - halfW));
                kiteY.current = Math.max(8, Math.min(BASE_HEIGHT - kiteH.current - 8, relY * factorY - halfH));
              }}
            />
          </div>

          {!running && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={startGame}
                className="px-5 py-3 rounded-lg bg-[#3178C6] text-white font-medium shadow hover:bg-[#2868aa] transition"
              >
                Play Kite Fly Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDF9F3]/80 rounded-xl text-center px-4">
              <h2 className="font-playfair text-3xl text-[#3a2e2a] mb-2">Game Over</h2>
              <p className="text-[#53443f] mb-1">
                Your Score: <span className="font-semibold">{score}</span>
              </p>
              <p className="text-[#53443f] mb-1">
                Badge: <span className="font-semibold">{badge}</span>
              </p>
              <p className="text-[#8a776f] text-xs italic mb-4">Keep flying higher next time!</p>
              <div className="flex gap-3">
                <button
                  onClick={playAgain}
                  className="px-4 py-2 rounded-md bg-[#3178C6] text-white shadow hover:bg-[#2868aa]"
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

        <div className="mt-4 text-center text-xs text-[#6b5a52]">
          Desktop: ← → ↑ to move • Mobile: drag on the canvas
        </div>
      </div>
      {/* Animated clouds */}
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-4 top-6 w-28" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute left-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-6 top-8 w-32" />
      <img src="/images/cloud-2.svg" alt="" className="cloud absolute right-1/4 top-24 w-24" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute right-10 bottom-8 w-40" />
      <img src="/images/cloud-1.svg" alt="" className="cloud absolute left-10 bottom-8 w-40 opacity-70" />

      {/* Kites */}
      <img src="/images/kite-left.svg" alt="" className="kite absolute left-6 md:left-12 top-40 w-20" />
      <img src="/images/kite-right.svg" alt="" className="kite absolute right-6 md:right-12 top-40 w-20 [animation-duration:9s]" />
    </main>
  );
}
