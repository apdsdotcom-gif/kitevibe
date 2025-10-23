"use client";

import { useEffect, useRef, useState } from "react";

type HatMeta = {
  src: string;
  img?: HTMLImageElement;
  naturalW?: number;
  naturalH?: number;
};

const HATS: Record<"black" | "brown", HatMeta> = {
  black: { src: "/images/hat-black.png" },
  brown: { src: "/images/hat-brown.png" },
};

export default function HatStudioPage() {
  // photo states
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [photoNatural, setPhotoNatural] = useState({ w: 0, h: 0 });
  const photoImgRef = useRef<HTMLImageElement | null>(null);

  // preview layout
  const PREVIEW_W = 420; // px
  const [previewH, setPreviewH] = useState<number>(420);

  // hat states
  const [selected, setSelected] = useState<"black" | "brown" | null>(null);
  const [hatPos, setHatPos] = useState({ x: 140, y: 60 }); // top-left (in preview coords)
  const [hatScale, setHatScale] = useState(1); // 0.3 - 3
  const [hatMeta, setHatMeta] = useState<HatMeta | null>(null);

  // drag
  const draggingRef = useRef(false);
  const lastMouseRef = useRef<{ x: number; y: number } | null>(null);

  // canvas for download
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // load hat image metadata when selected
  useEffect(() => {
    if (!selected) return;
    const meta = HATS[selected];
    if (meta.img) {
      setHatMeta(meta);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = meta.src;
    img.onload = () => {
      meta.img = img;
      meta.naturalW = img.naturalWidth || img.width;
      meta.naturalH = img.naturalHeight || img.height;
      setHatMeta({ ...meta });
    };
  }, [selected]);

  // handle photo upload
  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPhotoDataURL(url);

      const img = new Image();
      img.src = url;
      img.onload = () => {
        const natW = img.naturalWidth || img.width;
        const natH = img.naturalHeight || img.height;
        setPhotoNatural({ w: natW, h: natH });

        // set preview height by aspect ratio
        const h = Math.round((PREVIEW_W * natH) / natW);
        setPreviewH(h);

        // place hat near top-center with reasonable size
        setHatScale(0.8);
        const baseW = PREVIEW_W * 0.5 * 0.8; // initial width
        setHatPos({
          x: Math.round((PREVIEW_W - baseW) / 2),
          y: Math.round(h * 0.18),
        });
      };
    };
    reader.readAsDataURL(file);
  };

  // drag handlers
  const onMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => {
    draggingRef.current = false;
    lastMouseRef.current = null;
  };
  const onMouseLeave = () => onMouseUp();
  const onMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const last = lastMouseRef.current;
    if (!last) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    setHatPos((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  // wheel to resize
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const next = Math.max(0.3, Math.min(3, hatScale - e.deltaY * 0.001));
    setHatScale(next);
  };

  // compute hat draw size in preview coords
  const hatPreviewSize = () => {
    if (!hatMeta?.naturalW || !hatMeta?.naturalH) {
      // fallback ratio
      const w = PREVIEW_W * 0.5 * hatScale;
      const h = w * (0.65);
      return { w, h };
    }
    const ratio = hatMeta.naturalH / hatMeta.naturalW;
    const w = PREVIEW_W * 0.5 * hatScale;
    const h = w * ratio;
    return { w, h };
  };

  // download final PNG at full photo resolution
  const onDownload = () => {
    if (!photoDataURL || !hatMeta?.img || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const factor = photoNatural.w / PREVIEW_W; // preview -> original scale
    canvas.width = photoNatural.w;
    canvas.height = photoNatural.h;

    // draw photo
    const base = new Image();
    base.src = photoDataURL;
    base.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

      // draw hat
      const sizePrev = hatPreviewSize();
      const x = Math.round(hatPos.x * factor);
      const y = Math.round(hatPos.y * factor);
      const w = Math.round(sizePrev.w * factor);
      const h = Math.round(sizePrev.h * factor);
      ctx.drawImage(hatMeta.img as HTMLImageElement, x, y, w, h);

      // trigger download
      const link = document.createElement("a");
      link.download = "kite-hat-result.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <main className="min-h-screen bg-cream text-brown px-4 py-10 flex flex-col items-center">
      <h1 className="font-playfair text-4xl mb-3">Kite Hat Studio</h1>
      <p className="max-w-2xl text-center mb-8">
        Upload your photo, choose a hat, drag to position, scroll to resize, and download your retro look.
      </p>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <label className="btn-primary cursor-pointer inline-block">
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          Upload Photo
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm opacity-70">Hat:</span>
          <button
            onClick={() => setSelected("black")}
            className={`px-4 py-2 rounded-full shadow transition ${
              selected === "black" ? "bg-orange-700 text-cream" : "bg-brown text-cream hover:bg-orange-700"
            }`}
          >
            Black
          </button>
          <button
            onClick={() => setSelected("brown")}
            className={`px-4 py-2 rounded-full shadow transition ${
              selected === "brown" ? "bg-orange-700 text-cream" : "bg-brown text-cream hover:bg-orange-700"
            }`}
          >
            Brown
          </button>
        </div>

        <button
          onClick={() => {
            // quick reset hat to top-center
            const size = hatPreviewSize();
            setHatScale(0.8);
            setHatPos({ x: Math.round((PREVIEW_W - size.w) / 2), y: Math.round(previewH * 0.18) });
          }}
          className="btn-outline"
        >
          Reset Hat
        </button>

        <button
          onClick={onDownload}
          disabled={!photoDataURL || !selected}
          className="btn-primary disabled:opacity-50"
        >
          Download PNG
        </button>
      </div>

      {/* Preview */}
      <div
        className="relative rounded-xl shadow-lg border-2 border-brown bg-white overflow-hidden select-none"
        style={{ width: PREVIEW_W, height: previewH }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        onWheel={onWheel}
        title="Drag the hat. Scroll to resize."
      >
        {photoDataURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={(el) => (photoImgRef.current = el)}
            src={photoDataURL}
            alt="Uploaded"
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm opacity-60">
            Upload a photo to start
          </div>
        )}

        {photoDataURL && selected && hatMeta?.img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hatMeta.src}
            alt="Hat"
            className="absolute"
            draggable={false}
            style={{
              left: hatPos.x,
              top: hatPos.y,
              width: hatPreviewSize().w,
              height: hatPreviewSize().h,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
