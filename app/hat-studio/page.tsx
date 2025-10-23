"use client";
import { useRef, useState } from "react";

export default function HatStudioPage() {
  const [photoDataURL, setPhotoDataURL] = useState<string | null>(null);
  const [hat, setHat] = useState<"brown" | "black">("brown");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);

  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const hatImgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataURL(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStart) setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragStart(null);
  const handleZoom = (zoomIn: boolean) =>
    setScale((prev) => Math.max(0.3, zoomIn ? prev + 0.1 : prev - 0.1));

  const handleHatChange = () => setHat((prev) => (prev === "brown" ? "black" : "brown"));

  // 🎯 Gunakan pixel ratio supaya tidak blur & posisi akurat
  const generateCanvas = () => {
    const container = containerRef.current;
    const photo = photoImgRef.current;
    const hatEl = hatImgRef.current;
    if (!container || !photo || !hatEl) return null;

    const ratio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.scale(ratio, ratio);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // gambar foto
    ctx.drawImage(photo, 0, 0, width, height);

    // gambar topi
    const hatWidth = hatEl.width * scale * 0.6;
    const hatHeight = hatEl.height * scale * 0.6;
    const hatX = width / 2 - hatWidth / 2 + offset.x;
    const hatY = height / 4 + offset.y;
    ctx.drawImage(hatEl, hatX, hatY, hatWidth, hatHeight);

    return canvas;
  };

  const handlePreview = () => {
    const canvas = generateCanvas();
    if (canvas) setPreviewURL(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    const canvas = generateCanvas();
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "kite-hat-result.png";
    a.click();
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">Kite Hat Studio</h1>
      <p className="text-center mb-10">
        Upload your photo, adjust your hat, preview it, then download your final result.
      </p>

      <div className="flex flex-col lg:flex-row gap-10 justify-center items-start">
        {/* Area utama */}
        <div
          ref={containerRef}
          className="relative w-72 h-96 bg-cream rounded-xl shadow flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {photoDataURL ? (
            <>
              <img
                ref={photoImgRef}
                src={photoDataURL}
                alt="Uploaded"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                ref={hatImgRef}
                src={`/images/hat-${hat}.png`}
                alt="Hat"
                className="absolute top-1/4 left-1/2 -translate-x-1/2"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transformOrigin: "center top",
                  pointerEvents: "none",
                }}
              />
            </>
          ) : (
            <p className="text-gray-500">Upload a photo to start</p>
          )}
        </div>

        {/* Kontrol */}
        <div className="flex flex-col items-center gap-3">
          <input type="file" accept="image/*" onChange={handleUpload} />
          <button
            onClick={handleHatChange}
            className={`px-4 py-2 rounded-full shadow text-white ${
              hat === "brown" ? "bg-[#8B5E3C]" : "bg-black"
            }`}
          >
            Change Hat ({hat})
          </button>
          <div className="flex gap-3">
            <button onClick={() => handleZoom(true)} className="px-3 py-2 border rounded">
              Zoom In
            </button>
            <button onClick={() => handleZoom(false)} className="px-3 py-2 border rounded">
              Zoom Out
            </button>
          </div>
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-[#C97E4D] text-white rounded shadow"
          >
            Preview Result
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded shadow"
          >
            Download PNG
          </button>

          {previewURL && (
            <div className="w-72 h-96 mt-4 rounded-xl shadow bg-white overflow-hidden">
              <p className="text-center font-semibold mt-2">Preview</p>
              <img
                src={previewURL}
                alt="Preview"
                className="w-full h-full object-contain rounded-b-xl"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
