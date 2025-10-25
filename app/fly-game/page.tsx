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
const BASE_WIDTH = 480;
const BASE_HEIGHT = 340;

const BADGE_THRESHOLDS: Record<BadgeName, number> = {
  "Kite Dreamer": 0,
  "Kite High Flyer": 100,
  "Kite Legend": 250,
};

const STORAGE = {
  BEST: "kiteVibe_bestScore",
  BADGES: "kiteVibe_unlockedBadges",
};

export default function KiteFlyGamePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // image refs
  const kiteImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const bottleImgRef = useRef<HTMLImageElement | null>(null);
  const vrImgRef = useRef<HTMLImageElement | null>(null);

  // states
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [badge, setBadge] = useState<BadgeName | null>(null);
  const [badgePopup, setBadgePopup] = useState<BadgeName | null>(null);

  const [bestScore, setBestScore] = useState(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem(STORAGE.BEST);
    return raw ? Number(raw) : 0;
  });
  const [unlockedBadges, setUnlockedBadges] = useState<BadgeName[]>(() => {
    if (typeof window === "undefined") return ["Kite Dreamer"];
    const raw = localStorage.getItem(STORAGE.BADGES);
    return raw ? (JSON.parse(raw) as BadgeName[]) : ["Kite Dreamer"];
  });

  // player
  const kiteX = useRef(BASE_WIDTH / 2);
  const kiteY = useRef(BASE_HEIGHT - 110);
  const kiteW = useRef(72);
  const kiteH = useRef(88);
  const kiteVX = useRef(0);
  const kiteVY = useRef(0);
  const movingLeft = useRef(false);
  const movingRight = useRef(false);
  const movingUp = useRef(false);
  const movingDown = useRef(false);

  // items
  const itemsRef = useRef<SpawnedItem[]>([]);
  const lastSpawnGood = useRef(0);
  const lastSpawnCloud = useRef(0);

  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const dprRef = useRef(1);
  const draggingRef = useRef(false);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // ---------- assets ----------
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

  const fitCanvasToParent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const parentW = parent.clientWidth;
    const targetW = Math.min(parentW * 0.95, 520);
    const targetH = (targetW / BASE_WIDTH) * BASE_HEIGHT; // keep strict 480x340 ratio
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;
    canvas.width = Math.floor(targetW * dpr);
    canvas.height = Math.floor(targetH * dpr);
  };

  // ---------- draw ----------
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
    // @ts-ignore
    ctx.roundRect?.(-4, 16, 44, 14, 7);
    ctx.fill();
    ctx.restore();
  };

  const rectsOverlap = (a: any, b: any) => !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);

  const spawnGood = () => {
    const types: GoodType[] = ["hat", "bottle", "vr"];
    const goodType = types[Math.floor(Math.random() * types.length)];
    const w = 44;
    const h = 44;
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
    if (s >= BADGE_THRESHOLDS["Kite Legend"]) return "Kite Legend";
    if (s >= BADGE_THRESHOLDS["Kite High Flyer"]) return "Kite High Flyer";
    return "Kite Dreamer";
  };

  const maybeUnlockBadge = (b: BadgeName) => {
    if (!unlockedBadges.includes(b)) {
      const next = [...unlockedBadges, b];
      setUnlockedBadges(next);
      localStorage.setItem(STORAGE.BADGES, JSON.stringify(next));
      setBadgePopup(b);
      setTimeout(() => setBadgePopup(null), 1800);
    }
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
  };

  // ---------- main loop ----------
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
    (ctx as any).imageSmoothingEnabled = false;
    drawBackground(ctx, w, h);

    const t = ts / 1000;
    for (let i = 0; i < 3; i++) {
      const cx = ((t * 12 + i * 160) % (w + 160)) - 80;
      drawCloud(ctx, cx, 40 + i * 40, 1 + i * 0.08);
    }

    const speed = 200;
    kiteVX.current = (movingRight.current ? speed : 0) - (movingLeft.current ? speed : 0);
    kiteVY.current = (movingDown.current ? speed : 0) - (movingUp.current ? speed : 0);
    kiteX.current = clamp(kiteX.current + kiteVX.current * dt, 8, BASE_WIDTH - kiteW.current - 8);
    kiteY.current = clamp(kiteY.current + kiteVY.current * dt, 8, BASE_HEIGHT - kiteH.current - 8);

    const floatOffset = Math.sin(t * Math.PI * 2.1) * (movingUp.current || movingDown.current ? 3 : 8);
    const renderKiteY = clamp(kiteY.current + floatOffset, 8, BASE_HEIGHT - kiteH.current - 8);

    lastSpawnGood.current += dt;
    lastSpawnCloud.current += dt;
    if (lastSpawnGood.current > 0.7) { lastSpawnGood.current = 0; spawnGood(); }
    if (lastSpawnCloud.current > 1.1) { lastSpawnCloud.current = 0; spawnCloud(); }

    const items = itemsRef.current;
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      const sway = Math.sin((it.swingPhase ?? 0) + t * 2) * (it.kind === "good" ? 10 : 6);
      it.y += it.vy * dt;
      it.x = clamp(it.x + sway * dt, 0, BASE_WIDTH - it.w);

      if (it.kind === "good") {
        const img = it.goodType === "hat" ? hatImgRef.current : it.goodType === "bottle" ? bottleImgRef.current : vrImgRef.current;
        if (img) ctx.drawImage(img, it.x, it.y, it.w, it.h);
      } else {
        drawCloud(ctx, it.x, it.y, 0.9);
      }

      const kiteRect = { x: kiteX.current, y: renderKiteY, w: kiteW.current, h: kiteH.current };
      const itemRect = { x: it.x, y: it.y, w: it.w, h: it.h };
      if (rectsOverlap(kiteRect, itemRect)) {
        setScore((s) => Math.max(0, s + (it.kind === "good" ? 10 : -10)));
        items.splice(i, 1);
        continue;
      }
      if (it.y > BASE_HEIGHT + 50) items.splice(i, 1);
    }

    const kiteImg = kiteImgRef.current;
    if (kiteImg) ctx.drawImage(kiteImg, kiteX.current, renderKiteY, kiteW.current, kiteH.current);

    ctx.fillStyle = "#2c2c2c";
    ctx.font = "600 16px Poppins, system-ui, sans-serif";
    ctx.fillText(`Score: ${score}`, 16, 26);
    ctx.textAlign = "right";
    ctx.fillText(`Time: ${timeLeft}s`, w - 16, 26);
    ctx.textAlign = "left";

    ctx.restore();

    if (running && !gameOver) rafRef.current = requestAnimationFrame(tick);
  };

  // ---------- effects ----------
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
    if (score >= 250) { setBadge("Kite Legend"); maybeUnlockBadge("Kite Legend"); }
    else if (score >= 100) { setBadge("Kite High Flyer"); maybeUnlockBadge("Kite High Flyer"); }
    else { setBadge("Kite Dreamer"); maybeUnlockBadge("Kite Dreamer"); }
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
          const b = computeBadge(score);
          setBadge(b);
          maybeUnlockBadge(b);
          const nextBest = Math.max(bestScore, score);
          setBestScore(nextBest);
          localStorage.setItem(STORAGE.BEST, String(nextBest));
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

  // ---------- input ----------
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") movingLeft.current = true;
      if (k === "arrowright" || k === "d") movingRight.current = true;
      if (k === "arrowup" || k === "w") movingUp.current = true;
      if (k === "arrowdown" || k === "s") movingDown.current = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "arrowleft" || k === "a") movingLeft.current = false;
      if (k === "arrowright" || k === "d") movingRight.current = false;
      if (k === "arrowup" || k === "w") movingUp.current = false;
      if (k === "arrowdown" || k === "s") movingDown.current = false;
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
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const factorX = BASE_WIDTH / rect.width;
    const factorY = BASE_HEIGHT / rect.height;
    kiteX.current = clamp(relX * factorX - kiteW.current / 2, 8, BASE_WIDTH - kiteW.current - 8);
    kiteY.current = clamp(relY * factorY - kiteH.current / 2, 8, BASE_HEIGHT - kiteH.current - 8);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setGameOver(false);
    setBadge(null);
    itemsRef.current = [];
    kiteX.current = BASE_WIDTH / 2;
    kiteY.current = BASE_HEIGHT - 110;
    setRunning(true);
    spawnCloud();
    spawnCloud();
  };

  const playAgain = () => startGame();

  return (
    <main className="min-h:[calc(100vh-64px)] px-4 pt-20 pb-12 bg-[#FDF9F3]">
      <div className="mx-auto max-w-[560px]">
        <h1 className="text-center font-playfair text-3xl md:text-4xl text-[#3a2e2a] mb-1">Kite Fly Game</h1>
        <p className="text-center text-sm text-[#6b5a52] mb-5">
          Move the kite left, right, and up. Catch hat, bottle, and VR (+10). Avoid clouds (-10). Time limit: 60s.
        </p>

        <div className="relative rounded-xl shadow-sm border border-[#eadfce] bg-white/70 p-3">
          {/* HUD overlay */}
          <div className="absolute top-3 left-3 z-10 text-[13px] font-semibold text-[#3a2e2a] bg-white/70 rounded px-2 py-1 shadow-sm">Score: {score}</div>
          <div className="absolute top-3 right-3 z-10 text-[13px] font-semibold text-[#3a2e2a] bg-white/70 rounded px-2 py-1 shadow-sm">Time: {timeLeft}s</div>

          {/* Badge chips */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex gap-2 text-[11px]">
            {(["Kite Dreamer", "Kite High Flyer", "Kite Legend"] as BadgeName[]).map((b) => (
              <span key={b} className={`px-2 py-1 rounded-full border shadow-sm ${unlockedBadges.includes(b) ? "bg-amber-100 border-amber-300 text-amber-900" : "bg-white/70 border-[#eadfce] text-[#8a776f]"}`}>🏅 {b}</span>
            ))}
          </div>

          {/* Canvas */}
          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-lg bg-white/0 touch-none"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onPointerMove={handlePointerMove}
            />
          </div>

          {/* Start overlay */}
          {!running && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button onClick={startGame} className="px-5 py-3 rounded-lg bg-[#3178C6] text-white font-medium shadow hover:bg-[#2868aa] transition">Play Kite Fly Game</button>
            </div>
          )}

          {/* Live badge popup */}
          {badgePopup && (
            <div className="pointer-events-none absolute top-6 right-6 z-20">
              <div className="animate-in fade-in zoom-in duration-300 px-4 py-2 rounded-xl bg-amber-500 text-white shadow-lg">🏅 {badgePopup} Unlocked!</div>
            </div>
          )}

          {/* Game Over overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#FDF9F3]/80 rounded-xl text-center px-4">
              <h2 className="font-playfair text-3xl text-[#3a2e2a] mb-2">Game Over</h2>
              <p className="text-[#53443f] mb-1">Your Score: <span className="font-semibold">{score}</span></p>
              <p className="text-[#53443f] mb-1">Badge: <span className="font-semibold">{badge ?? "Kite Dreamer"}</span></p>
              <p className="text-[#53443f] mb-2">Best: <span className="font-semibold">{bestScore}</span></p>
              <p className="text-[#8a776f] text-xs italic mb-4">Keep flying higher next time!</p>
              <div className="flex gap-3">
                <button onClick={playAgain} className="px-4 py-2 rounded-md bg-[#3178C6] text-white shadow hover:bg-[#2868aa]">Play Again</button>
                <Link href="/" className="px-4 py-2 rounded-md bg-white border border-[#e5d8c6] text-[#3a2e2a] shadow hover:bg-[#fffaf4]">Back to Home</Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-[#6b5a52]">Desktop: ← → ↑ to move • Mobile: drag on the canvas</div>
      </div>
    </main>
  );
}
